import { Injectable } from '@angular/core';
import { IDialogAsset, IDialogAssetExport, LanguageType } from '../interfaces/i-dialog-asset';
import { BehaviorSubject, combineLatest, firstValueFrom, map } from 'rxjs';
import { ApiService } from './api.service';
import { TuiFileLike } from '@taiga-ui/kit';
import { IWizardUpload } from '../interfaces/i-wizard-upload';
import { IGroup, ILanguage, IMainGroup } from '../interfaces/i-dialog-group';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import * as JSZip from 'jszip';

@Injectable()
export class FileReaderService {
  public fileProgressState$: BehaviorSubject<'reading' | 'reading content' | 'generating-new-file' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'reading content' | 'generating-new-file' | 'finish' | undefined>(undefined);
  public exportProgressState$: BehaviorSubject<'retriving-data' | 'replacing' | 'finish' | undefined> =
    new BehaviorSubject<'retriving-data' | 'replacing' | 'finish' | undefined>(undefined);
  public fileProgressBarMax$: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public fileProgressBar$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public uploadingFinish$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public uploadingGroupsFinish$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public dialogAssets: { [language: string]: IDialogAsset[] } = {};
  public dialogAssetsInclude: { [language: string]: boolean } = {};
  public dialogAssetsUploading: { [language: string]: IWizardUpload } = {};
  public dialogAssetsUploadingError: { [language: string]: UploadingError[] } = {};
  public dialogAssetsMainGroups: { [language: string]: { [mainGroup: string]: IMainGroup } } = {};
  public dialogAssetsGroups: { [language: string]: { [mainGroup: string]: { [group: string]: IGroup } } } = {};
  public file: TuiFileLike | null = null;
  public defaultLanguage: FormControl = this.fB.control(undefined, Validators.required);

  public url: string | undefined;

  private uploadStackSize = 50;

  constructor(private api: ApiService, private fB: FormBuilder) { }

  //#region ReadFile OBB Logic
  public onReadFile(file: File) {
    this.file = file;
    this.fileProgressState$.next('reading');
    let ext = file.name.split(".")[file.name.split(".").length - 1];
    if (ext == "dialog") {
      var reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => this.onReadFileDialog(reader, file.name, ev);
      reader.readAsText(file);
    }
    else if (ext == "obb") {
      this.onReadFileObb(file);
    }
    else {
      console.error("INCORRECT FILE");
    }
  }

  private async onReadFileObb(file: File) {
    const zip = new JSZip();
    var files = (await zip.loadAsync(file)).filter((relativePath, file) => relativePath.includes("assets/DialogAssets/") && !file.dir);
    this.fileProgressBarMax$.next(files.length);
    this.fileProgressState$.next('reading content');
    for (let index = 0; index < files.length; index++) {
      var dialogFile = files[index];
      const content = await dialogFile.async("string");
      this.onReadFileDialogFromObb(content, dialogFile.name);
      this.fileProgressBar$.next(index + 1);
    }
    this.fileProgressState$.next('finish');
  }

  private onReadFileDialog(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    var dialogAsset: IDialogAsset | undefined;
    var fileContent = reader.result?.toString() ?? "";
    var fileNameSplit: string[] = fileName.split("_");

    dialogAsset = this.onSetDialogAsset(fileNameSplit, fileName, fileContent);
  }

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

  //#region Upload Logic
  async onUploadLanguage(language: string) {
    this.dialogAssetsUploading[language].Uploading.next(true);
    let dialogAssets = this.dialogAssets[language];

    while (dialogAssets.length > 0) {
      let dialogsSet = dialogAssets.splice(0, this.uploadStackSize);
      await firstValueFrom(this.api.post<{ FileSkip: number }>('dialogassets', dialogsSet))
        .then(
          (result) => {
            this.dialogAssetsUploading[language].FileSkip
              .next(this.dialogAssetsUploading[language].FileSkip.value + result.FileSkip);
          },
          (error) => {
            this.addDialogAssetUploadingError(language, dialogsSet);
          }
        );
    }

    if (!this.dialogAssetsUploadingError[language]) {
      (this.dialogAssetsUploading[language].Uploaded as BehaviorSubject<boolean>).next(true);
    }
    else {
      this.dialogAssetsUploading[language].Uploaded = combineLatest(this.dialogAssetsUploadingError[language]
        .flatMap(e => e.uploadStateError$))
        .pipe(
          map((results) => results.every(e => e === false))
        );
    }

    this.dialogAssetsUploading[language].Uploading.next(false);
  }

