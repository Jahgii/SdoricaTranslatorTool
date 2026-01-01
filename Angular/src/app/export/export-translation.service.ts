import { Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of, Observable, BehaviorSubject, combineLatest, zip, map, shareReplay, Subscription } from 'rxjs';
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
import { AlertService } from '../core/services/alert.service';
import JSZip from 'jszip';

@Injectable()
export class ExportTranslationService implements OnDestroy {
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
  private langOriginSubs$!: Subscription;

  constructor(
    private readonly ddS: DeviceDetectorService,
    private readonly lStorage: LocalStorageService,
    private readonly indexedDB: IndexDBService,
    private readonly alert: AlertService,
    readonly languageOrigin: LanguageOriginService,
    private readonly api: ApiService,
    private readonly translate: TranslateService
  ) {
    this.init();
  }

  ngOnDestroy(): void {
    this.langOriginSubs$.unsubscribe();
  }

  private init() {
    this.langOriginSubs$ = this.languageOrigin.language$
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
    this.alert.showAlert(
      'alert-error',
      'alert-wrong-file-label',
      'accent',
      'triangle-alert'
    );
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
    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file, {});
    } catch {
      fileControl.verifyingFile$.next(false);
      this.alert.showAlert(
        'alert-error',
        'error-file-obb',
        'accent',
        'triangle-alert'
      );
      fileControl.control.setValue(null);
      return;
    }

    let dialogFolder = Object.keys(this.zipObb.files).some(name => name.startsWith('assets/DialogAssets/'));

    fileControl.verifyingFile$.next(false);
    if (!dialogFolder) {
      this.alert.showAlert(
        'alert-error',
        'error-file-obb',
        'accent',
        'triangle-alert'
      );
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
    file.arrayBuffer().then(buffer => {
      try {
        this.dataLoc = decode(buffer) as ILocalization;
      } catch {
        fileControl.verifyingFile$.next(false);
        this.alert.showAlert(
          'alert-error',
          'error-file-localization',
          'accent',
          'triangle-alert'
        );
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataLoc?.C?.['BaseBuff']) {
        this.alert.showAlert(
          'alert-error',
          'error-file-localization',
          'accent',
          'triangle-alert'
        );
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);
    });
  }

  /**
   * Verified if gamedata file its a correct msgpack file
   * @param file 
   * @param fileControl 
   */
  public async onVerificationGamedata(file: File, fileControl: IFileControl) {
    file.arrayBuffer().then(buffer => {
      try {
        this.dataGam = decode(buffer) as ILocalization;
      } catch {
        fileControl.verifyingFile$.next(false);
        this.alert.showAlert(
          'alert-error',
          'error-file-gamedata',
          'accent',
          'triangle-alert'
        );
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataGam?.C?.['BuffInfo']) {
        this.alert.showAlert(
          'alert-error',
          'error-file-gamedata',
          'accent',
          'triangle-alert'
        );
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);
    });
  }

  /**
   * Apply Tranlation use workers if support
   */
  public onApplyTranslation() {
    this.isTranslating$.next(true);
    if (typeof Worker === 'undefined') this.onApplyTranslationNormal();
    else this.onApplyTranslationWorkers();
  }

  private onApplyTranslationWorkers() {
    const lang = (LanguageType as any)[this.lStorage.getDefaultLang()];
    const obbWorker = new Worker(new URL('../core/workers/export-obb.worker', import.meta.url));
    const locWorker = new Worker(new URL('../core/workers/export-loc.worker', import.meta.url));
    const gamWorker = new Worker(new URL('../core/workers/export-gam.worker', import.meta.url));

    obbWorker.onmessage = ({ data }) => this.onMessage(data, this.obb, obbWorker);
    locWorker.onmessage = ({ data }) => this.onMessage(data, this.localization, locWorker);
    gamWorker.onmessage = ({ data }) => this.onMessage(data, this.gamedata, gamWorker);

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
    } else obbWorker.terminate();
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
    } else locWorker.terminate();
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
    } else gamWorker.terminate();
  }

  private onMessage(message: IOnMessage, fileControl: IFileControl, worker: Worker) {
    if (message.pgState == ProgressStatus.finish && message.blob) {
      fileControl.url = globalThis.URL.createObjectURL(message.blob);
      this.onAutoDownload(fileControl);

      worker.terminate();
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
    allWorker.onmessage = ({ data }) => this.onMessageAll(data, allWorker);
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

  private onMessageAll(message: IOnMessage | string, worker: Worker) {
    if (typeof message === 'string') {
      this.exportMessages.set([...this.exportMessages(), message]);

      return;
    }

    if (!(message.pgState == ProgressStatus.finish && message.blob)) return;
    this.exportStatus.set(message.pgState);
    this.exportMessages.set([...this.exportMessages(), message.pgState]);

    const url = globalThis.URL.createObjectURL(message.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Data';
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();

    worker.terminate();
  }

}