import { Component } from '@angular/core';
import { LanguageOriginService } from './core/services/language-origin.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { TuiMarkerIconModule } from '@taiga-ui/kit';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeDarkComponent } from './components/theme-dark/theme-dark.component';
import { NgIf, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { TuiRootModule, TuiThemeNightModule } from '@taiga-ui/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    NgIf,
    AsyncPipe,

    //Taiga UI
    TuiRootModule,
    TuiMarkerIconModule,
    TuiThemeNightModule,

    //App Components
    ThemeDarkComponent,
    NavMenuComponent,
    NavBarComponent,
  ]
})
export class AppComponent {

  title = 'Translator Tool';

  constructor(
    public languageOrigin: LanguageOriginService,
    public authService: AuthService,
    public theme: ThemeService
  ) { }
}
