import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGamedataValue } from 'src/app/core/interfaces/i-gamedata';
import { ApiService } from 'src/app/core/services/api.service';

type KeyNameVerification = 'untoching' | 'verifying' | 'invalid' | 'valid';

@Component({
  selector: 'app-gamedata-values',
  templateUrl: './gamedata-values.component.html',
  styleUrls: ['./gamedata-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ]
})
export class GamedataValuesComponent implements OnInit, OnDestroy {
  @Output() created = new EventEmitter();
  public menuOpen = false;

  public dialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    xLLimits: 198,
    xRLimits: 195,
    yTLimits: 16,
    yBLimits: 75
  };

  public listDialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    xLLimits: 198,
    xRLimits: 195,
    yTLimits: 16,
    yBLimits: 75
  };

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
    BehaviorSubject<KeyNameVerification>('untoching');
  public creating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public createOther$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private subsKeyName!: Subscription | undefined;

  constructor(
    private fB: FormBuilder,
    private api: ApiService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.subsKeyName = this.contentForm
      .controls['id']?.valueChanges
      .pipe(
        map(v => {
          this.availableKeyName$.next('verifying');
          this.buffInfoForm.patchValue({ Name: v });
          return v;
        }),
        debounceTime(1000)
      )
      .subscribe(this.onKeyNameChange.bind(this));
  }

  ngOnDestroy(): void {
    this.subsKeyName?.unsubscribe();
  }

  public onShowCreateNew() {
    this.menuOpen = false;
    this.dialogState.isHidden = !this.dialogState.isHidden;

    this.cd.detectChanges();
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
        if (r.length > 0) this.availableKeyName$.next('invalid');
        else this.availableKeyName$.next('valid');
      });
  }

  public async onCreateKey() {
    this.creating$.next(true);
    let value: IGamedataValue = this.buffInfoForm.getRawValue();

    await firstValueFrom(this.api.post('gamedatavalues', value))
      .then(
        r => {
          this.createOther$.next(true);
          this.created.emit();
        },
        error => { }
      );
    this.creating$.next(false);
  }

  public onCreateOther() {
    this.contentForm.reset(undefined, { emitEvent: false });

    this.availableKeyName$.next('untoching');
    this.createOther$.next(false);

    this.contentForm.patchValue({
      order: 90000,
      viewable: false
    }, { emitEvent: false });
  }

  //#region List
  public gamedataValues$: Observable<IGamedataValue[]> =
    this.api.getWithHeaders('gamedatavalues', { category: 'BuffInfo' });

  public onShowList() {
    this.menuOpen = false;
    this.listDialogState.isHidden = !this.listDialogState.isHidden;

    this.cd.detectChanges();
  }

  public async onUpdateValue(value: IGamedataValue) {
    (value as any)['loader'] = new BehaviorSubject<Boolean>(true);
    let update$ = this.api.put('gamedatavalues', value);

    await firstValueFrom(update$)
      .then(r => {

      });

    (value as any)['loader'].next(false);
  }
  //#endregion

}
