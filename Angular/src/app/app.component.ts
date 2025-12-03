import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  protected readonly app = inject(AppStateService);
  protected readonly theme = inject(ThemeService);
  protected readonly translate = inject(LangService);

  public title = 'STT';

  ngOnInit(): void {
    this.setBrowserFlag();
  }

  private setBrowserFlag(): void {
    const ua = navigator.userAgent;

    let browser = 'unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('WebKitGTK')) browser = 'WebKitGTK';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('AppleWebKit')) browser = 'AppleWebKit';
    else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'IE';
    else if (ua.includes('Opera Mini')) browser = 'Opera Mini';
    else if (ua.includes('UCBrowser')) browser = 'UC Browser';
    else if (ua.includes('QQBrowser')) browser = 'QQBrowser';
    else if (ua.includes('KaiOS')) browser = 'KaiOS';

    document.documentElement.dataset.browser = browser;
  }

}