  async onUploadGroups() {
    var languages = [];
    for (let language in this.dialogAssetsInclude) {
      if (this.dialogAssetsInclude[language] === true) {
        let mainGroups = [];
        for (let key in this.dialogAssetsMainGroups[language]) {
          mainGroups.push(this.dialogAssetsMainGroups[language][key]);
        }

        await firstValueFrom(this.api.post('maingroups', mainGroups))
          .then(
            (result) => {
            },
            (error) => {
            }
          );

        let groups = [];
        for (let keyMainGroup in this.dialogAssetsGroups[language]) {
          for (let keyGroup in this.dialogAssetsGroups[language][keyMainGroup]) {
            groups.push(this.dialogAssetsGroups[language][keyMainGroup][keyGroup]);
          }
        }

        await firstValueFrom(this.api.post('groups', groups))
          .then(
            (result) => {
            },
            (error) => {
            }
          );
        var languageO: ILanguage = { Name: language };
        languages.push(languageO);
      }
    }

    await firstValueFrom(this.api.post('languages', languages))
      .then(
        (result) => {
        },
        (error) => {
        }
      );

  }

  async onExportFile(file: File) {
    this.file = file;
    this.exportProgressState$.next('retriving-data');
    await firstValueFrom(this.api.get<IDialogAssetExport[]>('dialogassets/export'))
      .then(
        async dialogs => {
          if (typeof Worker !== 'undefined') {
            const worker = new Worker(new URL('../../file.worker', import.meta.url));
            worker.onmessage = ({ data }) => {
              if (this.fileProgressBarMax$.value != data.maxPg)
                this.fileProgressBarMax$.next(data.maxPg);
              if (this.fileProgressState$.value != data.pgState)
                this.fileProgressState$.next(data.pgState);
              if (this.fileProgressBar$.value != Math.trunc(data.pg))
                this.fileProgressBar$.next(Math.trunc(data.pg));

              if (data.zipBlob) {
                this.downloadURL(data.zipBlob, file.name);
              }
            };

            worker.postMessage({ dialogs, file });
          } else {
            this.exportProgressState$.next('replacing');
            var zip = await this.replaceDialogFilesContent(file, dialogs);
            this.onDownloadObb(zip, file.name);
          }
        },
        error => {
        }
      );
  }

  private async replaceDialogFilesContent(file: File, dialogs: IDialogAssetExport[]) {
    const zip = new JSZip();
    await zip.loadAsync(file);
    this.fileProgressBarMax$.next(dialogs.length);
    for (var index = 0; index < dialogs.length; index++) {
      var dialog = dialogs[index];
      var dialogFileName = dialog.OriginalFilename;

      delete (dialog.DialogAssetId);
      delete (dialog.OriginalFilename);
      delete (dialog.Filename);
      delete (dialog.MainGroup);
      delete (dialog.Group);
      delete (dialog.Number);
      delete (dialog.Language);
      delete (dialog.Translated);

      // dialog.Model.$content.forEach(e => delete (e.OriginalText));

      zip.file(`assets/DialogAssets/${dialogFileName}`, JSON.stringify(dialog));
      this.fileProgressBar$.next(index + 1);
    }

    return zip;
  }

  public async onDownloadObb(zip: JSZip, fileName: string) {
    this.fileProgressState$.next('generating-new-file');
    this.fileProgressBarMax$.next(100);
    this.fileProgressBar$.next(0);

    var zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
      this.fileProgressBar$.next(metadata.percent);
    });

    this.downloadURL(zipBlob, fileName);
  }

  downloadURL = (zipBlob: Blob, fileName: string) => {
    this.url = window.URL.createObjectURL(zipBlob);

    const a = document.createElement('a');
    a.href = this.url;
    a.download = fileName;
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    // a.click();
    a.remove();

    this.exportProgressState$.next('finish');
    this.fileProgressState$.next('finish');
  }
  //#endregion

  //#region Dictionary CRUD
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

  private addDialogAssetUploadingError(language: string, dialogAssets: IDialogAsset[]) {
    if (this.dialogAssetsUploadingError[language] == null) {
      this.dialogAssetsUploadingError[language] = [];
    }

    let errors: UploadingError = {
      data: dialogAssets,
      range: `${this.dialogAssets[language].length == 0 ? 1 : this.dialogAssets[language].length} - ${this.dialogAssets[language].length + this.uploadStackSize}`,
      uploading$: new BehaviorSubject<boolean>(false),
      uploadStateError$: new BehaviorSubject<boolean>(true),
      retry: async (selfO) => {
        selfO.uploading$.next(true);
        await firstValueFrom(this.api.post<{ FileSkip: number }>('dialogassets', selfO.data))
          .then(
            (result) => {
              selfO.uploadStateError$.next(false);
            },
            (error) => {

            }
          );
        selfO.uploading$.next(false);
      },
      skip: async (selfO) => {
        selfO.uploadStateError$.next(false);
      }
    }

    this.dialogAssetsUploadingError[language].push(errors);
  }
  //#endregion
}

export interface UploadingError {
  data: IDialogAsset[];
  range: string;
  uploading$: BehaviorSubject<boolean>;
  uploadStateError$: BehaviorSubject<boolean>;
  retry: (selfO: UploadingError) => void
  skip: (selfO: UploadingError) => void
}