import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from './core/services/theme.service';
import { HeaderMenuComponent } from './components/header-menu/header-menu.component';
import { RouterOutlet } from '@angular/router';
import { TuiRoot } from '@taiga-ui/core';
import { SidebarComponent } from './mainlayout/sidebar/sidebar.component';
import { AppStateService } from './core/services/app-state.service';
import { LangService } from './core/services/lang.service';
import { TuiSkeleton } from '@taiga-ui/kit';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    RouterOutlet,
    TuiRoot,
    TuiSkeleton,
    SidebarComponent,
    HeaderMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected readonly app = inject(AppStateService);
  protected readonly theme = inject(ThemeService);
  protected readonly translate = inject(LangService);

  public title = 'STT';
}
