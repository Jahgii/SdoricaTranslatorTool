import { Inject, Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import * as JSZip from 'jszip';
import { ILocalization } from '../core/interfaces/i-localizations';
import { IGamedata } from '../core/interfaces/i-gamedata';
import { IFileControl } from '../core/interfaces/i-export';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, of, switchMap } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { decode } from '@msgpack/msgpack';
import { ProgressStatus } from '../core/interfaces/i-export-progress';
import { TuiFileLike } from '@taiga-ui/kit';
import { DeviceDetectorService } from 'ngx-device-detector';
import { IWizardUpload } from '../core/interfaces/i-wizard-upload';
import { IDialogAsset } from '../core/interfaces/i-dialog-asset';
import { IGroup, IMainGroup } from '../core/interfaces/i-dialog-group';

@Injectable()
export class ImportService {
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

  public dialogAssets: { [language: string]: IDialogAsset[] } = {};
  public dialogAssetsInclude: { [language: string]: boolean } = {};
  public dialogAssetsUploading: { [language: string]: IWizardUpload } = {};
  public dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } } = {};
  public dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } } = {};

  constructor(
    private api: ApiService,
    private fB: FormBuilder,
    private ddS: DeviceDetectorService,
    private translate: TranslateService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService,
  ) {
    this.init();
  }

  private init() {
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

    this.filesVerified$.subscribe(verified => {
      if (verified) {

      }
    });
  }

  //#region UI
  public onLoadFile(file: TuiFileLike, fileControl: IFileControl): Observable<TuiFileLike | null> {
    fileControl.verifyingFile$.next(true);

    fileControl.verificationCallback(file as File, fileControl);

    return of(file);
  }

  private openAlert(alert: Observable<void>) {
    alert.subscribe({
      complete: () => {
      },
    });
  }

  /**
   * Verified if Obb have the required directories
   */
  public async onVerificationObb(file: File, fileControl: IFileControl) {
    let alert = this.alerts
      .open(
        this.translate.instant('error-file-obb'),
        {
          label: this.translate.instant('alert-error'),
          status: 'error',
          autoClose: true,
          hasCloseButton: false
        }
      );

    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.openAlert(alert);
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    this.zipObb = new JSZip();
    try {
      await this.zipObb.loadAsync(file, {});
      var files = this.zipObb.filter((relativePath, file) => relativePath.includes("assets/DialogAssets/") && !file.dir);
      for (let index = 0; index < files.length; index++) {
        var dialogFile = files[index];
        const content = await dialogFile.async("string");
        this.onReadFileDialogFromObb(content, dialogFile.name);
      }
    } catch (error) {
      fileControl.verifyingFile$.next(false);
      this.openAlert(alert);
      fileControl.control.setValue(null);
      return;
    }

    let dialogFolder = this.zipObb.files['assets/DialogAssets/'];

    fileControl.verifyingFile$.next(false);
    if (!dialogFolder) {
      this.openAlert(alert);
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
          label: this.translate.instant('alert-error'),
          status: 'error',
          autoClose: true,
          hasCloseButton: false
        }
      );

    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.openAlert(alert);
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataLoc = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch (error) {
        fileControl.verifyingFile$.next(false);
        this.openAlert(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataLoc || !this.dataLoc.C || !this.dataLoc.C['BaseBuff']) {
        this.openAlert(alert);
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
          label: this.translate.instant('alert-error'),
          status: 'error',
          autoClose: true,
          hasCloseButton: false
        }
      );

    if (file.size === 0) {
      fileControl.verifyingFile$.next(false);
      this.openAlert(alert);
      setTimeout(() => {
        fileControl.control.setValue(null, { emitEvent: true });
      }, 1);
      return;
    }

    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      try {
        this.dataGam = decode(reader.result as ArrayBuffer) as ILocalization;
      } catch (error) {
        fileControl.verifyingFile$.next(false);
        this.openAlert(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifyingFile$.next(false);
      if (!this.dataGam || !this.dataGam.C || !this.dataGam.C['BuffInfo']) {
        this.openAlert(alert);
        fileControl.control.setValue(null);
        return;
      }

      fileControl.verifiedFile$.next(true);
    };
    reader.readAsArrayBuffer(file);
  }

  public onReject(file: TuiFileLike | readonly TuiFileLike[]): void {
    let alert = this.alerts
      .open(
        this.translate.instant('alert-wrong-file-label'),
        {
          label: this.translate.instant('alert-error'),
          status: 'error',
          autoClose: true,
          hasCloseButton: false
        }
      );

    this.openAlert(alert);
  }

  public onSkipFile(fileControl: IFileControl) {
    fileControl.skip?.next(true);
    fileControl.verifiedFile$.next(true);
    fileControl.progressStatus$.next(ProgressStatus.finish);
  }
  //#endregion

  //#region Obb Logic
  private onReadFileDialogFromObb(fileContent: string, fileName: string) {
    var dialogAsset: IDialogAsset | undefined;
    var fileNameSplit: string[] = fileName.replace("assets/DialogAssets/", "").split("_");

    dialogAsset = this.onSetDialogAsset(fileNameSplit, fileName.replace("assets/DialogAssets/", ""), fileContent);

    if (!dialogAsset) {
      return;
    }

    this.addDialogAsset(dialogAsset);
    this.addDialogAssetGroup(dialogAsset);
  }

  private addDialogAsset(dialogAsset: IDialogAsset) {
    if (this.dialogAssets[dialogAsset.Language] == null) {
      this.dialogAssets[dialogAsset.Language] = [];
      this.dialogAssetsInclude[dialogAsset.Language] = false;
    }

    if (!dialogAsset.Number) return;

    this.dialogAssets[dialogAsset.Language].push(dialogAsset);
  }

  private addDialogAssetGroup(dialogAsset: IDialogAsset) {
    if (this.dialogAssetsMainGroups[dialogAsset.Language] == null) {
      this.dialogAssetsMainGroups[dialogAsset.Language] = {};
    }

    if (this.dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup] == null) {
      this.dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup] = {
        Language: dialogAsset.Language,
        OriginalName: dialogAsset.MainGroup,
        Name: dialogAsset.MainGroup,
        ImageLink: '',
        Files: 1,
        TranslatedFiles: 0,
        Order: 0
      }
    }
    else {
      this.dialogAssetsMainGroups[dialogAsset.Language][dialogAsset.MainGroup].Files += 1;
    }

    if (this.dialogAssetsGroups[dialogAsset.Language] == null) {
      this.dialogAssetsGroups[dialogAsset.Language] = {};
    }

    if (this.dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup] == null) {
      this.dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup] = {};
    }


    if (this.dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group] == null) {
      this.dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group] = {
        Language: dialogAsset.Language,
        MainGroup: dialogAsset.MainGroup,
        OriginalName: dialogAsset.Group,
        Name: dialogAsset.Group,
        ImageLink: '',
        Files: 1,
        TranslatedFiles: 0,
        Order: 0
      }
    }
    else {
      this.dialogAssetsGroups[dialogAsset.Language][dialogAsset.MainGroup][dialogAsset.Group].Files += 1;
    }
  }

  private onSetDialogAsset(fileNameSplit: string[], fileName: string, fileContent: string) {
    let dialogAsset: IDialogAsset = JSON.parse(this.onFixDialogAssetJsonParse(fileContent));

    dialogAsset.Model.$content.forEach(dialog => {
      dialog.OriginalText = dialog.Text;
    });

    if (fileNameSplit.length == 5) {
      dialogAsset.OriginalFilename = fileName;
      dialogAsset.Filename = fileName.split(".dialog")[0];
      dialogAsset.MainGroup = fileNameSplit[0];
      dialogAsset.Group = fileNameSplit[1];
      dialogAsset.Number = Number(fileNameSplit[2]);
      dialogAsset.Language = fileNameSplit[4].split(".")[0];
      dialogAsset.Translated = false;
    }
    else if (fileNameSplit.length == 6) {
      dialogAsset.OriginalFilename = fileName;
      dialogAsset.Filename = fileName.split(".dialog")[0];
      dialogAsset.MainGroup = fileNameSplit[0];
      dialogAsset.Group = fileNameSplit[1] + fileNameSplit[2];
      dialogAsset.Number = Number(fileNameSplit[3]);
      dialogAsset.Language = fileNameSplit[5].split(".")[0];
      dialogAsset.Translated = false;
    }
    else {
      console.warn("FILE WITH MORE THAN 6 length -> ", fileName);
      return;
    }

    return dialogAsset;
  }

  private onFixDialogAssetJsonParse(fileContent: string): string {
    return fileContent.replace(/"sfxVolume":[.]/g, `"sfxVolume":0.`);
  }
  //#endregion

  //#region Import Logic
  public onImportBegins() {
    this.isImporting$.next(true);
    if (typeof Worker !== 'undefined') this.onImportWorkers();
    else this.onImportNormal();
  }

  private onImportWorkers() { }

  private onImportNormal() { }
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
      if (this.dialogAssetsInclude[key] == true) {
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
