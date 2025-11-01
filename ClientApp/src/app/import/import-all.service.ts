import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { IFileControl } from '../core/interfaces/i-file-control';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { ProgressStatus } from '../core/interfaces/i-export-progress';
import { AlertService } from '../core/services/alert.service';
import { decode } from '@msgpack/msgpack';
import { TuiFileLike } from '@taiga-ui/kit';
import { IExportAll } from '../core/interfaces/i-export-all';
import { IndexDBService } from '../core/services/index-db.service';
import { Indexes, ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { IDialogAsset } from '../core/interfaces/i-dialog-asset';
import { ILocalizationCategory, ILocalizationKey } from '../core/interfaces/i-localizations';
import { IGamedataValue } from '../core/interfaces/i-gamedata';
import { ICommonWord } from '../core/interfaces/i-common-word';
import { CommonWordsService } from '../core/services/common-words.service';
import { IGroup, IMainGroup } from '../core/interfaces/i-dialog-group';
import { LanguageTypeReverse } from '../core/enums/languages';
import { LanguageOriginService } from '../core/services/language-origin.service';

@Injectable()
export class ImportAllService {
  private readonly alert = inject(AlertService);
  private readonly loS = inject(LanguageOriginService);
  private readonly cwS = inject(CommonWordsService);
  private readonly indexedDB = inject(IndexDBService);

  private data!: IExportAll;

  public readonly gVReplace: WritableSignal<IGamedataValueImport[]> = signal([]);
  public readonly gVReplaceConflict: WritableSignal<IGamedataValueImport[]> = signal([]);

  public readonly dAReplace: WritableSignal<IDialogAssetImport[]> = signal([]);
  public readonly dAReplaceConflict: WritableSignal<IDialogAssetImport[]> = signal([]);

  public readonly kReplace: WritableSignal<ILocalizationKeyImport[]> = signal([]);
  public readonly kReplaceConflict: WritableSignal<ILocalizationKeyImport[]> = signal([]);

  public readonly cReplace: WritableSignal<ICommonWordImport[]> = signal([]);
  public readonly cReplaceConflict: WritableSignal<ICommonWordImport[]> = signal([]);

  public readonly status = signal(ExportStatus.WaitingFile);

  public dataFile: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerification.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressStatus>(ProgressStatus.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined,
    skip: new BehaviorSubject<boolean>(false),
    notSupported: new BehaviorSubject<boolean>(false)
  };

  constructor() {
    this.dataFile.loadedFile$ = this.dataFile.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.dataFile) :
          of(null)
        ))
      );
  }

  private onLoadFile(file: TuiFileLike, fileControl: IFileControl): Observable<TuiFileLike | null> {
    fileControl.verifyingFile$.next(true);

    fileControl.verificationCallback(file as File, fileControl);

    return of(file);
  }

  /**
     * Verified if data file its a correct msgpack file
     * @param file 
     * @param fileControl 
     */
  private async onVerification(file: File, fileControl: IFileControl) {
    this.status.set(ExportStatus.ReadingFile);
    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert('alert-error', 'error-file-data', 'accent');

      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);

      this.status.set(ExportStatus.WaitingFile);
      return;
    }

    let reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.data = decode(reader.result as ArrayBuffer) as IExportAll;
      } catch {
        fileControl.verifyingFile$.next(false);
        this.alert.showAlert('alert-error', 'error-file-data', 'accent');
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.data?.GV || !this.data?.DA || !this.data?.K || !this.data?.C) {
        this.alert.showAlert('alert-error', 'error-file-data', 'accent');
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);

      Promise.all([
        this.gamedataValues(),
        this.dialogAssets(),
        this.localizationKeys(),
        this.commonWords()
      ]).then(_ => this.status.set(ExportStatus.ImportFile));
    };
    reader.readAsArrayBuffer(file);
  }

  private async gamedataValues() {
    let gvs: IGamedataValueImport[] = [];
    let gvConflicts: IGamedataValueImport[] = [];

    for (const gv of this.data.GV) {
      let gvToReplace: IGamedataValueImport = {
        import: true,
        Category: gv.Category,
        Name: gv.Name,
        Data: gv
      };

      let r = this.indexedDB.getIndex(
        ObjectStoreNames.GamedataValue,
        Indexes.GamedataValue.Name,
        [gv.Category, gv.Name], true
      );
      let gvExist = await firstValueFrom(r.success$);

      if (gvExist) {
        gvToReplace.import = false;
        gvConflicts.push(gvToReplace);
      }
      else {
        gvs.push(gvToReplace);
      }
    }

    this.gVReplaceConflict.set(gvConflicts);
    this.gVReplace.set(gvs);
  }

  private async dialogAssets() {
    let das: IDialogAssetImport[] = [];
    let daConflicts: IDialogAssetImport[] = [];

    for (const da of this.data.DA) {
      let gvToReplace: IDialogAssetImport = {
        import: true,
        Filename: da.Filename,
        Data: da
      };

      let r = this.indexedDB.getIndex<IDialogAsset, ObjectStoreNames.DialogAsset>(
        ObjectStoreNames.DialogAsset,
        Indexes.DialogAsset.Filename,
        da.Filename,
        true
      );
      let daExist = await firstValueFrom(r.success$);

      if (daExist?.Translated) {
        gvToReplace.import = false;
        daConflicts.push(gvToReplace);
      }
      else {
        das.push(gvToReplace);
      }
    }

    this.dAReplaceConflict.set(daConflicts);
    this.dAReplace.set(das);

  }

  private async localizationKeys() {
    let ks: ILocalizationKeyImport[] = [];
    let kConflicts: ILocalizationKeyImport[] = [];

    for (const k of this.data.K) {
      let kToReplace: ILocalizationKeyImport = {
        import: true,
        Category: k.Category,
        Name: k.Name,
        Data: k
      };

      let l = this.data.L;
      let r = this.indexedDB.getIndex<ILocalizationKey, ObjectStoreNames.LocalizationKey>(
        ObjectStoreNames.LocalizationKey,
        Indexes.LocalizationKey.Name,
        [k.Category, k.Name], true
      );
      let kExist = await firstValueFrom(r.success$);

      if (kExist?.Translated[l]) {
        kToReplace.import = false;
        kConflicts.push(kToReplace);
      }
      else {
        ks.push(kToReplace);
      }
    }

    this.kReplaceConflict.set(kConflicts);
    this.kReplace.set(ks);
  }

  private async commonWords() {
    let cs: ICommonWordImport[] = [];
    let cConflicts: ICommonWordImport[] = [];

    for (const c of this.data.C) {
      let cToReplace: ICommonWordImport = {
        import: true,
        Original: c.Original,
        Data: c
      };

      let r = this.indexedDB.getIndex(
        ObjectStoreNames.CommonWord,
        Indexes.CommonWord.Original,
        c.Original,
        true
      );
      let cExist = await firstValueFrom(r.success$);

      if (cExist) {
        cToReplace.import = false;
        cConflicts.push(cToReplace);
      }
      else {
        cs.push(cToReplace);
      }
    }

    this.cReplaceConflict.set(cConflicts);
    this.cReplace.set(cs);
  }

  public async onImport() {
    this.status.set(ExportStatus.ImportingFile);

    Promise.all([
      this.onImportGV(),
      this.onImportDA(),
      this.onImportK(),
      this.onImportC()
    ]).then(async _ => {
      await this.resetAllStates();
      this.status.set(ExportStatus.FileImported)
    });

  }

  private async onImportGV() {
    let gvs = [
      ...this.gVReplace().filter(gv => gv.import),
      ...this.gVReplaceConflict().filter(gv => gv.import)
    ]

    for (const gv of gvs) {
      let r = this.indexedDB.getIndex<IGamedataValue, ObjectStoreNames.GamedataValue>(
        ObjectStoreNames.GamedataValue,
        Indexes.GamedataValue.Name,
        [gv.Category, gv.Name],
        true
      );
      let gvExist = await firstValueFrom(r.success$);

      if (gvExist) {
        gv.Data.Id = gvExist.Id;
        this.indexedDB.put(ObjectStoreNames.GamedataValue, gv.Data);
      }
      else {
        this.indexedDB.post(ObjectStoreNames.GamedataValue, gv.Data);
      }
    }
  }

  private async onImportDA() {
    let das = [
      ...this.dAReplace().filter(da => da.import),
      ...this.dAReplaceConflict().filter(da => da.import)
    ]

    for (const da of das) {
      let r = this.indexedDB.getIndex<IDialogAsset, ObjectStoreNames.DialogAsset>(
        ObjectStoreNames.DialogAsset,
        Indexes.DialogAsset.Filename,
        da.Filename,
        true
      );
      let daExist = await firstValueFrom(r.success$);

      if (daExist) {
        daExist.Model = da.Data.Model;
        daExist.Translated = da.Data.Translated;

        this.indexedDB.put(ObjectStoreNames.DialogAsset, daExist);
      }
      else {
        this.indexedDB.post(ObjectStoreNames.DialogAsset, da.Data);
      }
    }
  }

  private async onImportK() {
    let lang = this.data.L;
    let ks = [
      ...this.kReplace().filter(k => k.import),
      ...this.kReplaceConflict().filter(k => k.import)
    ]

    for (const k of ks) {
      let r = this.indexedDB.getIndex<ILocalizationKey, ObjectStoreNames.LocalizationKey>(
        ObjectStoreNames.LocalizationKey,
        Indexes.LocalizationKey.Name,
        [k.Category, k.Name],
        true
      );
      let kExist = await firstValueFrom(r.success$);

      if (kExist) {
        k.Data.Id = kExist.Id;
        kExist.Translated[lang] = k.Data.Translated[lang];
        kExist.Translations[lang] = k.Data.Translations[lang];
        this.indexedDB.put(ObjectStoreNames.LocalizationKey, kExist);
      }
      else {
        this.indexedDB.post(ObjectStoreNames.LocalizationKey, k.Data);
      }
    }
  }

  private async onImportC() {
    let cs = [
      ...this.cReplace().filter(c => c.import),
      ...this.cReplaceConflict().filter(c => c.import)
    ]

    for (const c of cs) {
      let r = this.indexedDB.getIndex<ICommonWord, ObjectStoreNames.CommonWord>(
        ObjectStoreNames.CommonWord,
        Indexes.CommonWord.Original,
        c.Original,
        true
      );
      let cExist = await firstValueFrom(r.success$);

      if (cExist) {
        c.Data.Id = cExist.Id;
        this.indexedDB.put(ObjectStoreNames.CommonWord, c.Data);
      }
      else {
        this.indexedDB.post(ObjectStoreNames.CommonWord, c.Data);
      }
    }
  }

  private async resetAllStates() {
    let lang = this.data.L;
    let langReverse = LanguageTypeReverse[this.data.L];

    let mainGroupFecth = this.indexedDB.getIndex<IMainGroup[], ObjectStoreNames.MainGroup>(
      ObjectStoreNames.MainGroup,
      Indexes.MainGroup.Language,
      langReverse
    );
    let mgs = await firstValueFrom(mainGroupFecth.success$);

    for (const mg of mgs) {
      let groupFetch = this.indexedDB.getIndex<IGroup[], ObjectStoreNames.Group>(
        ObjectStoreNames.Group,
        Indexes.Group.MainGroup,
        [langReverse, mg.OriginalName]
      );
      let groups = await firstValueFrom(groupFetch.success$);
      let dAtranslatedFiles = 0;

      for (const group of groups) {
        let dasFetch = this.indexedDB.getIndex<IDialogAsset[], ObjectStoreNames.DialogAsset>(
          ObjectStoreNames.DialogAsset,
          Indexes.DialogAsset.Group,
          [langReverse, mg.OriginalName, group.OriginalName]
        );
        let das = await firstValueFrom(dasFetch.success$);
        let groupTranslatedFiles = 0;

        groupTranslatedFiles += das.filter(e => e.Translated).length;

        group.TranslatedFiles = groupTranslatedFiles;
        await firstValueFrom(this.indexedDB.put(ObjectStoreNames.Group, group).success$);
        dAtranslatedFiles += groupTranslatedFiles;
      }

      mg.TranslatedFiles = dAtranslatedFiles;
      await firstValueFrom(this.indexedDB.put(ObjectStoreNames.MainGroup, mg).success$);
    }

    let categoriesFetch = this.indexedDB.getAll<ILocalizationCategory[]>(ObjectStoreNames.LocalizationCategory);
    let categories = await firstValueFrom(categoriesFetch.success$);

    for (const category of categories) {
      let keyFetch = this.indexedDB.getIndex<ILocalizationKey[], ObjectStoreNames.LocalizationKey>(
        ObjectStoreNames.LocalizationKey,
        Indexes.LocalizationKey.Category,
        category.Name
      );
      let keys = await firstValueFrom(keyFetch.success$);

      category.Keys[lang] = keys.length;
      category.KeysTranslated[lang] = keys.filter(e => e.Translated[lang]).length;

      await firstValueFrom(this.indexedDB.put(ObjectStoreNames.LocalizationCategory, category).success$);
    }

    this.loS.language.patchValue(langReverse);
    this.cwS.init();
  }

}

enum ExportStatus {
  WaitingFile = 'waiting-file',
  ReadingFile = 'reading-file',
  ImportFile = 'import-file',
  ImportingFile = 'importing-file',
  FileImported = 'file-imported'
}

interface IGamedataValueImport {
  import: boolean;
  Category: string;
  Name: string;
  Data: IGamedataValue;
};

interface IDialogAssetImport {
  import: boolean;
  Filename: string;
  Data: IDialogAsset;
};

interface ILocalizationKeyImport {
  import: boolean;
  Category: string;
  Name: string;
  Data: ILocalizationKey;
};

interface ICommonWordImport {
  import: boolean;
  Original: string;
  Data: ICommonWord;
};