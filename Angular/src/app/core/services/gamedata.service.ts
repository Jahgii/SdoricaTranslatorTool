import { Inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of } from 'rxjs';
import { ApiService } from './api.service';
import { TuiBreakpointService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { IGamedataValue } from '../interfaces/i-gamedata';
import { StoreService } from './store.service';
import { AppModes } from '../enums/app-modes';
import { IndexDBService } from './index-db.service';
import { LocalStorageService } from './local-storage.service';
import { ObjectStoreNames } from '../interfaces/i-indexed-db';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GamedataService {

  public buffInfoForm: FormGroup = this.fB.group({
    Category: ['BuffInfo', [Validators.required]],
    Name: ['', [Validators.required]],
    Custom: [true, [Validators.required]],
    Content: this.fB.group({
      id: ['', [Validators.required]],
      iconKey: ['', [Validators.required]],
      localizationInfoKey: ['', [Validators.required]],
      localizationNameKey: ['', [Validators.required]],
      order: [90000, [Validators.required, Validators.min(90000)]],
      viewable: [false, [Validators.required]]
    })
  });

  public contentForm: FormGroup = this.buffInfoForm.controls['Content'] as FormGroup;

  public availableKeyName$: BehaviorSubject<KeyNameVerification> = new
    BehaviorSubject<KeyNameVerification>(KeyNameVerification.UNTOCHING);
  public creating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public createOther$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public deleting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public subsKeyName!: Subscription | undefined;

  public store!: StoreService<IGamedataValue>;

  get getData() { return this.store.getData() }

  constructor(
    private readonly fB: FormBuilder,
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    private readonly alert: AlertService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) {
    this.init();
  }

  private init() {
    let gamedata$: Observable<IGamedataValue[]> | Subject<IGamedataValue[]> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getAll<IGamedataValue[]>(ObjectStoreNames.GamedataValue);
      gamedata$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      gamedata$ = this.api.getWithHeaders<IGamedataValue[]>('gamedatavalues', { category: 'BuffInfo' });
    }

    if (gamedata$ === undefined) gamedata$ = of([]);

    this.store = new StoreService<IGamedataValue>(gamedata$);

    this.subsKeyName = this.contentForm
      .controls['id']?.valueChanges
      .pipe(
        map(v => {
          this.availableKeyName$.next(KeyNameVerification.VERIFYING);
          this.buffInfoForm.patchValue({ Name: v });
          return v;
        }),
        debounceTime(1000)
      )
      .subscribe(this.onKeyNameChange.bind(this));
  }

  public onKeyNameChange(key: string) {
    let category = this.buffInfoForm.controls['Category'].value as string;
    let search$: Subject<IGamedataValue> | Observable<IGamedataValue[]> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB
        .getCursor<IGamedataValue>(
          ObjectStoreNames.GamedataValue,
          e => e.Category === category && e.Name === key
        );
      search$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      search$ = this.api
        .getWithHeaders<IGamedataValue[]>(
          'gamedatavalues/searchkeyequal',
          { category: category, key: key }
        );
    }

    if (search$ === undefined) return;

    firstValueFrom(search$)
      .then(r => {
        if (r.length > 0) this.availableKeyName$.next(KeyNameVerification.INVALID);
        else this.availableKeyName$.next(KeyNameVerification.VALID);
      });
  }

  public async onCreateKey() {
    this.creating$.next(true);
    let value: IGamedataValue = this.buffInfoForm.getRawValue();
    let add$: Subject<IGamedataValue> | Observable<IGamedataValue> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.post<IGamedataValue>(ObjectStoreNames.GamedataValue, value, 'Id');
      add$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      add$ = this.api.post<IGamedataValue>('gamedatavalues', value);
    }

    if (add$ === undefined) return;

    await this.store.addFromHttp(add$)
      .then(_ => {
        this.createOther$.next(true);
        this.onCreateOther();
        this.alert.showAlert('alert-success', 'alert-success-label-gamedata-created', 'positive', 'circle-check-big');
      }, _ => {
        this.alert.showAlert('alert-error', 'error-create-gamedata', 'accent', 'triangle-alert');
      });

    this.creating$.next(false);
  }

  public onCreateOther() {
    this.contentForm.reset(undefined, { emitEvent: false });

    this.availableKeyName$.next(KeyNameVerification.UNTOCHING);
    this.createOther$.next(false);

    this.contentForm.patchValue({
      order: 90000,
      viewable: false
    }, { emitEvent: false });
  }

  public async onUpdateValue(value: IGamedataValue, index: number) {
    (value as any)['loader'] = new BehaviorSubject<Boolean>(true);

    let tempValue: IGamedataValue = {
      Id: value.Id,
      Category: value.Category,
      Name: value.Name,
      Content: value.Content,
      Custom: value.Custom
    }

    let update$: Subject<IGamedataValue> | Observable<IGamedataValue> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.put<IGamedataValue>(ObjectStoreNames.GamedataValue, tempValue);
      update$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      update$ = this.api.put<IGamedataValue>('gamedatavalues', tempValue);
    }

    if (update$ === undefined) return;

    await this.store.updateFromHttp(update$, index)
      .then(_ => {
        this.createOther$.next(true);
        this.alert.showAlert('alert-success', 'alert-success-label-gamedata-updated', 'positive', 'circle-check-big');
      }, _ => {
        this.alert.showAlert('alert-error', 'alert-error-label', 'accent', 'triangle-alert');
      });

    (value as any)['loader'].next(false);
  }

  public async onDelete(value: IGamedataValue, index: number) {
    this.deleting$.next(true);

    let tempValue: IGamedataValue = {
      Id: value.Id,
      Category: value.Category,
      Name: value.Name,
      Content: value.Content,
      Custom: value.Custom
    }

    let delete$: Subject<IGamedataValue> | Observable<IGamedataValue> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.delete<IGamedataValue>(ObjectStoreNames.GamedataValue, tempValue, 'Id');
      delete$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      delete$ = this.api.delete<IGamedataValue>('gamedatavalues', tempValue);
    }

    if (delete$ === undefined) return;

    await this.store.removeFromHttp(delete$, index)
      .then(_ => {
        this.alert.showAlert('alert-success', 'alert-success-label-gamedata-deleted', 'positive', 'circle-check-big');
      }, _ => {
        this.alert.showAlert('alert-error', 'alert-error-label', 'accent', 'triangle-alert');
      });

    this.deleting$.next(false);
  }

  public confirmDelete(value: IGamedataValue) {
    if (!(value as any)['confirm'])
      (value as any)['confirm'] = new BehaviorSubject<Boolean>(true);

    (value as any)['confirm'].next(true);
  }

  public cancelDelete(value: IGamedataValue) {
    (value as any)['confirm'].next(false);
  }

}

export enum KeyNameVerification {
  UNTOCHING = 'untoching',
  VERIFYING = 'verifying',
  INVALID = 'invalid',
  VALID = 'valid'
}