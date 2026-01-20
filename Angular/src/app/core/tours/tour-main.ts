import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function MainTour(translate: TranslateService, breakpointService$: TuiBreakpointService): Promise<{
    defaultStepOptions: StepOptions;
    defaultSteps: StepOptions[];
}> {
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

    let nextTranslateText = translate.instant('tour-next');
    let endTranslateText = translate.instant('tour-end');
    let mobile = await firstValueFrom(breakpointService$)
        .then(r => r === 'mobile');

    let defaultSteps: StepOptions[] = [
        {
            id: 'beginning',
            title: translate.instant('tour-welcome-title'),
            text: translate.instant('tour-welcome'),
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
            title: translate.instant('tour-viewer-main-title'),
            text: translate.instant('tour-viewer-main'),
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
            title: translate.instant('tour-split-button-title'),
            text: translate.instant('tour-split-button'),
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
            title: translate.instant('tour-viewer-active-title'),
            text: translate.instant('tour-viewer-active'),
            canClickTarget: false,
            showOn: () => !mobile,
            attachTo: {
                element: 'app-viewer:nth-of-type(2)',
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
            title: translate.instant('tour-resizer-container-title'),
            text: translate.instant('tour-resizer-container'),
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
            title: translate.instant('tour-main-menu-button-title'),
            text: translate.instant('tour-main-menu-button'),
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
            },

        },
        {
            id: 'sidebar-actions-mobile',
            title: translate.instant('tour-sidebar-actions-title'),
            text: translate.instant('tour-sidebar-actions'),
            modalOverlayOpeningRadius: 8,
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            showOn: () => mobile,
            attachTo: {
                element: '.mobile-menu',
                on: 'bottom'
            },
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('.mobile-menu')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
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
            title: translate.instant('tour-sidebar-actions-title'),
            text: translate.instant('tour-sidebar-actions'),
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
            title: translate.instant('tour-sidebar-localization-title'),
            text: translate.instant('tour-sidebar-localization'),
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
            title: translate.instant('tour-viewer-active-loaded-title'),
            text: translate.instant('tour-viewer-active-loaded'),
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
            title: translate.instant('tour-viewer-container-select-title'),
            text: translate.instant('tour-viewer-container-select'),
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
            title: translate.instant('tour-dialogs-button-title'),
            text: translate.instant('tour-dialogs-button'),
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
            id: 'mode-button',
            title: translate.instant('tour-mode-button-title'),
            text: translate.instant('tour-mode-button'),
            canClickTarget: false,
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            attachTo: {
                element: '#modeButton',
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
            id: 'tour-button',
            title: translate.instant('tour-tour-button-title'),
            text: translate.instant('tour-tour-button'),
            canClickTarget: false,
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            attachTo: {
                element: '#tourButton',
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
            id: 'theme-button',
            title: translate.instant('tour-theme-button-title'),
            text: translate.instant('tour-theme-button'),
            canClickTarget: false,
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
            title: translate.instant('tour-settings-button-title'),
            text: translate.instant('tour-settings-button'),
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
            title: translate.instant('tour-sidebar-title'),
            text: translate.instant('tour-sidebar'),
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
            title: translate.instant('tour-settings-language-title'),
            text: translate.instant('tour-settings-language'),
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
            title: translate.instant('tour-settings-portraits-title'),
            text: translate.instant('tour-settings-portraits'),
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
            title: translate.instant('tour-settings-libretranslate-title'),
            text: translate.instant('tour-settings-libretranslate'),
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
            id: 'settings-sidebar-gemini',
            title: translate.instant('tour-settings-gemini-title'),
            text: translate.instant('tour-settings-gemini'),
            canClickTarget: false,
            attachTo: {
                element: '#appGeminiSetting',
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
            title: translate.instant('tour-settings-apprestart-title'),
            text: translate.instant('tour-settings-apprestart'),
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
            title: translate.instant('tour-finish-title'),
            text: translate.instant('tour-finish'),
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