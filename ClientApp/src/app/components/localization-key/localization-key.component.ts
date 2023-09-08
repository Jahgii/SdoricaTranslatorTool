import { ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { tuiItemsHandlersProvider } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';

const STRINGIFY_CATEGORIES: TuiStringHandler<ILocalizationCategory> = (c: ILocalizationCategory) =>
  c ? `${c.Name}` : 'Select One Category';

type KeyNameVerification = 'untoching' | 'verifying' | 'invalid' | 'valid';

@Component({
  selector: 'app-localization-key',
  templateUrl: './localization-key.component.html',
  styleUrls: ['./localization-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiItemsHandlersProvider({ stringify: STRINGIFY_CATEGORIES })],
})
export class LocalizationKeyComponent implements OnInit, OnDestroy {
  @Output() created = new EventEmitter();

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

  public keyForm: FormGroup = this.fB.group({
    Category: ['', [Validators.required]],
    Name: [{ value: '', disabled: true }, [Validators.required]],
    Translated: this.fB.group({}),
    Original: this.fB.group({}),
    Translations: this.fB.group({})
  });

  public categories$: Observable<ILocalizationCategory[]> = this.api
    .get<ILocalizationCategory[]>('localizationcategories');

  public categorySelected$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public availableKeyName$: BehaviorSubject<KeyNameVerification> = new
    BehaviorSubject<KeyNameVerification>('untoching');
  public creating$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public createOther$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private subsCategory!: Subscription | undefined;
  private subsKeyName!: Subscription | undefined;

  constructor(
    private api: ApiService,
    private fB: FormBuilder
  ) {

  }

  ngOnInit(): void {
    this.subsCategory = this.keyForm
      .controls['Category']?.valueChanges
      .subscribe(this.onCategoryChange.bind(this));

    this.subsKeyName = this.keyForm
      .controls['Name']?.valueChanges
      .pipe(
        map(v => {
          this.availableKeyName$.next('verifying');
          return v;
        }),
        debounceTime(1000)
      )
      .subscribe(this.onKeyNameChange.bind(this));
  }

  ngOnDestroy(): void {
    this.subsCategory?.unsubscribe();
    this.subsKeyName?.unsubscribe();
  }

  public onCategoryChange(c: ILocalizationCategory) {
    let originalForm = this.keyForm.controls['Original'] as FormGroup;
    let currentValues: { [key: string]: string } = {};
    for (let key in originalForm.controls) {
      currentValues[key] = originalForm.controls[key].value;
      originalForm.removeControl(key);
    }
    for (let key in c.Keys) {
      if (key == 'Key') continue;
      originalForm.addControl(key, this.fB.control(currentValues[key] ?? '', [Validators.required]));
    }

    this.keyForm.controls['Name'].enable({ emitEvent: false });
    this.categorySelected$.next(true);

    let keyNameControl = this.keyForm.controls['Name'];
    if (keyNameControl.value) keyNameControl.patchValue(keyNameControl.value);
  }

  public onKeyNameChange(key: string) {
    let category = this.keyForm.controls['Category'].value as ILocalizationCategory;
    let search$ = this.api
      .getWithHeaders<ILocalizationKey[]>(
        'localizationkeys/searchkeyequal',
        { category: category.Name, key: key }
      );

    firstValueFrom(search$)
      .then(r => {
        if (r.length > 0) this.availableKeyName$.next('invalid');
        else this.availableKeyName$.next('valid');
      });
  }

  public async onCreateKey() {
    this.creating$.next(true);
    let key: ILocalizationKey = this.keyForm.getRawValue();
    key.Category = (this.keyForm.controls['Category'].value as ILocalizationCategory).Name;
    key.Custom = true;

    for (let langKey in key.Original) {
      key.Translations[langKey] = "";
      key.Translated[langKey] = false;
    }

    await firstValueFrom(this.api.post('localizationkeys', key))
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
    this.keyForm.reset(undefined, { emitEvent: false });
    let originalForm = this.keyForm.controls['Original'] as FormGroup;
    for (let key in originalForm.controls) {
      originalForm.removeControl(key, { emitEvent: false });
    }

    this.availableKeyName$.next('untoching');
    this.categorySelected$.next(false);
    this.createOther$.next(false);
  }
}
