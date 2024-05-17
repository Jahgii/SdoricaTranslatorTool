import { Inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of, Observable, firstValueFrom, BehaviorSubject, combineLatest, zip, map } from 'rxjs';
import { ILocalization, ILocalizationKey } from '../core/interfaces/i-localizations';
import { decode } from '@msgpack/msgpack';
import { IGamedata } from '../core/interfaces/i-gamedata';
import { ExportPostMessage, IExportPercentages } from '../core/interfaces/i-export';
import { ProgressStatus, IOnMessage } from '../core/interfaces/i-export-progress';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from '../core/services/api.service';
import * as JSZip from 'jszip';
import { LocalStorageService } from '../core/services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { IDialogAsset, LanguageType } from '../core/interfaces/i-dialog-asset';
import { AppModes } from '../core/enums/app-modes';
import { IndexDBService } from '../core/services/index-db.service';
import { ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { IFileControl } from '../core/interfaces/i-file-control';

@Injectable()
export class ExportTranslationService {
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

  public isTranslating$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public filesVerified$: Observable<boolean> = combineLatest(
    [this.obb.verifiedFile$,
    this.localization.verifiedFile$,
    this.gamedata.verifiedFile$],
    (one, two, three) => {
      return one && two && three;
    }
  );
  public filesCompleted$: Observable<boolean> = combineLatest(
    [
      this.obb.progressStatus$,
      this.localization.progressStatus$,
      this.gamedata.progressStatus$
    ],
    (obb, two, three) => {
      return (
        (obb == ProgressStatus.finish || obb == ProgressStatus.retrivingServerDataEmpty)
        && two == ProgressStatus.finish
        && three == ProgressStatus.finish
      );
    }
  );

  public progressPerc$!: Observable<IExportPercentages>;

  constructor(
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private ddS: DeviceDetectorService,
    private lStorage: LocalStorageService,
    private indexedDB: IndexDBService,
    private api: ApiService,
    private translate: TranslateService
  ) {
    this.init();
  }

  private init() {
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let countKeys = this.indexedDB.getCount<number>(ObjectStoreNames.LocalizationKey);
      let countKeysTranslated = this.indexedDB
        .getCursorCount<ILocalizationKey>(ObjectStoreNames.LocalizationKey, e => e.Translated[LanguageType.english]);
      let countDialogs = this.indexedDB
        .getCursorCount<IDialogAsset>(ObjectStoreNames.DialogAsset, e => e.Language === 'english');
      let countDialogsTranslated = this.indexedDB
        .getCursorCount<IDialogAsset>(ObjectStoreNames.DialogAsset, e => e.Language === 'english' && e.Translated === true);

      let result = zip(
        countKeys.success$,
        countKeysTranslated.success$,
        countDialogs.success$,
        countDialogsTranslated.success$
      ).pipe(map(r => { return { Dialogs: r[3] * 100 / r[2], Keys: r[1] * 100 / r[0] } }));

      this.progressPerc$ = result;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      this.progressPerc$ = this.api.getWithHeaders('exportpercentages', { lang: LanguageType.english });
    }


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
      this.obb.skip.next(true);
      this.obb.notSupported?.next(true);
      this.obb.verifiedFile$.next(true);
      this.obb.progressStatus$.next(ProgressStatus.finish);
    }
  }

  public onReject(file: TuiFileLike | readonly TuiFileLike[]): void {
    let alert = this.alerts
      .open(
        'El archivo proporcionado no es valido, verifique que sea el archivo correcto e intente de nuevo.',
        {
          label: 'Error',
          status: 'error',
          autoClose: true
        }
      );

    firstValueFrom(alert);
  }

  public onLoadFile(file: TuiFileLike, fileControl: IFileControl): Observable<TuiFileLike | null> {
    fileControl.verifyingFile$.next(true);

    fileControl.verificationCallback(file as File, fileControl);

    return of(file);
  }

  /**
   * Verified if Obb have the required directories
   */
  public async onVerificationObb(file: File, fileControl: IFileControl) {
    let alert = this.alerts
      .open(
        this.translate.instant('error-file-obb'),
        {
          label: 'Error',
          status: 'error',
          autoClose: true
        }
      );

    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file, {});
    } catch (error) {
      fileControl.verifyingFile$.next(false);
      firstValueFrom(alert);
      fileControl.control.setValue(null);
      return;
    }

    let dialogFolder = this.zipObb.files['assets/DialogAssets/'];

    fileControl.verifyingFile$.next(false);
    if (!dialogFolder) {
      firstValueFrom(alert);
      fileControl.control.setValue(null);
      return;
    }

    fileControl.verifiedFile$.next(true);
  }

  /**
   * Verified if localization file its a correct msgpack file
   * @param file 
   * @param fileControl 
   */
  public async onVerificationLocalization(file: File, fileControl: IFileControl) {
    let alert = this.alerts
      .open(
        'El archivo LOCALIZATION proporcionado no es valido, verifique que sea el archivo correcto e intente de nuevo.',
        {
          label: 'Error',
          status: 'error',
          autoClose: true
        }
      );

    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataLoc = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch (error) {
        fileControl.verifyingFile$.next(false);
        firstValueFrom(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataLoc || !this.dataLoc.C || !this.dataLoc.C['BaseBuff']) {
        firstValueFrom(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);
    };
    reader.readAsArrayBuffer(file);
  }

  /**
   * Verified if gamedata file its a correct msgpack file
   * @param file 
   * @param fileControl 
   */
  public async onVerificationGamedata(file: File, fileControl: IFileControl) {
    let alert = this.alerts
      .open(
        'El archivo GAMEDATA proporcionado no es valido, verifique que sea el archivo correcto e intente de nuevo.',
        {
          label: 'Error',
          status: 'error',
          autoClose: true
        }
      );

    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataGam = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch (error) {
        fileControl.verifyingFile$.next(false);
        firstValueFrom(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataGam || !this.dataGam.C || !this.dataGam.C['BuffInfo']) {
        firstValueFrom(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);
    };
    reader.readAsArrayBuffer(file);
  }

  /**
   * Apply Tranlation use workers if support
   */
  public onApplyTranslation() {
    this.isTranslating$.next(true);
    if (typeof Worker !== 'undefined') this.onApplyTranslationWorkers();
    else this.onApplyTranslationNormal();
  }

  private onApplyTranslationWorkers() {
    const obbWorker = new Worker(new URL('../core/workers/export-obb.worker', import.meta.url));
    const locWorker = new Worker(new URL('../core/workers/export-loc.worker', import.meta.url));
    const gamWorker = new Worker(new URL('../core/workers/export-gam.worker', import.meta.url));

    obbWorker.onmessage = ({ data }) => this.onMessage(data, this.obb);
    locWorker.onmessage = ({ data }) => this.onMessage(data, this.localization);
    gamWorker.onmessage = ({ data }) => this.onMessage(data, this.gamedata);

    if (!this.obb.skip?.value) {
      let message: ExportPostMessage = {
        dbName: this.indexedDB.dbName,
        dbVersion: this.indexedDB.dbVersion,
        appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
        file: this.obb.control.value,
        decodeResult: undefined,
        lang: 'English',
        token: this.lStorage.getToken()
      };

      obbWorker.postMessage(message);
    }
    if (!this.localization.skip?.value) {
      let message: ExportPostMessage = {
        dbName: this.indexedDB.dbName,
        dbVersion: this.indexedDB.dbVersion,
        appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
        file: undefined,
        decodeResult: this.dataLoc,
        lang: 'English',
        token: this.lStorage.getToken()
      };

      locWorker.postMessage(message);
    }
    if (!this.gamedata.skip?.value) {
      let message: ExportPostMessage = {
        dbName: this.indexedDB.dbName,
        dbVersion: this.indexedDB.dbVersion,
        appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
        file: undefined,
        decodeResult: this.dataGam,
        lang: 'English',
        token: this.lStorage.getToken()
      };

      gamWorker.postMessage(message);
    }
  }

  private onMessage(message: IOnMessage, fileControl: IFileControl) {
    if (message.pgState == ProgressStatus.finish && message.blob) {
      fileControl.url = window.URL.createObjectURL(message.blob);
      // this.onAutoDownload(fileControl);
    }

    fileControl.progress$.next(message.pg);
    fileControl.progressStatus$.next(message.pgState);
  }

  private onApplyTranslationNormal() {

  }

  private onAutoDownload(fileControl: IFileControl) {
    if (!fileControl.url) return;
    const a = document.createElement('a');
    a.href = fileControl.url;
    a.download = fileControl.control.value.name;
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

  public onSkipFile(fileControl: IFileControl) {
    fileControl.skip?.next(true);
    fileControl.verifiedFile$.next(true);
    fileControl.progressStatus$.next(ProgressStatus.finish);
  }

}