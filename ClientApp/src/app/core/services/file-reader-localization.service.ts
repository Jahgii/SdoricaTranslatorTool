import { Injectable } from '@angular/core';
import { ILocalization, ILocalizationCategory, ILocalizationKey } from '../interfaces/i-localizations';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { decode, encode } from '@msgpack/msgpack';
import { ApiService } from './api.service';

@Injectable()
export class FileReaderLocalizationService {
  public fileProgressState$: BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined>(undefined);
  public fileExportProgressState$: BehaviorSubject<'reading' | 'retriving-server-keys' | 'replacing-content' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'retriving-server-keys' | 'replacing-content' | 'finish' | undefined>(undefined);
  public fileProgressBarMax$: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public fileProgressBar$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public localizationCategories: ILocalizationCategory[] = [];
  public localizationKeys: ILocalizationKey[] = [];
  public uploadKeysUrl: 'localizationkeys/bulk' | 'localizationkeys' | undefined;

  private uploadStackSize = 1000;

  constructor(private api: ApiService) {
    this.switchUploadKeysUrl();
  }

  private async switchUploadKeysUrl() {
    await firstValueFrom(this.api.get<{ Bulk: boolean }>('localizationkeys/verified'))
      .then(
        r => {
          this.uploadKeysUrl = r.Bulk ? 'localizationkeys/bulk' : 'localizationkeys';
          this.uploadStackSize = r.Bulk ? 1000 : 25;
        },
        error => { console.error("CANT CONNECT TO SERVER"); }
      );
  }

  public async onReadFile(file: File) {
    this.fileProgressState$.next('reading');
    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFile(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFile(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    var decodeResult = decode(reader.result as ArrayBuffer) as ILocalization;
    this.fileProgressState$.next('reading content');
    for (let categoryName in decodeResult.C) {
      var new_category: ILocalizationCategory = {
        Name: categoryName,
        Keys: decodeResult.C[categoryName].D.length,
        KeysTranslated: 0
      }

      this.localizationCategories.push(new_category);

      let langName;
      let keyIndex = decodeResult.C[categoryName].K.findIndex(e => e === 'Key');

      for (let dataIndex = 0; dataIndex < decodeResult.C[categoryName].D.length; dataIndex++) {
        let new_key: ILocalizationKey | undefined = undefined;
        for (let langIndex = 0; langIndex < decodeResult.C[categoryName].K.length; langIndex++) {
          if (keyIndex === langIndex) continue;
          let keyName = decodeResult.C[categoryName].D[dataIndex][keyIndex]
          langName = decodeResult.C[categoryName].K[langIndex];
          let text = decodeResult.C[categoryName].D[dataIndex][langIndex];

          if (!new_key) {
            new_key = {
              Category: categoryName,
              Name: keyName,
              Translated: false,
              Translations: {}
            }
          }

          new_key.Translations[langName] = text
        }
        if (new_key) {
          new_key.Translations['ReplaceLang'] = '';
          this.localizationKeys.push(new_key);
        }
      }
    }

    this.onUploadLocalization();
  }

  public async onExportFile(file: File) {
    this.fileExportProgressState$.next('reading');
    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFileExport(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFileExport(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    var decodeResult = decode(reader.result as ArrayBuffer) as ILocalization;
    this.fileExportProgressState$.next('retriving-server-keys');
    await firstValueFrom(this.api.get<ILocalizationKey[]>('localizationkeys/export'))
      .then(
        r => {
          this.localizationKeys = r;
        },
        error => {
          console.error("CANT RETRIVE SERVER KEYS");
        }
      );

    this.fileExportProgressState$.next('replacing-content');

    for (let key of this.localizationKeys) {
      let keyIndexPosition = decodeResult.C[key.Category].K.findIndex(e => e === 'Key');
      let keyIndex = decodeResult.C[key.Category].D.findIndex(e => e[keyIndexPosition] === key.Name);
      /** @TODO Dynamic language on service */
      let languageIndex = decodeResult.C[key.Category].K.findIndex(e => e === 'English');
      decodeResult.C[key.Category].D[keyIndex][languageIndex] = key.Translations['ReplaceLang'];
    }
    this.fileExportProgressState$.next('finish');

    this.onDownloadLocalization(decodeResult, fileName);
  }

  public async onUploadLocalization() {
    if (!this.uploadKeysUrl) return;

    this.fileProgressState$.next('uploading categories');
    await firstValueFrom(this.api.post<{ FileSkip: number }>('localizationcategories', this.localizationCategories))
      .then(
        (result) => {

        },
        (error) => {

        }
      );

    this.fileProgressState$.next('uploading keys');
    this.fileProgressBarMax$.next(this.localizationKeys.length);
    while (this.localizationKeys.length > 0) {
      let keysSet = this.localizationKeys.splice(0, this.uploadStackSize);
      await firstValueFrom(this.api.post<{ FileSkip: number }>(this.uploadKeysUrl, keysSet))
        .then(
          (result) => {
            this.fileProgressBar$.next(this.fileProgressBar$.value + this.uploadStackSize);
            if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
          },
          (error) => {
          }
        );
    }
  }

  public async onDownloadLocalization(result: ILocalization, fileName: string) {
    var encodeResult = encode(result);

    const blob = new Blob([encodeResult], {
      type: ''
    });

    const url = window.URL.createObjectURL(blob)

    this.downloadURL(url, fileName);
  }

  downloadURL = (data: any, fileName: string) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

}
