import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { tuiPure, TuiStringHandler, TuiContextWithImplicit } from '@taiga-ui/cdk';
import { BehaviorSubject } from 'rxjs';
import { ILibreTranslateLanguages } from 'src/app/core/interfaces/i-libre-translate';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  public openSetting: boolean = false;
  public nightMode$ = new BehaviorSubject<boolean>(false);

  constructor(
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    readonly translate: TranslateService
  ) { }

  public switchTheme(): void {
    this.nightMode$.next(!this.nightMode$.value);
  }

  public onToogleSettings() {
    this.openSetting = !this.openSetting;
  }

  public onChangeAppLanguage() {

  }

  @tuiPure
  stringify(
    items: readonly ILibreTranslateLanguages[],
  ): TuiStringHandler<TuiContextWithImplicit<string>> {
    const map = new Map(items.map(({ code, name }) => [code, name] as [string, string]));

    return ({ $implicit }: TuiContextWithImplicit<string>) => map.get($implicit) || '';
  }
}
