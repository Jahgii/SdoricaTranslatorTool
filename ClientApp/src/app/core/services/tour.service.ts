import { Inject, Injectable, WritableSignal, inject, signal } from '@angular/core';
import { offset } from '@floating-ui/dom';
import { TranslateService } from '@ngx-translate/core';
import { TuiBreakpointService } from '@taiga-ui/core';
import { firstValueFrom, pairwise, takeWhile } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ViewersService } from './viewers.service';
import Shepherd, { StepOptions, Tour } from 'shepherd.js';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  protected translate = inject(TranslateService);
  public isOnTour$: WritableSignal<boolean> = signal(false);
  protected tour?: Tour;

  constructor(
    private readonly viewers: ViewersService,
    private readonly lStorage: LocalStorageService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) { }

  private async init() {
    let tour = await this.createMainAppSteps();
    this.createTour(tour);
    this.viewers.restartView();
  }

  public async start() {
    await this.init();
    this.isOnTour$.update(_ => true);
    this.tour?.start();

    this.onBreakpointChange();
  }

  private onBreakpointChange() {
    this.breakpointService$
      .pipe(
        takeWhile(() => this.isOnTour$()),
        pairwise()
      )
      .subscribe(([previousBK, currentBK]) => {
        if (
          (previousBK === 'desktopLarge' && currentBK === 'desktopSmall') ||
          (previousBK === 'desktopSmall' && currentBK === 'desktopLarge')) return;

        this.restartTour();
      });
  }

  private onTourFinish() {
    this.lStorage.setAppMainTourDone();
    this.isOnTour$.update(_ => false);
  }

  private createTour(tour: { defaultStepOptions: StepOptions, defaultSteps: StepOptions[] }) {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      confirmCancel: false,
      keyboardNavigation: false,
      modalContainer: (document.querySelector("tui-root") as HTMLElement),
      defaultStepOptions: tour.defaultStepOptions,
      steps: tour.defaultSteps,
    });

    this.tour.on('complete', this.onTourFinish.bind(this));
    this.tour.on('cancel', this.onTourFinish.bind(this));
    this.tour.on('show', () => {
      setTimeout(() => {
        const dialogs = document.querySelectorAll('.stt-custom-shapherd');
        const dialog = dialogs[dialogs.length - 1];
        const targetContainer = document.querySelector('tui-root');
        if (dialog && targetContainer) {
          targetContainer.appendChild(dialog);
        }
      }, 1);
    });
  }

  private async restartTour() {
    this.tour?.cancel();

    await this.init();
    this.isOnTour$.update(_ => true);
    this.tour?.start();
  }

  private async createMainAppSteps() {
    let defaultStepOptions: StepOptions = {
      cancelIcon: {
        enabled: true
      },
      classes: 'stt-custom-shapherd',
      scrollTo: {
        behavior: 'smooth',
        block: 'center'
      },
      floatingUIOptions: {
        middleware: [offset({ mainAxis: 16 })]
      },
    };

    (defaultStepOptions as any)['renderInElement'] = (document.querySelector("#mainGrid") as HTMLElement);

    let nextTranslateText = this.translate.instant('tour-next');
    let endTranslateText = this.translate.instant('tour-end');
    let mobile = await firstValueFrom(this.breakpointService$)
      .then(r => r === 'mobile');

    let defaultSteps: StepOptions[] = [
      {
        id: 'beginning',
        title: this.translate.instant('tour-welcome-title'),
        text: this.translate.instant('tour-welcome'),
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'viewer-main',
        title: this.translate.instant('tour-viewer-main-title'),
        text: this.translate.instant('tour-viewer-main'),
        canClickTarget: false,
        attachTo: {
          element: '.main-viewer'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'split-button',
        title: this.translate.instant('tour-split-button-title'),
        text: this.translate.instant('tour-split-button'),
        modalOverlayOpeningRadius: 8,
        classes: 'stt-custom-shapherd-header-arrow',
        canClickTarget: true,
        showOn: () => !mobile,
        attachTo: {
          element: '.split-button',
          on: 'bottom'
        },
        advanceOn: {
          selector: '.split-button',
          event: 'click',
        }
      },
      {
        id: 'viewer-container-active',
        title: this.translate.instant('tour-viewer-active-title'),
        text: this.translate.instant('tour-viewer-active'),
        canClickTarget: false,
        showOn: () => !mobile,
        attachTo: {
          element: '.active',
          on: 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'resizer-container',
        title: this.translate.instant('tour-resizer-container-title'),
        text: this.translate.instant('tour-resizer-container'),
        canClickTarget: false,
        showOn: () => !mobile,
        attachTo: {
          element: '.resizer-container',
          on: 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'main-menu-button',
        title: this.translate.instant('tour-main-menu-button-title'),
        text: this.translate.instant('tour-main-menu-button'),
        modalOverlayOpeningRadius: 8,
        classes: 'stt-custom-shapherd-header-arrow',
        canClickTarget: true,
        showOn: () => mobile,
        attachTo: {
          element: '#mainMenuButton',
          on: 'bottom'
        },
        advanceOn: {
          selector: '#mainMenuButton',
          event: 'click'
        }
      },
      {
        id: 'sidebar-actions-mobile',
        title: this.translate.instant('tour-sidebar-actions-title'),
        text: this.translate.instant('tour-sidebar-actions'),
        modalOverlayOpeningRadius: 8,
        classes: 'stt-custom-shapherd-header-arrow',
        canClickTarget: false,
        showOn: () => mobile,
        attachTo: {
          element: '.mobile-menu',
          on: 'bottom'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'sidebar-actions',
        title: this.translate.instant('tour-sidebar-actions-title'),
        text: this.translate.instant('tour-sidebar-actions'),
        canClickTarget: false,
        showOn: () => !mobile,
        attachTo: {
          element: '.sidebar-actions',
          on: 'right'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'sidebar-buttons-localization',
        title: this.translate.instant('tour-sidebar-localization-title'),
        text: this.translate.instant('tour-sidebar-localization'),
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        attachTo: {
          element: '#localizationButton',
          on: mobile ? 'bottom' : 'right-start'
        },
        advanceOn: {
          selector: '#localizationButton',
          event: 'click'
        },
        when: mobile ? {
          hide: () => {
            let menuButton = document.getElementById('mainMenuButton');
            menuButton?.click();
            menuButton?.click();
          }
        } : undefined
      },
      {
        id: 'viewer-container-active-loaded',
        title: this.translate.instant('tour-viewer-active-loaded-title'),
        text: this.translate.instant('tour-viewer-active-loaded'),
        canClickTarget: false,
        attachTo: {
          element: '.active',
          on: mobile ? undefined : 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'viewer-container',
        title: this.translate.instant('tour-viewer-container-select-title'),
        text: this.translate.instant('tour-viewer-container-select'),
        classes: 'stt-custom-shapherd-header-arrow',
        canClickTarget: true,
        showOn: () => !mobile,
        attachTo: {
          element: '.viewer-container',
          on: 'right'
        },
        advanceOn: {
          selector: '.viewer-container',
          event: 'click'
        }
      },
      {
        id: 'dialogs-button',
        title: this.translate.instant('tour-dialogs-button-title'),
        text: this.translate.instant('tour-dialogs-button'),
        canClickTarget: true,
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        showOn: () => !mobile,
        attachTo: {
          element: '#dialogsButton',
          on: 'right-start'
        },
        advanceOn: {
          selector: '#dialogsButton',
          event: 'click'
        }
      },
      {
        id: 'theme-button',
        title: this.translate.instant('tour-theme-button-title'),
        text: this.translate.instant('tour-theme-button'),
        canClickTarget: true,
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        attachTo: {
          element: '#themeButton',
          on: 'bottom'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'settings-button',
        title: this.translate.instant('tour-settings-button-title'),
        text: this.translate.instant('tour-settings-button'),
        canClickTarget: true,
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        attachTo: {
          element: '#settingsButton',
          on: 'bottom'
        },
        advanceOn: {
          selector: '#settingsButton',
          event: 'click'
        }
      },
      {
        id: 'sidebar',
        title: this.translate.instant('tour-sidebar-title'),
        text: this.translate.instant('tour-sidebar'),
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'settings-sidebar-language',
        title: this.translate.instant('tour-settings-language-title'),
        text: this.translate.instant('tour-settings-language'),
        canClickTarget: false,
        attachTo: {
          element: '#appLanguageSetting',
          on: mobile ? 'bottom' : 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'settings-sidebar-portraits',
        title: this.translate.instant('tour-settings-portraits-title'),
        text: this.translate.instant('tour-settings-portraits'),
        canClickTarget: false,
        attachTo: {
          element: '#appPortraitSetting',
          on: mobile ? 'top' : 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'settings-sidebar-libretranslate',
        title: this.translate.instant('tour-settings-libretranslate-title'),
        text: this.translate.instant('tour-settings-libretranslate'),
        canClickTarget: false,
        attachTo: {
          element: '#appLibreTranslateSetting',
          on: mobile ? 'top' : 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'settings-sidebar-apprestart',
        title: this.translate.instant('tour-settings-apprestart-title'),
        text: this.translate.instant('tour-settings-apprestart'),
        canClickTarget: false,
        attachTo: {
          element: '#appResetAllSetting',
          on: mobile ? 'top' : 'left'
        },
        buttons: [
          {
            action() {
              return this.next();
            },
            text: nextTranslateText
          }
        ]
      },
      {
        id: 'end',
        title: this.translate.instant('tour-finish-title'),
        text: this.translate.instant('tour-finish'),
        canClickTarget: false,
        buttons: [
          {
            action() {
              let button = document.getElementById('settingsButton');
              button?.click();
              return this.next();
            },
            text: endTranslateText
          }
        ]
      },
    ];

    return { defaultStepOptions, defaultSteps };
  }

}
