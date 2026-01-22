import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { ILocalization, ILocalizationCategory, ILocalizationKey } from '../core/interfaces/i-localizations';
import { IGamedata, IGamedataCategory, IGamedataValue } from '../core/interfaces/i-gamedata';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, combineLatest, firstValueFrom, map, of, skipUntil, skipWhile, switchMap, take, takeLast, takeUntil } from 'rxjs';
import { decode } from '@msgpack/msgpack';
import { ProgressStatus } from '../core/interfaces/i-export-progress';
import { TuiFileLike } from '@taiga-ui/kit';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IWizardUpload } from '../core/interfaces/i-wizard-upload';
import { IDialogAsset } from '../core/interfaces/i-dialog-asset';
import { IGroup, ILanguage, IMainGroup } from '../core/interfaces/i-dialog-group';
import { IndexDBService } from '../core/services/index-db.service';
import { LocalStorageService } from '../core/services/local-storage.service';
import { onReadFileDialogFromObb } from './import-logic';
import { OperationLog } from '../core/interfaces/i-import';
import { ImportOBBVerificationPostMessage, WorkerImportOBBVerificationPostMessage, ImportPostMessage } from '../core/interfaces/i-worker';
import { IndexDBErrors, IndexDBSucess, IndexedDBbCustomRequestWorker, ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { AppModes } from '../core/enums/app-modes';
import { IFileControl } from '../core/interfaces/i-file-control';
import { ApiSuccess } from '../core/interfaces/i-api';
import { LanguageOriginService } from '../core/services/language-origin.service';
import { AlertService } from '../core/services/alert.service';
import JSZip from 'jszip';

@Injectable()
export class ImportService implements OnDestroy {
  private zipObb!: JSZip;
  private dataLoc!: ILocalization;
  private dataGam!: IGamedata;

  public obb: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerificationObb.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressStatus>(ProgressStatus.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined,
    skip: new BehaviorSubject<boolean>(false),
    notSupported: new BehaviorSubject<boolean>(false)
  };

  public localization: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerificationLocalization.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressStatus>(ProgressStatus.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined,
    skip: new BehaviorSubject<boolean>(false)
  };

  public gamedata: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerificationGamedata.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressStatus>(ProgressStatus.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined,
    skip: new BehaviorSubject<boolean>(false)
  };

  public isImporting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public filesVerified$: Observable<boolean> = combineLatest(
    [
      this.obb.verifiedFile$,
      this.localization.verifiedFile$,
      this.gamedata.verifiedFile$
    ],
    (one, two, three) => {
      return one && two && three;
    }
  );
  public importsCompleted$: Observable<boolean> = combineLatest(
    [
      this.obb.progressStatus$,
      this.localization.progressStatus$,
      this.gamedata.progressStatus$
    ],
    (one, two, three) => {
      return (one == ProgressStatus.finish && two == ProgressStatus.finish && three == ProgressStatus.finish);
    }
  );

  public configuration: FormGroup = this.fB.group({

  });

  public languagesSelected!: string[];
  public multiLanguage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public defaultLanguage: FormControl = this.fB.control(undefined, Validators.required);
  public languageSelected = false;
  private defaultLangSubs$!: Subscription;

  public dialogAssets: { [language: string]: IDialogAsset[] } = {};
  public dialogAssetsInclude: { [language: string]: boolean } = {};
  public dialogAssetsUploading: { [language: string]: IWizardUpload } = {};
  public dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } } = {};
  public dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } } = {};
  private uploadStackSize = 50;
  private readonly maxThreads = 5;

  private uploadKeysUrl!: 'localizationkeys/bulk' | 'localizationkeys/import';
  private readonly gamedataCategories: IGamedataCategory[] = [];
  private readonly gamedataValues: IGamedataValue[] = [];
  private readonly localizationCategories: ILocalizationCategory[] = [];
  private readonly localizationKeys: ILocalizationKey[] = [];

  public operations$: BehaviorSubject<OperationLog[]> = new BehaviorSubject(new Array());
  public operationsSkip$ = this.operations$
    .asObservable()
    .pipe(map(ops => ops.reduce((acc, cv) => {
      if (cv.translateKey === IndexDBErrors.ConstraintError) acc += 1;
      if (cv.translateKey === ApiSuccess.SkipFiles) acc += cv.data;
      return acc;
    }, 0).toString()));
  public operationsUpdated$ = this.operations$
    .asObservable()
    .pipe(map(ops => ops.reduce((acc, cv) => {
      if (cv.translateKey === IndexDBSucess.KeyUpdated) acc += 1;
      return acc;
    }, 0).toString()));
  public operationsCompleted$ = this.operations$
    .asObservable()
    .pipe(map(ops => ops.reduce((acc, cv) => {
      if (cv.translateKey === IndexDBSucess.FileCompleted) acc += 1;
      return acc;
    }, 0).toString()));
  public canSkip$: WritableSignal<boolean> = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly lStorage: LocalStorageService,
    private readonly iDB: IndexDBService,
    private readonly fB: FormBuilder,
    private readonly ddS: DeviceDetectorService,
    private readonly langService: LanguageOriginService,
    private readonly alert: AlertService,
  ) {
    this.init();
  }

  ngOnDestroy(): void {
    this.defaultLangSubs$.unsubscribe();
  }

  private init() {
    this.switchUploadKeysUrl();

    if (this.langService.languages) this.canSkip$.set(true);

    this.defaultLangSubs$ = this.defaultLanguage
      .valueChanges
      .subscribe(lang => {
        this.lStorage.setDefaultLang(lang);
      });

    this.obb.loadedFile$ = this.obb.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.obb) :
          of(null)
        ))
      );

    this.localization.loadedFile$ = this.localization.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.localization) :
          of(null)
        ))
      );

    this.gamedata.loadedFile$ = this.gamedata.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.gamedata) :
          of(null)
        ))
      );

    if (this.ddS.isMobile()) {
      // this.obb.skip.next(true);
      // this.obb.notSupported?.next(true);
      // this.obb.verifiedFile$.next(true);
      // this.obb.progressStatus$.next(ProgressStatus.finish);
    }
  }

  private async switchUploadKeysUrl() {
    if (this.lStorage.getAppMode() === AppModes.Online)
      await firstValueFrom(this.api.get<{ Bulk: boolean }>('localizationkeys/verified'))
        .then(
          r => {
            this.uploadKeysUrl = r.Bulk ? 'localizationkeys/bulk' : 'localizationkeys/import';
            this.uploadStackSize = r.Bulk ? 500 : 25;
          },
          error => {
          }
        );
  }

  //#region UI
  public onLoadFile(file: TuiFileLike, fileControl: IFileControl): Observable<TuiFileLike | null> {
    fileControl.verifyingFile$.next(true);

    fileControl.verificationCallback(file as File, fileControl);

    return of(file);
  }

  /**
   * Verified if Obb have the required directories
   */
  public async onVerificationObb(file: File, fileControl: IFileControl) {
    console.log("VERIFIEND");
    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert('alert-error', 'error-file-obb', 'accent', 'triangle-alert');
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    console.log({ size: file.size });

    if (typeof Worker !== 'undefined') {
      const obbWorker = new Worker(new URL('../core/workers/obb-verification.worker', import.meta.url));
      obbWorker.onmessage = ({ data }) => this.onVerificationObbWorkerMessage(data, fileControl, obbWorker);

      let message: ImportOBBVerificationPostMessage = {
        file: this.obb.control.value
      };
      if (!this.obb.skip?.value) obbWorker.postMessage(message);
      return;
    }

    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file, {});
      let files = this.zipObb.filter((relativePath, file) => relativePath.includes("assets/DialogAssets/") && !file.dir);
      for (const dF of files) {
        let dialogFile = dF;
        const content = await dialogFile.async("string");
        onReadFileDialogFromObb(
          this.dialogAssets,
          this.dialogAssetsInclude,
          this.dialogAssetsMainGroups,
          this.dialogAssetsGroups,
          content,
          dialogFile.name
        );
      }
    } catch {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert('alert-error', 'error-file-obb', 'accent', 'triangle-alert');
      fileControl.control.setValue(null);
      return;
    }

    let dialogFolder = this.zipObb.files['assets/DialogAssets/'];

    fileControl.verifyingFile$.next(false);
    if (!dialogFolder) {
      this.alert.showAlert('alert-error', 'error-file-obb', 'accent', 'triangle-alert');
      fileControl.control.setValue(null);
      return;
    }

    fileControl.verifiedFile$.next(true);
  }

  /**
   * onmessage callback of Verified Obb Worker
   */
  private onVerificationObbWorkerMessage(data: any, fileControl: IFileControl, worker: Worker) {
    let dType: WorkerImportOBBVerificationPostMessage = data;
    if (dType.message === 'file-error') {
      this.alert.showAlert('alert-error', 'error-file-obb', 'accent', 'triangle-alert');
      fileControl.verifyingFile$.next(false);
      fileControl.control.setValue(null);
      worker.terminate();
    }
    else if (dType.message === 'file-verifying-complete') fileControl.verifyingFile$.next(false);
    else if (dType.message === 'file-verified') {
      this.dialogAssets = dType.dialogAssets ?? {};
      this.dialogAssetsInclude = dType.dialogAssetsInclude ?? {};
      this.dialogAssetsMainGroups = dType.dialogAssetsMainGroups ?? {};
      this.dialogAssetsGroups = dType.dialogAssetsGroups ?? {};
      fileControl.verifiedFile$.next(true);
      worker.terminate();
    }
  }

  /**
   * Verified if localization file its a correct msgpack file
   * @param file 
   * @param fileControl 
   */
  public async onVerificationLocalization(file: File, fileControl: IFileControl) {
    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert('alert-error', 'error-file-localization', 'accent', 'triangle-alert');
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    file.arrayBuffer().then(buffer => {
      try {
        this.dataLoc = decode(buffer) as ILocalization;
      } catch {
        fileControl.verifyingFile$.next(false);
        this.alert.showAlert('alert-error', 'error-file-localization', 'accent', 'triangle-alert');
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataLoc?.C?.['BaseBuff']) {
        this.alert.showAlert('alert-error', 'error-file-localization', 'accent', 'triangle-alert');
        fileControl.control.setValue(null);
        return;
      }

      this.onDecodeLocalization();
      fileControl.verifiedFile$.next(true);

    });
  }

  /**
   * Verified if gamedata file its a correct msgpack file
   * @param file 
   * @param fileControl 
   */
  public async onVerificationGamedata(file: File, fileControl: IFileControl) {
    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert('alert-error', 'error-file-gamedata', 'accent', 'triangle-alert');
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    file.arrayBuffer().then(buffer => {
      try {
        this.dataGam = decode(buffer) as ILocalization;
      } catch {
        fileControl.verifyingFile$.next(false);
        this.alert.showAlert('alert-error', 'error-file-gamedata', 'accent', 'triangle-alert');
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataGam?.C?.['BuffInfo']) {
        this.alert.showAlert('alert-error', 'error-file-gamedata', 'accent', 'triangle-alert');
        fileControl.control.setValue(null);
        return;
      }

      this.onDecodeGamedata(this.dataGam, 'BuffInfo');
      fileControl.verifiedFile$.next(true);

    });
  }

  public onSkipFile(fileControl: IFileControl) {
    fileControl.skip?.next(true);
    fileControl.verifiedFile$.next(true);
    fileControl.progressStatus$.next(ProgressStatus.finish);
  }
  //#endregion

  //#region Import Logic
  public onImportBegins() {
    this.isImporting$.next(true);
    if (typeof Worker !== 'undefined') this.onImportWorkers();
    else this.onImportNormal();
  }

  private onImportWorkers() {
    let importWorker = new Worker(new URL('../core/workers/import.worker', import.meta.url));
    importWorker.onmessage = ({ data }) => {
      let message: IndexedDBbCustomRequestWorker<IDialogAsset | ILanguage | IMainGroup | IGroup> = data;

      let op: OperationLog = {
        file: message.file,
        message: message.message,
        translateKey: message.translateKey,
        data: message.data
      };

      this.operations$.next([...this.operations$.value, op]);

      if (message.file === 'obb') this.obb.progressStatus$.next(ProgressStatus.finish);
      if (message.file === 'gamedata') this.gamedata.progressStatus$.next(ProgressStatus.finish);
      if (message.file === 'localization') this.localization.progressStatus$.next(ProgressStatus.finish);

      if (
        this.obb.progressStatus$.value === ProgressStatus.finish &&
        this.gamedata.progressStatus$.value === ProgressStatus.finish &&
        this.localization.progressStatus$.value === ProgressStatus.finish
      ) importWorker.terminate();
    };

    let dialogAU: string[] = [];

    for (let key in this.dialogAssetsUploading) {
      dialogAU.push(key);
    }

    let message: ImportPostMessage = {
      obbSkip: this.obb.skip.value,
      localizationSkip: this.localization.skip.value,
      gamedataSkip: this.gamedata.skip.value,
      dbName: this.iDB.dbName,
      dbVersion: this.iDB.dbVersion,
      apiUrl: this.lStorage.getAppApiUrl() ?? "",
      apiKey: this.lStorage.getAppApiKey() ?? "",
      token: this.lStorage.getToken() ?? "",
      uploadKeysUrl: this.uploadKeysUrl,
      appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
      dialogAssetsUploading: dialogAU,
      dialogAssets: this.dialogAssets,
      dialogAssetsInclude: this.dialogAssetsInclude,
      dialogAssetsMainGroups: this.dialogAssetsMainGroups,
      dialogAssetsGroups: this.dialogAssetsGroups,
      localizationCategories: this.localizationCategories,
      localizationKeys: this.localizationKeys,
      gamedataCategories: this.gamedataCategories,
      gamedataValues: this.gamedataValues
    };

    importWorker.postMessage(message);
  }

  private onImportNormal() {
    if (!this.obb.skip.value) {
      this.onUploadDialogAssetSelectedLanguages();
      this.onUploadGroups();
    }

    if (!this.localization.skip.value)
      this.onUploadLocalization();

    if (!this.gamedata.skip.value)
      this.onUploadGamedata();

  }

  private async onUploadDialogAssetSelectedLanguages() {
    for (let key in this.dialogAssetsUploading) {
      await this.onUploadDialogAssets(key);
    }
  }

  private async onUploadDialogAssets(language: string) {
    this.dialogAssetsUploading[language].Uploading.next(true);
    let dialogAssets = this.dialogAssets[language];

    while (dialogAssets.length > 0) {
      let dialogsSet = dialogAssets.splice(0, this.uploadStackSize);

      if (this.lStorage.getAppMode() === AppModes.Offline) {
        let flows = this.iDB.postMany(ObjectStoreNames.DialogAsset, dialogsSet)

        flows.success$.subscribe(_ => {
        }, _ => undefined
          , () => this.dialogAssetsUploading[language].Uploading.next(false)
        );

        flows.error$.subscribe(res => {
          let op: OperationLog = {
            file: 'obb',
            message: res.request.error?.message,
            translateKey: res.translateKey,
            data: res.data
          };
          this.operations$.next([...this.operations$.value, op]);
        }, _ => undefined
          , () => undefined
        );
      }
      else if (this.lStorage.getAppMode() === AppModes.Online) {
        await firstValueFrom(this.api.post<{ FileSkip: number }>('dialogassets', dialogsSet))
          .then(
            (result) => {
              this.dialogAssetsUploading[language].FileSkip
                .next(this.dialogAssetsUploading[language].FileSkip.value + result.FileSkip);
            },
            (error) => {

            }
          );
      }

    }

    this.dialogAssetsUploading[language].Uploading.next(false);
  }

  private async onUploadGroups() {
    let languages = [];
    let mainGroups = [];
    let groups = [];
    for (let language in this.dialogAssetsInclude) {
      if (this.dialogAssetsInclude[language] === true) {
        //Populate Main Groups
        for (let key in this.dialogAssetsMainGroups[language]) {
          mainGroups.push(this.dialogAssetsMainGroups[language][key]);
        }

        //Populate Groups
        for (let keyMainGroup in this.dialogAssetsGroups[language]) {
          for (let keyGroup in this.dialogAssetsGroups[language][keyMainGroup]) {
            groups.push(this.dialogAssetsGroups[language][keyMainGroup][keyGroup]);
          }
        }

        //Populate Languages
        let languageO: ILanguage = { Name: language };
        languages.push(languageO);
      }
    }

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let flowsL = this.iDB.postMany(ObjectStoreNames.Languages, languages)
      flowsL.success$.subscribe(_ => {
      }, _ => undefined
        , () => undefined
      );
      flowsL.error$.subscribe(res => {
        let op: OperationLog = {
          file: 'obb-lang',
          message: res.request.error?.message,
          translateKey: res.translateKey,
          data: res.data
        };
        this.operations$.next([...this.operations$.value, op]);
      }, _ => undefined
        , () => undefined
      );

      let flowsMG = this.iDB.postMany(ObjectStoreNames.MainGroup, mainGroups)
      flowsMG.success$.subscribe(_ => {
      }, _ => undefined
        , () => undefined
      );
      flowsMG.error$.subscribe(res => {
        let op: OperationLog = {
          file: 'obb-main',
          message: res.request.error?.message,
          translateKey: res.translateKey,
          data: res.data
        };
        this.operations$.next([...this.operations$.value, op]);
      }, _ => undefined
        , () => undefined
      );

      let flowsG = this.iDB.postMany(ObjectStoreNames.Group, groups)
      flowsG.success$.subscribe(_ => {
      }, _ => undefined
        , () => undefined
      );
      flowsG.error$.subscribe(res => {
        let op: OperationLog = {
          file: 'obb-group',
          message: res.request.error?.message,
          translateKey: res.translateKey,
          data: res.data
        };
        this.operations$.next([...this.operations$.value, op]);
      }, _ => undefined
        , () => undefined
      );
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      await firstValueFrom(this.api.post('languages', languages))
        .then(
          (result) => {
          },
          (error) => {
          }
        );

      await firstValueFrom(this.api.post('maingroups', mainGroups))
        .then(
          (result) => {
          },
          (error) => {
          }
        );

      await firstValueFrom(this.api.post('groups', groups))
        .then(
          (result) => {
          },
          (error) => {
          }
        );
    }

  }

  private async onUploadLocalization() {
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let flowsLC = this.iDB.postMany(ObjectStoreNames.LocalizationCategory, this.localizationCategories)
      flowsLC.success$.subscribe(_ => {
      }, _ => undefined
        , () => undefined
      );
      flowsLC.error$.subscribe(res => {

      }, _ => undefined
        , () => undefined
      );

      while (this.localizationKeys.length > 0) {
        let keysSet = this.localizationKeys.splice(0, this.uploadStackSize);
        let flowsLK = this.iDB.postMany(ObjectStoreNames.LocalizationKey, keysSet);
        flowsLK.success$.subscribe(_ => {
        }, _ => undefined
          , () => undefined
        );
        flowsLK.error$.subscribe(_ => {
        }, _ => undefined
          , () => undefined
        );
      }

    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      await firstValueFrom(this.api.post('localizationcategories', this.localizationCategories))
        .then(
          (result) => {

          },
          (error) => {

          }
        );

      if (typeof Worker === 'undefined') {
        while (this.localizationKeys.length > 0) {
          let keysSet = this.localizationKeys.splice(0, this.uploadStackSize);
          await firstValueFrom(this.api.post<string[]>(this.uploadKeysUrl, keysSet))
            .then(
              (result) => {
                // this.fileProgressBar$.next(this.fileProgressBar$.value + this.uploadStackSize);
                // if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
              },
              (error) => {
              }
            );
        }
      }
      else {
        let spliceCount = Math.ceil(this.localizationKeys.length / this.maxThreads);
        let workers: Worker[] = [];
        for (let threadIndex = 0; threadIndex < this.maxThreads; threadIndex++) {
          workers.push(new Worker(new URL('../core/workers/keys.worker', import.meta.url)));
          workers[threadIndex].onmessage = ({ data }) => {
            if (data.finish)
              workers[data.i].terminate();
          };

          let keys = this.localizationKeys.splice(0, spliceCount);
          let uploadStackSize = this.uploadStackSize;
          let url = this.uploadKeysUrl;
          workers[threadIndex].postMessage({ keys, uploadStackSize, url, threadIndex, token: this.lStorage.getToken() });
        }
      }
    }
  }

  private onDecodeLocalization() {
    for (const categoryName in this.dataLoc.C) {
      let new_category: ILocalizationCategory = {
        Name: categoryName,
        Keys: {},
        KeysTranslated: {}
      }

      for (const k of this.dataLoc.C[categoryName].K) {
        new_category.Keys[k] = this.dataLoc.C[categoryName].D.length
        new_category.KeysTranslated[k] = 0
      }

      this.localizationCategories.push(new_category);

      let langName;
      let keyIndex = this.dataLoc.C[categoryName].K.indexOf('Key');
      let versionIndex = this.dataLoc.C[categoryName].K.indexOf('_version');

      for (const dC of this.dataLoc.C[categoryName].D) {
        let new_key: ILocalizationKey | undefined = undefined;
        for (let langIndex = 0; langIndex < this.dataLoc.C[categoryName].K.length; langIndex++) {
          if (keyIndex === langIndex) continue;
          if (versionIndex === langIndex) continue;
          let keyName = dC[keyIndex]
          let _version = dC[versionIndex]
          langName = this.dataLoc.C[categoryName].K[langIndex];
          let text = dC[langIndex];

          new_key ??= {
            Category: categoryName,
            Name: keyName,
            _version: Number(_version ?? -1),
            Translated: {},
            Original: {},
            Translations: {}
          };

          new_key.Translated[langName] = false;
          new_key.Original[langName] = text;
          new_key.Translations[langName] = "";
        }

        if (new_key) this.localizationKeys.push(new_key);
      }
    }
  }

  private async onUploadGamedata() {
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let flowsGC = this.iDB.postMany(ObjectStoreNames.GamedataCategory, this.gamedataCategories)
      flowsGC.success$.subscribe(_ => {
      }, _ => undefined
        , () => undefined
      );
      flowsGC.error$.subscribe(res => {
        let op: OperationLog = {
          file: 'gamedata-categories',
          message: res.request.error?.message,
          translateKey: res.translateKey,
          data: res.data
        };
        this.operations$.next([...this.operations$.value, op]);
      }, _ => undefined
        , () => undefined
      );

      while (this.gamedataValues.length > 0) {
        let keysSet = this.gamedataValues.splice(0, this.uploadStackSize);
        let flowsGV = this.iDB.postMany(ObjectStoreNames.GamedataValue, keysSet)
        flowsGV.success$.subscribe(_ => {
        }, _ => undefined
          , () => undefined
        );
        flowsGV.error$.subscribe(res => {
          let op: OperationLog = {
            file: 'gamedata-values',
            message: res.request.error?.message,
            translateKey: res.translateKey,
            data: res.data
          };
          this.operations$.next([...this.operations$.value, op]);
        }, _ => undefined
          , () => undefined
        );
      }

    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      await firstValueFrom(this.api.post('gamedatacategories', this.gamedataCategories))
        .then(
          (result) => {

          },
          (error) => {

          }
        );

      while (this.gamedataValues.length > 0) {
        let keysSet = this.gamedataValues.splice(0, this.uploadStackSize);
        await firstValueFrom(this.api.post<string[]>('gamedatavalues/import', keysSet))
          .then(
            (result) => {
              // this.fileProgressBar$.next(this.fileProgressBar$.value + this.uploadStackSize);
              // if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
            },
            (error) => {
            }
          );
      }
    }
  }

  private onDecodeGamedata(decodeResult: IGamedata, category: string) {
    let new_category: IGamedataCategory = {
      Name: category,
      Keys: {}
    }

    for (const k of decodeResult.C[category].K)
      new_category.Keys[k] = decodeResult.C[category].D.length;

    this.gamedataCategories.push(new_category);

    let keyName;
    let idIndex = decodeResult.C[category].K.indexOf('id');

    for (const element of decodeResult.C[category].D) {
      let new_value: IGamedataValue | undefined = undefined;
      for (let keyIndex = 0; keyIndex < decodeResult.C[category].K.length; keyIndex++) {
        let gameDataValueName = element[idIndex]
        keyName = decodeResult.C[category].K[keyIndex];
        let content = element[keyIndex];

        new_value ??= {
          Category: category,
          Name: gameDataValueName,
          Content: {}
        };

        new_value.Content[keyName] = content;
      }

      if (new_value) this.gamedataValues.push(new_value);
    }
  }
  //#endregion

  //#region Import Configuration
  public onSelectLanguage(language: string, $event: boolean) {
    if ($event) this.dialogAssetsUploading[language] = {
      Uploading: new BehaviorSubject(false),
      Uploaded: new BehaviorSubject(false),
      UploadError: new BehaviorSubject(false),
      FileSkip: new BehaviorSubject(0),
      Language: language
    };
    else delete (this.dialogAssetsUploading[language]);

    let index = 0;
    this.languagesSelected = [];
    this.multiLanguage$.next(false);
    for (let key in this.dialogAssetsInclude) {
      if (this.dialogAssetsInclude[key]) {
        this.languageSelected = true;
        this.languagesSelected.push(key);
        index += 1;
        if (index == 1) {
          this.defaultLanguage.patchValue(key);
        }
        else if (index == 2) {
          this.defaultLanguage.patchValue(undefined);
          this.defaultLanguage.updateValueAndValidity();
          this.multiLanguage$.next(true);
        }
      }
    }

    if (index >= 1) return;

    this.defaultLanguage.patchValue(undefined);
    this.languageSelected = false;
  }
  //#endregion
}