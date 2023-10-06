import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { EMPTY_QUERY, TuiBooleanHandler, tuiPure } from '@taiga-ui/cdk';
import { TuiBreakpointService, TuiDriver, TuiOptionComponent, TuiScrollbarComponent, tuiGetWordRange } from '@taiga-ui/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGamedataValue } from 'src/app/core/interfaces/i-gamedata';
import { ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { GamedataService } from 'src/app/core/services/gamedata.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalizationService } from 'src/app/core/services/localization.service';

const ESPECIAL_CHARACTER = '@'

@Component({
  selector: 'app-localization-table',
  templateUrl: './localization-table.component.html',
  styleUrls: ['./localization-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
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
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
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
