import { Inject, Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of, Observable, firstValueFrom, BehaviorSubject, combineLatest } from 'rxjs';
import { ILocalization } from '../interfaces/i-localizations';
import { decode } from '@msgpack/msgpack';
import { IGamedata } from '../interfaces/i-gamedata';
import * as JSZip from 'jszip';
import { IFileControl } from '../interfaces/i-export';
import { ProgressState, IOnMessage } from '../interfaces/i-export-progress';

@Injectable({
  providedIn: 'root'
})
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
    progressStatus$: new BehaviorSubject<ProgressState>(ProgressState.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined
  };

  public localization: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerificationLocalization.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressState>(ProgressState.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined
  };

  public gamedata: IFileControl = {
    control: new FormControl(),
    verifyingFile$: new BehaviorSubject<boolean>(false),
    verificationCallback: this.onVerificationGamedata.bind(this),
    loadedFile$: undefined,
    verifiedFile$: new BehaviorSubject<boolean>(false),
    progressStatus$: new BehaviorSubject<ProgressState>(ProgressState.waiting),
    progress$: new BehaviorSubject<number>(0),
    progressMax$: new BehaviorSubject<number>(100),
    url: undefined
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
    [this.obb.progressStatus$,
    this.localization.progressStatus$,
    this.gamedata.progressStatus$],
    (one, two, three) => {
      return (one == ProgressState.finish && two == ProgressState.finish && three == ProgressState.finish);
    }
  );

  constructor(
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
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
        'El archivo OBB proporcionado no es valido, verifique que sea el archivo correcto e intente de nuevo.',
        {
          label: 'Error',
          status: 'error',
          autoClose: true
        }
      );

    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file);
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
    const obbWorker = new Worker(new URL('../../obb.worker', import.meta.url));
    const locWorker = new Worker(new URL('../../loc.worker', import.meta.url));
    const gamWorker = new Worker(new URL('../../gam.worker', import.meta.url));

    obbWorker.onmessage = ({ data }) => this.onMessage(data, this.obb);
    locWorker.onmessage = ({ data }) => this.onMessage(data, this.localization);
    gamWorker.onmessage = ({ data }) => this.onMessage(data, this.gamedata);

    obbWorker.postMessage({ file: this.obb.control.value, lang: 'English' });
    locWorker.postMessage({ decodeResult: this.dataLoc, lang: 'English' });
    gamWorker.postMessage({ decodeResult: this.dataGam, lang: 'English' });
  }

  private onMessage(message: IOnMessage, fileControl: IFileControl) {
    if (message.pgState == ProgressState.finish && message.blob) {
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

}