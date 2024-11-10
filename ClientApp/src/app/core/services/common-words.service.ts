import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ICommonWord } from '../interfaces/i-common-word';
import { BehaviorSubject, Observable, Subject, firstValueFrom, of } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from './local-storage.service';
import { AppModes } from '../enums/app-modes';
import { IndexDBService } from './index-db.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';

@Injectable({
  providedIn: 'root'
})
export class CommonWordsService {
  public words!: ICommonWord[];
  public createOther$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public creating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public deleting$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public change$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(
    private api: ApiService,
    private indexedDB: IndexDBService,
    private lStorage: LocalStorageService,
    private translate: TranslateService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.init();
  }

  private init() {
    let words$: Observable<ICommonWord[]> | Subject<ICommonWord[]> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getAll<ICommonWord[]>(ObjectStoreNames.CommonWord);
      words$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      words$ = this.api.get<ICommonWord[]>('commonwords');
    }

    if (words$ === undefined) words$ = of([]);

    firstValueFrom(words$)
      .then(
        words => { this.words = words },
        error => {
          this.alerts
            .open(this.translate.instant('alert-error-label'),
              {
                label: this.translate.instant('alert-error'),
                autoClose: 3_000,
                closeable: false,
                appearance: 'error'
              }
            ).subscribe({
              complete: () => {
              },
            });
        }
      );
  }

  public async create(word: ICommonWord) {
    let request$: Subject<ICommonWord> | Observable<ICommonWord> | undefined = undefined;
    this.creating$.next(true);
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.post<ICommonWord>(ObjectStoreNames.CommonWord, word, 'Id');
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      request$ = this.api.post<ICommonWord>('commonwords', word);
    }

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(
        createdWord => {
          this.words.push(createdWord);
          this.words = [...this.words];
          this.createOther$.next(true);
        },
        error => {
          this.alerts.open(this.translate.instant('alert-error-label'),
            {
              label: this.translate.instant('alert-error'),
              autoClose: 3_000,
              closeable: false,
              appearance: 'error'
            }
          ).subscribe({
            complete: () => {
            },
          });
        }
      );
    this.creating$.next(false);
  }

  public async update(word: ICommonWord) {
    if (!(word as any)['loader'])
      (word as any)['loader'] = new BehaviorSubject<Boolean>(true);
    else (word as any)['loader'].next(true);

    let tempWord: ICommonWord = {
      Id: word.Id,
      Original: word.Original,
      Translation: word.Translation
    };

    let request$: Subject<ICommonWord> | Observable<ICommonWord> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.put<ICommonWord>(ObjectStoreNames.CommonWord, tempWord);
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      request$ = this.api.put<ICommonWord>('commonwords', tempWord);
    }

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(_ => {
        this.change$.next(true);
      }, _ => {
        this.alerts.open(this.translate.instant('alert-error-label'),
          {
            label: this.translate.instant('alert-error'),
            autoClose: 3_000,
            closeable: false,
            appearance: 'error'
          }
        ).subscribe({
          complete: () => {
          },
        });
      }
      );

    (word as any)['loader'].next(false);
  }

  public async delete(word: ICommonWord, index: number) {
    this.deleting$.next(true);

    let tempWord: ICommonWord = {
      Id: word.Id,
      Original: word.Original,
      Translation: word.Translation
    };

    let request$: Subject<ICommonWord> | Observable<ICommonWord> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.delete<ICommonWord>(ObjectStoreNames.CommonWord, tempWord, 'Id');
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      request$ = this.api.delete<ICommonWord>('commonwords', tempWord)
    }

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(_ => {
        this.words.splice(index, 1);
        this.words = [...this.words];
        this.change$.next(true);
      }, error => {
        this.alerts.open(this.translate.instant('alert-error-label'),
          {
            label: this.translate.instant('alert-error'),
            autoClose: 3_000,
            closeable: false,
            appearance: 'error'
          }
        ).subscribe({
          complete: () => {
          },
        });
      }
      );

    this.deleting$.next(false);
  }

  public confirmDelete(word: ICommonWord) {
    if (!(word as any)['confirm'])
      (word as any)['confirm'] = new BehaviorSubject<Boolean>(true);

    (word as any)['confirm'].next(true);
  }

  public cancelDelete(word: ICommonWord) {
    (word as any)['confirm'].next(false);
  }
}
