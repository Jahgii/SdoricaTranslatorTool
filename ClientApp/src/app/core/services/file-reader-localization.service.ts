import { Injectable } from '@angular/core';
import { ILocalization, ILocalizationCategory, ILocalizationKey } from '../interfaces/i-localizations';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { decode } from '@msgpack/msgpack';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FileReaderLocalizationService {
  public fileProgressState$: BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined>(undefined);
  public fileProgressBarMax$: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public fileProgressBar$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public localizationCategories: ILocalizationCategory[] = [];
  public localizationKeys: ILocalizationKey[] = [];

  private uploadStackSize = 1000;

  constructor(private api: ApiService) { }

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

  public async onUploadLocalization() {
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
      await firstValueFrom(this.api.post<{ FileSkip: number }>('localizationkeys/bulk', keysSet))
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

}
