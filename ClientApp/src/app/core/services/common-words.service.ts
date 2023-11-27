import { Inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ICommonWord } from '../interfaces/i-common-word';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) {
    this.init();
  }

  private init() {
    firstValueFrom(this.api.get<ICommonWord[]>('commonwords'))
      .then(
        words => { this.words = words },
        error => {
          this.alerts.open(this.translate.instant('alert-error-label'),
            {
              label: this.translate.instant('alert-error'),
              autoClose: true,
              hasCloseButton: false,
              status: 'success'
            }
          ).subscribe({
            complete: () => {
            },
          });
        }
      );
  }

  public async create(word: ICommonWord) {
    this.creating$.next(true);
    await firstValueFrom(this.api.post<ICommonWord>('commonwords', word))
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
              autoClose: true,
              hasCloseButton: false,
              status: 'success'
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

    await firstValueFrom(this.api.put<ICommonWord[]>('commonwords', tempWord))
      .then(
        updatedWord => {
          this.change$.next(true);
        },
        error => {
          this.alerts.open(this.translate.instant('alert-error-label'),
            {
              label: this.translate.instant('alert-error'),
              autoClose: true,
              hasCloseButton: false,
              status: 'success'
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

    await firstValueFrom(this.api.delete<ICommonWord>('commonwords', tempWord))
      .then(
        deletedWord => {
          this.words.splice(index, 1);
          this.words = [...this.words];
          this.change$.next(true);
        },
        error => {
          this.alerts.open(this.translate.instant('alert-error-label'),
            {
              label: this.translate.instant('alert-error'),
              autoClose: true,
              hasCloseButton: false,
              status: 'success'
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
