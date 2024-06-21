import { Injectable } from '@angular/core';
import { offset } from '@floating-ui/dom';
import { TranslateService } from '@ngx-translate/core';
import { ShepherdService } from 'angular-shepherd';
import { firstValueFrom } from 'rxjs';
import { StepOptions } from 'shepherd.js/dist/cjs/step';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  constructor(
    private translate: TranslateService,
    private shepherdService: ShepherdService
  ) { }

  private async init() {
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

    let nextTranslateText = this.translate.instant('tour-next');

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
        canClickTarget: true,
        attachTo: {
          element: '.split-button',
          on: 'right'
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
        id: 'sidebar-actions',
        title: this.translate.instant('tour-sidebar-actions-title'),
        text: this.translate.instant('tour-sidebar-actions'),
        canClickTarget: false,
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
        attachTo: {
          element: '#localizationButton',
          on: 'right-start'
        },
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        advanceOn: {
          selector: '#localizationButton',
          event: 'click'
        }
      },
      {
        id: 'viewer-container-active-loaded',
        title: this.translate.instant('tour-viewer-active-loaded-title'),
        text: this.translate.instant('tour-viewer-active-loaded'),
        canClickTarget: false,
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
        id: 'viewer-container',
        title: this.translate.instant('tour-viewer-container-select-title'),
        text: this.translate.instant('tour-viewer-container-select'),
        canClickTarget: true,
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
        id: 'settings-button',
        title: this.translate.instant('tour-settings-button-title'),
        text: this.translate.instant('tour-settings-button'),
        canClickTarget: true,
        classes: 'stt-custom-shapherd-header-arrow',
        modalOverlayOpeningRadius: 8,
        attachTo: {
          element: '#settingsButton',
          on: 'left-start'
        },
        advanceOn: {
          selector: '#settingsButton',
          event: 'click'
        }
      },
      {
        id: 'beginning-2',
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
        id: 'settings-side-bar',
        title: this.translate.instant('tour-settings-button-title'),
        text: this.translate.instant('tour-settings-button'),
        classes: 'stt-custom-shapherd-header',
        attachTo: {
          element: '#appLanguageSetting',
          on: 'left-start'
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
    ];

    this.shepherdService.defaultStepOptions = defaultStepOptions as any;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.addSteps(defaultSteps as any);
  }

  public start() {
    this.init();
    this.shepherdService.start();
  }

}
