import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { IGamedata, IGamedataCategory, IGamedataValue } from '../interfaces/i-gamedata';
import { TuiFileLike } from '@taiga-ui/kit';
import { ApiService } from './api.service';
import { decode, encode } from '@msgpack/msgpack';

@Injectable()
export class FileReaderGamedataService {
  public fileProgressState$: BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'reading content' | 'uploading categories' | 'uploading keys' | 'finish' | undefined>(undefined);
  public fileExportProgressState$: BehaviorSubject<'reading' | 'retriving-server-keys' | 'replacing-content' | 'finish' | undefined> =
    new BehaviorSubject<'reading' | 'retriving-server-keys' | 'replacing-content' | 'finish' | undefined>(undefined);
  public fileProgressBarMax$: BehaviorSubject<number> = new BehaviorSubject<number>(100);
  public fileProgressBar$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public gamedataCategories: IGamedataCategory[] = [];
  public gamedataValues: IGamedataValue[] = [];
  public uploadKeysUrl: 'gamedatavalues/import' = 'gamedatavalues/import';
  public file: TuiFileLike | null = null;
  public url: string | undefined;

  private uploadStackSize = 25;

  constructor(
    private api: ApiService
  ) { }

  public async onReadFile(file: File) {
    this.fileProgressState$.next('reading');
    let reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFile(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFile(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    let decodeResult = decode(reader.result as ArrayBuffer) as IGamedata;
    this.fileProgressState$.next('reading content');

    this.addKnowCategory(decodeResult, 'BuffInfo');

    this.onUploadGamedata();
  }

  private addKnowCategory(decodeResult: IGamedata, category: string) {
    let new_category: IGamedataCategory = {
      Name: category,
      Keys: {}
    }

    for (const k of decodeResult.C[category].K)
      new_category.Keys[k] = decodeResult.C[category].D.length;

    this.gamedataCategories.push(new_category);

    let keyName;
    let idIndex = decodeResult.C[category].K.findIndex(e => e === 'id');

    for (const element of decodeResult.C[category].D) {
      let new_value: IGamedataValue | undefined = undefined;
      for (let keyIndex = 0; keyIndex < decodeResult.C[category].K.length; keyIndex++) {
        let gameDataValueName = element[idIndex]
        keyName = decodeResult.C[category].K[keyIndex];
        let content = element[keyIndex];

        new_value ??= {
          Category: category,
          Name: gameDataValueName,
          Content: {}
        };

        new_value.Content[keyName] = content;
      }

      if (new_value) this.gamedataValues.push(new_value);
    }
  }

  public async onExportFile(file: File) {
    this.file = file;
    this.fileExportProgressState$.next('reading');
    var reader = new FileReader();
    reader.onload = (ev: ProgressEvent<FileReader>) => this.onDecodeFileExport(reader, file.name, ev);
    reader.readAsArrayBuffer(file);
  }

  private async onDecodeFileExport(reader: FileReader, fileName: string, ev: ProgressEvent<FileReader>) {
    var decodeResult = decode(reader.result as ArrayBuffer) as IGamedata;
    this.fileExportProgressState$.next('retriving-server-keys');
    await firstValueFrom(this.api.get<IGamedataValue[]>('gamedatavalues/export'))
      .then(
        r => {
          this.gamedataValues = r;
        },
        error => {
          console.error("CANT RETRIVE SERVER KEYS");
        }
      );

    this.fileExportProgressState$.next('replacing-content');

    this.addValuesToKnowCategory(decodeResult, 'BuffInfo', this.gamedataValues);

    this.fileExportProgressState$.next('finish');

    this.onDownloadLocalization(decodeResult, fileName);
  }

  private addValuesToKnowCategory(decodeResult: IGamedata, category: string, values: IGamedataValue[]) {
    for (const v of values) {
      let finalExportValue: any[] = [];
      for (const element of decodeResult.C[category].K) {
        let keyName = element;
        finalExportValue.push(v.Content[keyName]);
      }
      decodeResult.C[category].D.push(finalExportValue);
    }
  }

  public async onUploadGamedata() {
    if (!this.uploadKeysUrl) return;

    this.fileProgressState$.next('uploading categories');
    await firstValueFrom(this.api.post('gamedatacategories', this.gamedataCategories))
      .then(
        (result) => {

        },
        (error) => {

        }
      );

    this.fileProgressState$.next('uploading keys');
    this.fileProgressBarMax$.next(this.gamedataValues.length);

    while (this.gamedataValues.length > 0) {
      let keysSet = this.gamedataValues.splice(0, this.uploadStackSize);
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

  public async onDownloadLocalization(result: IGamedata, fileName: string) {
    let encodeResult = encode(result) as any;

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
