import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ICommonWord } from '../interfaces/i-common-word';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonWordsService {
  public words!: ICommonWord[];
  public createOther$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public creating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public change$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor(private api: ApiService) {
    this.init();
  }

  private init() {
    firstValueFrom(this.api.get<ICommonWord[]>('commonwords'))
      .then(
        words => { this.words = words },
        error => { }
      );
  }

  public async create(word: ICommonWord) {
    this.creating$.next(true);
    await firstValueFrom(this.api.post<ICommonWord>('commonwords', word))
      .then(
        createdWord => {
          this.words.push(createdWord);
          this.change$.next(true);
          this.createOther$.next(true);
        },
        error => { }
      );
    this.creating$.next(false);
  }

  public async update(word: ICommonWord) {
    (word as any)['loader'] = new BehaviorSubject<Boolean>(true);
    await firstValueFrom(this.api.put<ICommonWord[]>('commonwords', word))
      .then(
        updatedWord => {
          this.change$.next(true);
        },
        error => { }
      );
    (word as any)['loader'].next(false);
  }

  public async delete(word: ICommonWord, index: number) {
    await firstValueFrom(this.api.delete<ICommonWord>('commonwords', word))
      .then(
        deletedWord => {
          this.words.splice(index, 1);
          this.change$.next(true);
        },
        error => { }
      );
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
