import { Inject, Injectable, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of, Observable, firstValueFrom, BehaviorSubject, combineLatest, zip, map, shareReplay } from 'rxjs';
import { ILocalization, ILocalizationKey } from '../core/interfaces/i-localizations';
import { decode } from '@msgpack/msgpack';
import { IGamedata } from '../core/interfaces/i-gamedata';
import { ExportPostMessage, IExportPercentages } from '../core/interfaces/i-export';
import { ProgressStatus, IOnMessage } from '../core/interfaces/i-export-progress';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from '../core/services/api.service';
import { LocalStorageService } from '../core/services/local-storage.service';
import { TranslateService } from '@ngx-translate/core';
import { IDialogAsset } from '../core/interfaces/i-dialog-asset';
import { AppModes } from '../core/enums/app-modes';
import { IndexDBService } from '../core/services/index-db.service';
import { ObjectStoreNames } from '../core/interfaces/i-indexed-db';
import { IFileControl } from '../core/interfaces/i-file-control';
import { LanguageType } from '../core/enums/languages';
import { LanguageOriginService } from '../core/services/language-origin.service';
import JSZip from 'jszip';

@Injectable()
export class ExportTranslationService {
  private zipObb!: JSZip;
  private dataLoc!: ILocalization;
  private dataGam!: IGamedata;

  public readonly exportMessages: WritableSignal<string[]> = signal([]);

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

  public exportStatus = signal(ProgressStatus.waiting);

  constructor(
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
    private readonly ddS: DeviceDetectorService,
    private readonly lStorage: LocalStorageService,
    private readonly indexedDB: IndexDBService,
    readonly languageOrigin: LanguageOriginService,
    private readonly api: ApiService,
    private readonly translate: TranslateService
  ) {
    this.init();
  }

  private init() {
    this.languageOrigin.language$
      .subscribe((langReverse: string) => {
        const lang = (LanguageType as any)[this.lStorage.getDefaultLang()];

        if (this.lStorage.getAppMode() === AppModes.Offline) {
          let countKeys = this.indexedDB.getCount<number>(ObjectStoreNames.LocalizationKey);
          let countKeysTranslated = this.indexedDB
            .getCursorCount<ILocalizationKey>(ObjectStoreNames.LocalizationKey, e => e.Translated[lang]);
          let countDialogs = this.indexedDB
            .getCursorCount<IDialogAsset>(ObjectStoreNames.DialogAsset, e => e.Language === langReverse);
          let countDialogsTranslated = this.indexedDB
            .getCursorCount<IDialogAsset>(ObjectStoreNames.DialogAsset, e => e.Language === langReverse && e.Translated);

          let result = zip(
            countKeys.success$,
            countKeysTranslated.success$,
            countDialogs.success$,
            countDialogsTranslated.success$
          ).pipe(map(r => { return { Dialogs: r[3] * 100 / r[2], Keys: r[1] * 100 / r[0] } }));

          this.progressPerc$ = result;
        }
        else if (this.lStorage.getAppMode() === AppModes.Online) {
          this.progressPerc$ = this.api.getWithHeaders('exports/percentages', { lang: lang });
        }
      });

    this.obb.loadedFile$ = this.obb.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.obb) :
          of(null)
        )),
        shareReplay()
      );

    this.localization.loadedFile$ = this.localization.control
      .valueChanges
      .pipe(

        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.localization) :
          of(null)
        )),
        shareReplay()
      );

    this.gamedata.loadedFile$ = this.gamedata.control
      .valueChanges
      .pipe(
        switchMap(file =>
        (file ?
          this.onLoadFile(file, this.gamedata) :
          of(null)
        )),
        shareReplay()
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
        this.translate.instant('alert-wrong-file-label'),
        {
          label: 'Error',
          appearance: 'error',
          autoClose: 3_000
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
          appearance: 'error',
          autoClose: 3_000
        }
      );

    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file, {});
    } catch {
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
        this.translate.instant('error-file-localization'),
        {
          label: 'Error',
          appearance: 'error',
          autoClose: 3_000
        }
      );

    let reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataLoc = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch {
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
        this.translate.instant('error-file-gamedata'),
        {
          label: 'Error',
          appearance: 'error',
          autoClose: 3_000
        }
      );

    let reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataGam = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch {
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
    const lang = (LanguageType as any)[this.lStorage.getDefaultLang()];
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
        apiUrl: this.lStorage.getAppApiUrl() ?? "",
        apiKey: this.lStorage.getAppApiKey() ?? "",
        file: this.obb.control.value,
        decodeResult: undefined,
        lang: lang,
        token: this.lStorage.getToken(),
        exportMode: 'game-file'
      };

      obbWorker.postMessage(message);
    }
    if (!this.localization.skip?.value) {
      let message: ExportPostMessage = {
        dbName: this.indexedDB.dbName,
        dbVersion: this.indexedDB.dbVersion,
        appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
        apiUrl: this.lStorage.getAppApiUrl() ?? "",
        apiKey: this.lStorage.getAppApiKey() ?? "",
        file: undefined,
        decodeResult: this.dataLoc,
        lang: lang,
        token: this.lStorage.getToken(),
        exportMode: 'game-file'
      };

      locWorker.postMessage(message);
    }
    if (!this.gamedata.skip?.value) {
      let message: ExportPostMessage = {
        dbName: this.indexedDB.dbName,
        dbVersion: this.indexedDB.dbVersion,
        appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
        apiUrl: this.lStorage.getAppApiUrl() ?? "",
        apiKey: this.lStorage.getAppApiKey() ?? "",
        file: undefined,
        decodeResult: this.dataGam,
        lang: lang,
        token: this.lStorage.getToken(),
        exportMode: 'game-file'
      };

      gamWorker.postMessage(message);
    }
  }

  private onMessage(message: IOnMessage, fileControl: IFileControl) {
    if (message.pgState == ProgressStatus.finish && message.blob) {
      fileControl.url = window.URL.createObjectURL(message.blob);
      this.onAutoDownload(fileControl);
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

  public onExportTranslation() {
    const lang = (LanguageType as any)[this.lStorage.getDefaultLang()];
    const allWorker = new Worker(new URL('../core/workers/export-all.worker', import.meta.url));
    allWorker.onmessage = ({ data }) => this.onMessageAll(data);
    this.exportStatus.set(ProgressStatus.retrivingServerData);

    let message: ExportPostMessage = {
      dbName: this.indexedDB.dbName,
      dbVersion: this.indexedDB.dbVersion,
      appMode: this.lStorage.getAppMode() ?? AppModes.Pending,
      apiUrl: this.lStorage.getAppApiUrl() ?? "",
      apiKey: this.lStorage.getAppApiKey() ?? "",
      file: undefined,
      decodeResult: undefined,
      lang: lang,
      token: this.lStorage.getToken(),
      exportMode: 'game-file'
    };

    allWorker.postMessage(message);
  }

  private onMessageAll(message: IOnMessage | string) {
    if (typeof message === 'string') {
      this.exportMessages.set([...this.exportMessages(), message]);

      return;
    }

    if (!(message.pgState == ProgressStatus.finish && message.blob)) return;
    this.exportStatus.set(message.pgState);
    this.exportMessages.set([...this.exportMessages(), message.pgState]);

    const url = window.URL.createObjectURL(message.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Data';
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

}