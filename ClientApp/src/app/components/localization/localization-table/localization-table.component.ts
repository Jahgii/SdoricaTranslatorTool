import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { EMPTY_QUERY, TuiBooleanHandler, tuiPure } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDriver, TuiOptionComponent, TuiScrollbarComponent, tuiGetWordRange, TuiScrollbarModule, TuiTextfieldControllerModule, TuiDataListModule } from '@taiga-ui/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGamedataValue } from 'src/app/core/interfaces/i-gamedata';
import { ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { GamedataService } from 'src/app/core/services/gamedata.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiAppBarModule } from '@taiga-ui/addon-mobile';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiDropdownModule } from '@taiga-ui/core/directives/dropdown';
import { CommonDictionaryDirective } from '../../../core/directives/common-dictionary.directive';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiCheckboxModule } from '@taiga-ui/kit/components/checkbox';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiTooltipModule } from '@taiga-ui/core/components/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiToggleModule, TuiInputModule, TuiTextareaModule } from '@taiga-ui/kit';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TuiTableFiltersModule, TuiTableModule } from '@taiga-ui/addon-table';
import { NgIf, NgTemplateOutlet, NgFor, AsyncPipe, KeyValuePipe, CommonModule } from '@angular/common';
import { ElementBreakpoint, ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';

const ESPECIAL_CHARACTER = '@'

@Component({
  selector: 'app-localization-table',
  templateUrl: './localization-table.component.html',
  styleUrls: ['./localization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ElementBreakpointService
  ],
  animations: [
    popinAnimation,
    fadeinAnimation
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    TuiTableFiltersModule,
    TuiScrollbarModule,
    TuiTableModule,
    TuiToggleModule,
    TuiTooltipModule,
    TuiSvgModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiCheckboxModule,
    TuiHintModule,
    TuiTextareaModule,
    TuiDropdownModule,
    TuiDataListModule,
    TuiBlockStatusModule,
    TuiAppBarModule,
    TuiLoaderModule,

    CommonDictionaryDirective
  ]
})
export class LocalizationTableComponent implements OnInit {
  @ViewChildren(TuiOptionComponent, { read: ElementRef })
  private readonly options: QueryList<ElementRef<HTMLElement>> = EMPTY_QUERY;
  @ViewChild(TuiDriver) readonly driver?: Observable<boolean>;
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public predicate: TuiBooleanHandler<Range> = range =>
    tuiGetWordRange(range).toString().startsWith(ESPECIAL_CHARACTER);

  constructor(
    public localization: LocalizationService,
    public languageOrigin: LanguageOriginService,
    public buffInfService: GamedataService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  ngOnInit(): void {
  }

  public onRenderDefaultLanguage(translations: { [language: string]: string }): string {
    return translations[this.languageOrigin.localizationLang];
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbarComponent) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['nativeElement']['offsetHeight'] < scrollTooltip['el']['nativeElement']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

  //#region BuffInfo Autocomplete
  public onArrow(event: Event, which: 'first' | 'last'): void {
    const item = this.options[which];

    if (!item) {
      return;
    }

    event.preventDefault();
    item.nativeElement.focus();
  }

  public filterItems(textarea: HTMLTextAreaElement): readonly IGamedataValue[] {
    const search = this.getCurrentSearch(textarea).replace(ESPECIAL_CHARACTER, '');

    return this.getFilteredItems(this.buffInfService.getData(), search);
  }

  public onClick(key: ILocalizationKey, name: string, textarea: HTMLTextAreaElement): void {
    name = `$BUFF:(${name})`;
    const search = this.getCurrentSearch(textarea);
    const value = key.Translations[this.languageOrigin.localizationLang].replace(search, name);
    const caret = value.indexOf(name) + name.length;

    key.Translations[this.languageOrigin.localizationLang] = value;
    textarea.focus();
    textarea.value = value;
    textarea.setSelectionRange(caret, caret);
  }

  @tuiPure
  private getFilteredItems(items: readonly IGamedataValue[], search: string): readonly IGamedataValue[] {
    return items.filter(({ Name }) => Name.startsWith(search));
  }

  private getCurrentSearch(textarea: HTMLTextAreaElement): string {
    return textarea.value.slice(textarea.value.indexOf(ESPECIAL_CHARACTER), textarea.selectionStart);
  }
  //#endregion
}
