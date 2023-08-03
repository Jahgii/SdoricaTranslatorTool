import { Injectable } from '@angular/core';
import { IDialogAsset } from '../interfaces/i-dialog-asset';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import * as JSZip from 'jszip';
import { TuiFileLike } from '@taiga-ui/kit';
import { IWizardUpload } from '../interfaces/i-wizard-upload';
import { IGroup, IMainGroup } from '../interfaces/i-dialog-group';

@Injectable({
  providedIn: 'root'
})
export class FileReaderService {
  public fileProgressState$: BehaviorSubject<'reading' | 'reading content' | 'finish' | undefined> = new BehaviorSubject<'reading' | 'reading content' | 'finish' | undefined>(undefined);
  public fileProgressBarMax$: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public fileProgressBar$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public dialogAssets: { [language: string]: IDialogAsset[] } = {};
  public dialogAssetsInclude: { [language: string]: boolean } = {};
  public dialogAssetsUploading: { [language: string]: IWizardUpload } = {};
  public dialogAssetsUploadingError: { [language: string]: UploadingError[] } = {};
  public dialogAssetsMainGroups: { [mainGroup: string]: IMainGroup } = {};
  public dialogAssetsGroups: { [group: string]: IGroup } = {};
  public file: TuiFileLike | null = null;

  private uploadStackSize = 50;

  constructor(private api: ApiService) { }

  //#region ReadFile Logic
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
    var dialogAsset: IDialogAsset;
    var fileContent = reader.result?.toString() ?? "";
    var fileNameSplit: string[] = fileName.split("_");

    dialogAsset = this.onSetDialogAsset(fileNameSplit, fileName, fileContent);
  }

  private onReadFileDialogFromObb(fileContent: string, fileName: string) {
    var dialogAsset: IDialogAsset;
    var fileNameSplit: string[] = fileName.replace("assets/DialogAssets/", "").split("_");

    dialogAsset = this.onSetDialogAsset(fileNameSplit, fileName.replace("assets/DialogAssets/", ""), fileContent);

    this.addDialogAsset(dialogAsset);
    this.addDialogAssetGroup(dialogAsset);
  }

  private onSetDialogAsset(fileNameSplit: string[], fileName: string, fileContent: string) {
    let dialogAsset = JSON.parse(this.onFixDialogAssetJsonParse(fileContent));

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

  async onUploadLanguage(language: string) {
    this.dialogAssetsUploading[language].Uploading.next(true);
    let dialogAssets = this.dialogAssets[language];

    while (dialogAssets.length > 0) {
      let dialogsSet = dialogAssets.splice(0, 50);
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

    this.dialogAssetsUploading[language].Uploading.next(false);
  }

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
    if (this.dialogAssetsMainGroups[dialogAsset.MainGroup] == null) {
      this.dialogAssetsMainGroups[dialogAsset.MainGroup] = {
        OriginalName: dialogAsset.MainGroup,
        Name: dialogAsset.MainGroup,
        ImageLink: '',
        Files: 1,
        TranslatedFiles: 0,
        Order: 0
      }
    }
    else {
      this.dialogAssetsMainGroups[dialogAsset.MainGroup].Files += 1;
    }

    if (this.dialogAssetsGroups[dialogAsset.Group] == null) {
      this.dialogAssetsGroups[dialogAsset.Group] = {
        OriginalName: dialogAsset.Group,
        Name: dialogAsset.Group,
        ImageLink: '',
        Files: 1,
        TranslatedFiles: 0,
        Order: 0
      }
    }
    else {
      this.dialogAssetsGroups[dialogAsset.Group].Files += 1;
    }
  }

  private addDialogAssetUploadingError(language: string, dialogAssets: IDialogAsset[]) {
    if (this.dialogAssetsUploadingError[language] == null) {
      this.dialogAssetsUploadingError[language] = [];
    }

    let errors: UploadingError = {
      data: dialogAssets,
      range: `${this.dialogAssets[language].length} - ${this.dialogAssets[language].length + this.uploadStackSize}`,
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
      }
    }

    this.dialogAssetsUploadingError[language].push(errors)
  }
  //#endregion
}

export interface UploadingError {
  data: IDialogAsset[];
  range: string;
  uploading$: BehaviorSubject<boolean>;
  uploadStateError$: BehaviorSubject<boolean>;
  retry: (selfO: UploadingError) => void
}