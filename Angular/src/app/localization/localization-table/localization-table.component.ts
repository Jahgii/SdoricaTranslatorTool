import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { EMPTY_QUERY, TuiBooleanHandler, TuiMapper, TuiMapperPipe, tuiPure } from "@taiga-ui/cdk";
import { TuiAppearance, TuiDataList, TuiDriver, TuiDropdown, tuiGetWordRange, TuiHint, TuiIcon, TuiLoader, TuiScrollable, TuiScrollbar, TuiTextfield, TuiButton, TuiLabel, TuiTitle, TuiOptionNew } from "@taiga-ui/core";
import { BehaviorSubject, Observable, pairwise, Subscription } from "rxjs";
import { IGamedataValue } from "src/app/core/interfaces/i-gamedata";
import { ILocalizationKey } from "src/app/core/interfaces/i-localizations";
import { GamedataService } from "src/app/core/services/gamedata.service";
import { LanguageOriginService } from "src/app/core/services/language-origin.service";
import { LocalizationService } from "src/app/core/services/localization.service";
import { TranslateModule } from "@ngx-translate/core";
import { TuiAppBar, TuiBlockStatus } from "@taiga-ui/layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TuiCheckbox, TuiCopy, TuiSwitch, TuiTextarea } from "@taiga-ui/kit";
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { TuiTable, TuiTableFilters } from "@taiga-ui/addon-table";
import { ElementBreakpointService } from "src/app/core/services/element-breakpoint.service";
import { CommonDictionaryDirective } from "src/app/core/directives/common-dictionary.directive";
import { AsyncPipe, KeyValuePipe, NgTemplateOutlet } from "@angular/common";
import { TranslationFocusChangeDirective } from "./translation-focus-change.directive";

const ESPECIAL_CHARACTER = "@";

@Component({
  selector: "app-localization-table",
  templateUrl: "./localization-table.component.html",
  styleUrls: ["./localization-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ElementBreakpointService,
  ],
  imports: [
    KeyValuePipe,
    AsyncPipe,
    NgTemplateOutlet,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    FormsModule,
    ReactiveFormsModule,

    TranslateModule,

    TuiScrollbar,
    TuiScrollable,
    TuiTable,
    TuiTableFilters,
    TuiSwitch,
    TuiIcon,
    TuiTextfield,
    TuiTextarea,
    TuiCheckbox,
    TuiHint,
    TuiDropdown,
    TuiMapperPipe,
    TuiDataList,
    TuiBlockStatus,
    TuiAppBar,
    TuiLoader,
    TuiAppearance,
    TuiButton,
    TuiLabel,
    TuiTitle,
    TuiCopy,

    CommonDictionaryDirective,
    TranslationFocusChangeDirective,
  ]
})
export class LocalizationTableComponent implements OnInit, OnDestroy {
  @ViewChildren(TuiOptionNew, { read: ElementRef })
  private readonly options: QueryList<ElementRef<HTMLElement>> = EMPTY_QUERY;
  @ViewChild(TuiDriver)
  readonly driver?: Observable<boolean>;
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(
    false,
  );
  public predicate: TuiBooleanHandler<Range> = (range) =>
    tuiGetWordRange(range).toString().startsWith(ESPECIAL_CHARACTER);

  private subsBreakpoint!: Subscription;
  protected open = false;

  constructor(
    public localization: LocalizationService,
    public languageOrigin: LanguageOriginService,
    public buffInfService: GamedataService,
    @Inject(ElementBreakpointService) readonly breakpointService:
      ElementBreakpointService,
  ) { }

  ngOnInit(): void {
    this.reapplySearchOnElementResize();
  }

  ngOnDestroy(): void {
    if (this.subsBreakpoint) this.subsBreakpoint.unsubscribe();
  }

  public onRenderDefaultLanguage(
    translations: { [language: string]: string },
  ): string {
    return translations[this.languageOrigin.localizationLang];
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbar) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['offsetHeight'] < scrollTooltip['el']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

  public reapplySearchOnElementResize() {
    this.subsBreakpoint = this.breakpointService
      .mode$
      .pipe(pairwise())
      .subscribe(([previousMode, currentMode]) => {
        if (currentMode != "none") {
          if (
            previousMode === "desktopSmall" && currentMode === "desktopLarge"
          ) return;
          if (
            previousMode === "desktopLarge" && currentMode === "desktopSmall"
          ) return;

          let reapplyFilters = false;

          let filterOriginal = this.localization.filterForm.controls.original;
          let filterTranslation =
            this.localization.filterForm.controls.translation;
          let filterTranslated =
            this.localization.filterForm.controls.translated;

          if (filterOriginal.value || filterTranslation.value) {
            reapplyFilters = true;
          }

          if (filterTranslated.value !== null) reapplyFilters = true;

          if (reapplyFilters === false) return;

          //Wait Table popin animation
          setTimeout(() => {
            this.localization.filterForm.patchValue({
              original: filterOriginal.value,
              translation: filterTranslation.value,
            }, { emitEvent: true });
          }, 250);
        }
      });
  }

  //#region BuffInfo Autocomplete
  public onArrow(event: Event, which: "first" | "last"): void {
    const item = this.options[which];

    if (!item) {
      event.stopImmediatePropagation();
      return;
    }

    event.preventDefault();
    item.nativeElement.focus();
  }

  public filterItems(textarea: HTMLTextAreaElement): readonly IGamedataValue[] {
    const search = this.getCurrentSearch(textarea).replace(
      ESPECIAL_CHARACTER,
      "",
    );

    return this.getFilteredItems(this.buffInfService.getData, search);
  }

  public onClick(
    key: ILocalizationKey,
    name: string,
    textarea: HTMLTextAreaElement,
  ): void {
    name = `$BUFF:(${name})`;
    const currentCaretPosition = textarea.selectionStart;
    const search = this.getCurrentSearch(textarea);
    const value = key.Translations[this.languageOrigin.localizationLang]
      .replace(search, name);
    const caret = value.indexOf(name, currentCaretPosition - name.length) + name.length;

    key.Translations[this.languageOrigin.localizationLang] = value;
    textarea.focus();
    textarea.value = value;
    textarea.setSelectionRange(caret, caret);
  }

  protected search(textarea: any): string {
    return textarea.value.slice(textarea.value.indexOf(ESPECIAL_CHARACTER), textarea.selectionStart) || '';
  }

  protected readonly filter: TuiMapper<[readonly IGamedataValue[], string], readonly IGamedataValue[]> = (
    items,
    search,
  ) =>
    items.filter(
      ({ Name }) => Name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    );

  @tuiPure
  private getFilteredItems(
    items: readonly IGamedataValue[],
    search: string,
  ): readonly IGamedataValue[] {
    return items.filter(({ Name }) => Name.startsWith(search));
  }

  private getCurrentSearch(textarea: HTMLTextAreaElement): string {
    return textarea.value.slice(
      textarea.value.indexOf(ESPECIAL_CHARACTER),
      textarea.selectionStart,
    ) || '';
  }
  //#endregion

  public trackByItemId(index: number, item: ILocalizationKey): string {
    return String(item.Id);
  }

}
