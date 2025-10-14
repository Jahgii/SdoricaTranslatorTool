import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TuiBreakpointService, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiDataList, TuiLoader, TuiScrollbar, TuiButton, TuiHint, TuiTextfield, TuiIcon, TuiLabel } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiButtonLoading, TuiSelect, TuiChevron } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { AsyncPipe, KeyValuePipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { LocalizationCategoriesService } from '../localization-categories.service';
import { DraggableElementDirective } from 'src/app/core/directives/draggable-element.directive';
import { DialogstateService } from 'src/app/core/services/dialogstate.service';
import { DialogState } from 'src/app/core/interfaces/i-dialog';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { AppModes } from 'src/app/core/enums/app-modes';
import { AlertService } from 'src/app/core/services/alert.service';

type KeyNameVerification = 'untoching' | 'verifying' | 'invalid' | 'valid';

@Component({
    selector: 'app-localization-key',
    templateUrl: './localization-key.component.html',
    styleUrls: ['./localization-key.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [],
    imports: [
        ReactiveFormsModule,
        FormsModule,
        NgStyle,
        NgTemplateOutlet,
        AsyncPipe,
        KeyValuePipe,
        TranslateModule,
        TuiButton,
        TuiScrollbar,
        TuiTextfield,
        TuiLabel,
        TuiSelect,
        TuiChevron,
        TuiDataList,
        TuiDataListWrapper,
        TuiHint,
        TuiLoader,
        TuiButtonLoading,
        TuiIcon,
        DraggableElementDirective,
    ]
})
export class LocalizationKeyComponent implements OnInit, OnDestroy {
  @ViewChild('createTemplate') createTemplateView!: TemplateRef<any>;
  @Output() created = new EventEmitter();

  public dialogStateName = 'locKey';
  public dialogState: DialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 55,
    yBottomMargin: 10,
    zIndex$: new BehaviorSubject(1)
  };

  public keyForm: FormGroup = this.fB.group({
    Category: ['', [Validators.required]],
    Name: [{ value: '', disabled: true }, [Validators.required]],
    Translated: this.fB.group({}),
    Original: this.fB.group({}),
    Translations: this.fB.group({}),
    _version: 1
  });

  public categories$!: Observable<ILocalizationCategory[]>;

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
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly fB: FormBuilder,
    private readonly translate: TranslateService,
    private readonly cd: ChangeDetectorRef,
    private readonly lStorage: LocalStorageService,
    private readonly dStateService: DialogstateService,
    private readonly alertS: AlertService,
    public readonly lCS: LocalizationCategoriesService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.dStateService.addState(this.dialogStateName, this.dialogState);
  }

  ngOnInit(): void {
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getAll<ILocalizationCategory[]>(ObjectStoreNames.LocalizationCategory);
      this.categories$ = r.success$;

      this.categories$.subscribe(e => this.categories$ = of(e));
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      this.categories$ = this.api.get<ILocalizationCategory[]>('localizationcategories');
    }

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
          if (this.dialogState.zIndex$.value === 2)
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
          this.changeIndex(this.dialogState);
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
    let search$: Subject<ILocalizationKey[]> | Observable<ILocalizationKey[]> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB
        .getIndex<ILocalizationKey[]>(
          ObjectStoreNames.LocalizationKey,
          "Name",
          [category.Name, key]
        );
      search$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      search$ = this.api
        .getWithHeaders<ILocalizationKey[]>(
          'localizationkeys/searchkeyequal',
          { category: category.Name, key: key }
        );
    }

    if (search$ === undefined) return;

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

    let request$: Subject<ILocalizationKey> | Observable<ILocalizationKey> | undefined = undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.post<ILocalizationKey>(ObjectStoreNames.LocalizationKey, key, 'Id');
      request$ = r.success$;
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      request$ = this.api.post<ILocalizationKey>('localizationkeys', key);
    }

    if (request$ === undefined) return;

    await firstValueFrom(request$)
      .then(
        _ => {
          this.createOther$.next(true);
          this.lCS.addCategoryKeys(key);
          this.alertS.showAlert('alert-success', 'success-create-key', 'positive');
          this.onCreateOther();
        },
        _ => {
          this.alertS.showAlert('alert-error-label', 'error-create-key', 'accent');
        }
      );
    this.creating$.next(false);
  }

  public onCreateOther() {
    this.keyForm.reset(undefined, { emitEvent: false });
    this.keyForm.patchValue({
      Category: '',
      _version: 1
    });
    let originalForm = this.keyForm.controls['Original'] as FormGroup;
    for (let key in originalForm.controls) {
      originalForm.removeControl(key, { emitEvent: false });
    }

    this.availableKeyName$.next('untoching');
    this.createOther$.next(false);
    this.categorySelected$.next(false);
  }

  public changeIndex(state: DialogState) {
    this.dStateService.onChangeIndex(state);
  }
}
