import { Component } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { TuiRoot } from '@taiga-ui/core';
import { SidebarComponent } from './mainlayout/sidebar/sidebar.component';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    AsyncPipe,

    //Taiga UI
    TuiRoot,

    //App Components
    SidebarComponent,
    HeaderMenuComponent,
    NavBarComponent,
  ]
})
export class AppComponent {

  public title = 'STT';

  constructor(
    public app: AppStateService,
    public theme: ThemeService
  ) {
  }
}
