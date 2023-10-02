import { Inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { ApiService } from './api.service';
import { TuiBreakpointService, TuiDialogContext, TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';
import { IGamedataValue } from '../interfaces/i-gamedata';
import { StoreService } from './store.service';

@Injectable()
export class GamedataService extends StoreService<IGamedataValue> {

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

  constructor(
    private fB: FormBuilder,
    private api: ApiService,
    private translate: TranslateService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) {
    super(api.getWithHeaders('gamedatavalues', { category: 'BuffInfo' }));
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
    let search$ = this.api
      .getWithHeaders<IGamedataValue[]>(
        'gamedatavalues/searchkeyequal',
        { category: category, key: key }
      );

    firstValueFrom(search$)
      .then(r => {
        if (r.length > 0) this.availableKeyName$.next(KeyNameVerification.INVALID);
        else this.availableKeyName$.next(KeyNameVerification.VALID);
      });
  }

  public async onCreateKey() {
    this.creating$.next(true);
    let value: IGamedataValue = this.buffInfoForm.getRawValue();
    let add$ = this.api.post<IGamedataValue>('gamedatavalues', value);

    await this.addFromHttp(add$)
      .then(e => {
        this.createOther$.next(true);
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
      Category: value.Category,
      Name: value.Name,
      Content: value.Content,
      Custom: value.Custom
    }

    let update$ = this.api.put<IGamedataValue>('gamedatavalues', tempValue);

    await this.updateFromHttp(update$, index)
      .then(e => {
        this.createOther$.next(true);
      });

    (value as any)['loader'].next(false);
  }

  public async onDelete(value: IGamedataValue, index: number) {
    this.deleting$.next(true);

    let tempValue: IGamedataValue = {
      Category: value.Category,
      Name: value.Name,
      Content: value.Content,
      Custom: value.Custom
    }

    let delete$ = this.api.delete<IGamedataValue>('gamedatavalues', tempValue)

    await this.removeFromHttp(delete$, index)
      .then(e => { });

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