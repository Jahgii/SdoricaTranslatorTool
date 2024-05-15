import { Component } from '@angular/core';
import { LanguageOriginService } from './core/services/language-origin.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeDarkComponent } from './components/theme-dark/theme-dark.component';
import { NgIf, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { TuiRootModule, TuiThemeNightModule } from '@taiga-ui/core';
import { SidebarComponent } from './mainlayout/sidebar/sidebar.component';
import { WizardInitialComponent } from './components/wizard-initial/wizard-initial.component';
import { AppStateService } from './core/services/app-state.service';

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
    TuiThemeNightModule,

    //App Components
    ThemeDarkComponent,
    SidebarComponent,
    NavMenuComponent,
    NavBarComponent,
    WizardInitialComponent
  ]
})
export class AppComponent {

  public title = 'Translator Tool';

  constructor(
    public app: AppStateService,
    public theme: ThemeService
  ) {
  }
}
