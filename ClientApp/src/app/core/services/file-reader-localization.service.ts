import { Injectable } from '@angular/core';
import { ILocalization, ILocalizationCategory, ILocalizationKey } from '../interfaces/i-localizations';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { decode, encode } from '@msgpack/msgpack';
import { ApiService } from './api.service';
import { TuiFileLike } from '@taiga-ui/kit';
import { LanguageOriginService } from './language-origin.service';
import { LocalStorageService } from './local-storage.service';

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
  public uploadKeysUrl: 'localizationkeys/bulk' | 'localizationkeys/import' | undefined;
  public file: TuiFileLike | null = null;
  public url: string | undefined;

  private uploadStackSize = 500;
  private maxThreads = 5;

  constructor(
    private api: ApiService,
    private languageOrigin: LanguageOriginService,
    private local: LocalStorageService
  ) {
    this.switchUploadKeysUrl();
  }

  private async switchUploadKeysUrl() {
    await firstValueFrom(this.api.get<{ Bulk: boolean }>('localizationkeys/verified'))
      .then(
        r => {
          this.uploadKeysUrl = r.Bulk ? 'localizationkeys/bulk' : 'localizationkeys/import';
          this.uploadStackSize = r.Bulk ? 500 : 25;
        },
        error => { console.error("CANT CONNECT TO SERVER"); }
      );
  }

  public async onReadFile(file: File) {
    this.fileProgressState$.next('reading');
    let reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFile(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFile(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    let decodeResult = decode(reader.result as ArrayBuffer) as ILocalization;
    this.fileProgressState$.next('reading content');
    for (let categoryName in decodeResult.C) {
      let new_category: ILocalizationCategory = {
        Name: categoryName,
        Keys: {},
        KeysTranslated: {}
      }

      decodeResult.C[categoryName].K.forEach(k => {
        new_category.Keys[k] = decodeResult.C[categoryName].D.length
        new_category.KeysTranslated[k] = 0
      });

      this.localizationCategories.push(new_category);

      let langName;
      let keyIndex = decodeResult.C[categoryName].K.findIndex(e => e === 'Key');
      let versionIndex = decodeResult.C[categoryName].K.findIndex(e => e === '_version');

      for (const dC of decodeResult.C[categoryName].D) {
        let new_key: ILocalizationKey | undefined = undefined;
        for (let langIndex = 0; langIndex < decodeResult.C[categoryName].K.length; langIndex++) {
          if (keyIndex === langIndex) continue;
          if (versionIndex === langIndex) continue;
          let keyName = dC[keyIndex]
          let _version = dC[versionIndex]
          langName = decodeResult.C[categoryName].K[langIndex];
          let text = dC[langIndex];

          if (!new_key) {
            new_key = {
              Category: categoryName,
              Name: keyName,
              _version: Number(_version ?? -1),
              Translated: {},
              Original: {},
              Translations: {}
            }
          }

          new_key.Translated[langName] = false;
          new_key.Original[langName] = text;
          new_key.Translations[langName] = "";
        }

        if (new_key) this.localizationKeys.push(new_key);
      }
    }

    this.onUploadLocalization();
  }

  public async onExportFile(file: File) {
    this.file = file;
    this.fileExportProgressState$.next('reading');
    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFileExport(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFileExport(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    var decodeResult = decode(reader.result as ArrayBuffer) as ILocalization;
    this.fileExportProgressState$.next('retriving-server-keys');
    await firstValueFrom(this.api.getWithHeaders<ILocalizationKey[]>('localizationkeys/export', { language: this.languageOrigin.localizationLang }))
      .then(
        r => {
          this.localizationKeys = r;
        },
        error => {
          console.error("CANT RETRIVE SERVER KEYS");
        }
      );

    this.fileExportProgressState$.next('replacing-content');

    for (let serverKey of this.localizationKeys) {
      let keyIndexPosition = decodeResult.C[serverKey.Category].K.findIndex(e => e === 'Key');
      let versionIndexPosition = decodeResult.C[serverKey.Category].K.findIndex(e => e === '_version');
      let keyIndex = decodeResult.C[serverKey.Category].D.findIndex(e => e[keyIndexPosition] === serverKey.Name);

      //Not need to use because the file already have the version
      let versionIndex = decodeResult.C[serverKey.Category].D.findIndex(e => e[versionIndexPosition] === serverKey.Name);


      if (keyIndex == -1) {
        let customLocalizationKey: string[] = [];

        decodeResult.C[serverKey.Category].K.forEach((keys, index) => {
          if (index != keyIndexPosition)
            customLocalizationKey.push(serverKey.Translations[keys]);
          else
            customLocalizationKey.push(serverKey.Name);
        });

        decodeResult.C[serverKey.Category].D.push(customLocalizationKey);
        keyIndex = decodeResult.C[serverKey.Category].D.length - 1;
      }

      let languageIndex = decodeResult.C[serverKey.Category].K.findIndex(e => e === this.languageOrigin.localizationLang);
      decodeResult.C[serverKey.Category].D[keyIndex][languageIndex] = serverKey.Translations[this.languageOrigin.localizationLang];
    }

    this.fileExportProgressState$.next('finish');

    this.onDownloadLocalization(decodeResult, fileName);
  }

  public async onUploadLocalization() {
    if (!this.uploadKeysUrl) return;

    this.fileProgressState$.next('uploading categories');
    await firstValueFrom(this.api.post('localizationcategories', this.localizationCategories))
      .then(
        (result) => {

        },
        (error) => {

        }
      );

    this.fileProgressState$.next('uploading keys');
    this.fileProgressBarMax$.next(this.localizationKeys.length);

    if (typeof Worker !== 'undefined') {
      var spliceCount = Math.ceil(this.localizationKeys.length / this.maxThreads);
      var workers: Worker[] = [];
      for (var threadIndex = 0; threadIndex < this.maxThreads; threadIndex++) {
        workers.push(new Worker(new URL('../../keys.worker', import.meta.url)));
        workers[threadIndex].onmessage = ({ data }) => {
          if (data.finish) {
            workers[data.i].terminate();
            return;
          }
          this.fileProgressBar$.next(this.fileProgressBar$.value + data.keysUploaded);
          if (this.fileProgressBar$.value >= this.fileProgressBarMax$.value) this.fileProgressState$.next('finish');
        };

        var keys = this.localizationKeys.splice(0, spliceCount);
        var uploadStackSize = this.uploadStackSize;
        var url = this.uploadKeysUrl;
        workers[threadIndex].postMessage({ keys, uploadStackSize, url, threadIndex, token: this.local.getToken() });
      }
    }
    else
      while (this.localizationKeys.length > 0) {
        let keysSet = this.localizationKeys.splice(0, this.uploadStackSize);
        await firstValueFrom(this.api.post<string[]>(this.uploadKeysUrl, keysSet))
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
    var encodeResult = encode(result) as any;

    const blob = new Blob([encodeResult], {
      type: 'application/octet-stream'
    });

    const url = window.URL.createObjectURL(blob)

    this.url = url;

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
