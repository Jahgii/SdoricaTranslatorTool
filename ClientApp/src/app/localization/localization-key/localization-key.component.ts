import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TuiStringHandler } from '@taiga-ui/cdk';
import {
  TuiBreakpointService,
  TuiDialogContext,
  TuiDialogService,
  TuiDialogSize,
  TuiModeModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule,
  TuiDataListModule,
  TuiPrimitiveTextfieldModule
} from '@taiga-ui/core';
import { tuiItemsHandlersProvider, TuiSelectModule, TuiInputModule } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiDataListWrapperModule } from '@taiga-ui/kit/components/data-list-wrapper';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, AsyncPipe, KeyValuePipe } from '@angular/common';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { LocalizationCategoriesService } from '../localization-categories.service';
import { DraggableElementDirective } from 'src/app/core/directives/draggable-element.directive';

const STRINGIFY_CATEGORIES: TuiStringHandler<ILocalizationCategory> = (c: ILocalizationCategory) =>
  c ? `${c.Name}` : '***';

type KeyNameVerification = 'untoching' | 'verifying' | 'invalid' | 'valid';

@Component({
  selector: 'app-localization-key',
  templateUrl: './localization-key.component.html',
  styleUrls: ['./localization-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [tuiItemsHandlersProvider({ stringify: STRINGIFY_CATEGORIES })],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    AsyncPipe,
    KeyValuePipe,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,

    TuiButtonModule,
    TuiModeModule,
    TuiScrollbarModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
    TuiInputModule,
    TuiPrimitiveTextfieldModule,
    TuiHintModule,
    TuiLoaderModule,

    DraggableElementDirective,
  ],
})
export class LocalizationKeyComponent implements OnInit, OnDestroy {
  @ViewChild('createTemplate') createTemplateView!: TemplateRef<any>;
  @Output() created = new EventEmitter();

  public dialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 55,
    yBottomMargin: 10
  };

  public keyForm: FormGroup = this.fB.group({
    Category: ['', [Validators.required]],
    Name: [{ value: '', disabled: true }, [Validators.required]],
    Translated: this.fB.group({}),
    Original: this.fB.group({}),
    Translations: this.fB.group({}),
    _version: 1
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
  private subsBreakpoint!: Subscription | undefined;
  private subsDialog!: Subscription | undefined;

  constructor(
    private api: ApiService,
    private fB: FormBuilder,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private lCS: LocalizationCategoriesService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
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

    this.subsBreakpoint = this.breakpointService$.subscribe(v => {
      if (v == 'mobile') {
        if (this.dialogState.isHidden === false) {
          this.dialogState.isHidden = true;
          this.onShowCreate(this.createTemplateView, 'm');
          this.cd.detectChanges();
        }
      }
      else {
        if (this.subsDialog) {
          this.subsDialog.unsubscribe();
          this.subsDialog = undefined;
          this.dialogState.isHidden = false;
          this.cd.detectChanges();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subsCategory?.unsubscribe();
    this.subsKeyName?.unsubscribe();
    this.subsBreakpoint?.unsubscribe();
  }

  public onShowCreate(content: PolymorpheusContent<TuiDialogContext>, size: TuiDialogSize) {
    firstValueFrom(this.breakpointService$)
      .then(v => {
        if (window.innerHeight > 500 && (v == 'desktopLarge' || v == 'desktopSmall')) {
          this.dialogState.isHidden = !this.dialogState.isHidden;
        }
        else {
          this.subsDialog = this.dialogs
            .open(content, {
              label: this.translate.instant('new-key-form'),
              size: size
            })
            .subscribe({
              complete: () => {
                this.subsDialog = undefined;
              },
            });
        }
      });
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

    await firstValueFrom(this.api.post<ILocalizationKey>('localizationkeys', key))
      .then(
        r => {
          this.createOther$.next(true);
          this.lCS.addCategoryKeys(key);
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
