import { Injectable } from '@angular/core';
import { IDialogAsset } from '../interfaces/i-dialog-asset';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import * as JSZip from 'jszip';
import { TuiFileLike } from '@taiga-ui/kit';
import { IWizardUpload } from '../interfaces/i-wizard-upload';

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
  public file: TuiFileLike | null = null;

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

    // firstValueFrom(this.api.post<IDialogAsset>('dialogasset', dialogAsset)).then((result) => console.log(result));
  }

  private onReadFileDialogFromObb(fileContent: string, fileName: string) {
    var dialogAsset: IDialogAsset;
    var fileNameSplit: string[] = fileName.replace("assets/DialogAssets/", "").split("_");

    dialogAsset = this.onSetDialogAsset(fileNameSplit, fileName.replace("assets/DialogAssets/", ""), fileContent);
    this.AddDialogAsset(dialogAsset);
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
    }
    else if (fileNameSplit.length == 6) {
      dialogAsset.OriginalFilename = fileName;
      dialogAsset.Filename = fileName.split(".dialog")[0];
      dialogAsset.MainGroup = fileNameSplit[0];
      dialogAsset.Group = fileNameSplit[1] + fileNameSplit[2];
      dialogAsset.Number = Number(fileNameSplit[3]);
      dialogAsset.Language = fileNameSplit[5].split(".")[0];
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

  async onUploadLanguage(key: string) {
    let dialogAssets = this.dialogAssets[key];
    await firstValueFrom(this.api.post<{ FileSkip: number }>('dialogasset', dialogAssets))
      .then(
        (result) => {
          this.dialogAssetsUploading[key].Uploaded = true;
          this.dialogAssetsUploading[key].Uploading = false;
          this.dialogAssetsUploading[key].UploadError = false;
          this.dialogAssetsUploading[key].FileSkip = result.FileSkip;
        },
        (error) => {
          this.dialogAssetsUploading[key].Uploaded = false;
          this.dialogAssetsUploading[key].Uploading = false;
          this.dialogAssetsUploading[key].UploadError = true;
          this.dialogAssetsUploading[key].FileSkip = 0;
        }
      );
  }

  //#region Dictionary CRUD
  private AddDialogAsset(dialogAsset: IDialogAsset) {
    if (this.dialogAssets[dialogAsset.Language] == null) {
      this.dialogAssets[dialogAsset.Language] = [];
      this.dialogAssetsInclude[dialogAsset.Language] = false;
    }

    if (!dialogAsset.Number) return;

    this.dialogAssets[dialogAsset.Language].push(dialogAsset);
  }
  //#endregion
}