import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function UserLangTour(translate: TranslateService, breakpointService$: TuiBreakpointService): Promise<{
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
            title: translate.instant('tour-user-lang-01-title'),
            text: translate.instant('tour-user-lang-01'),
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
            title: translate.instant('tour-user-lang-02-title'),
            text: translate.instant('tour-user-lang-02'),
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
            title: translate.instant('tour-user-lang-03-title'),
            text: translate.instant('tour-user-lang-03'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('#userLangButton')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '#userLangButton',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '#userLangButton',
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
            title: translate.instant('tour-user-lang-04-title'),
            text: translate.instant('tour-user-lang-04'),
            buttons: [
                {
                    action() {
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-user-lang-05-title'),
            text: translate.instant('tour-user-lang-05'),
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
            title: translate.instant('tour-user-lang-06-title'),
            text: translate.instant('tour-user-lang-06'),
            canClickTarget: true,
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('#langSwitcherButton')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '#langSwitcherButton',
                on: 'bottom'
            },
            advanceOn: {
                selector: '#langSwitcherButton',
                event: 'click'
            }
        },
        {
            title: translate.instant('tour-user-lang-07-title'),
            text: translate.instant('tour-user-lang-07'),
            canClickTarget: true,
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('#userLangOption')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '#userLangOption',
                on: 'bottom'
            },
            advanceOn: {
                selector: '#userLangOption',
                event: 'click'
            },
            when: {
                hide: () => {
                    let settingButton = document.getElementById('settingCloseButton');
                    settingButton?.click();
                }
            }
        },
        {
            title: translate.instant('tour-user-lang-08-title'),
            text: translate.instant('tour-user-lang-08'),
            canClickTarget: true,
            classes: 'stt-custom-shapherd-header-arrow',
            attachTo: {
                element: '.key-container .lang-item:last-child',
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
            title: translate.instant('tour-user-lang-09-title'),
            text: translate.instant('tour-user-lang-09'),
            canClickTarget: true,
            modalOverlayOpeningRadius: 8,
            classes: 'stt-custom-shapherd-header-arrow',
            attachTo: {
                element: '#saveChangesUserLangButton',
                on: 'bottom'
            },
            advanceOn: {
                selector: '#saveChangesUserLangButton',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-user-lang-10-title'),
            text: translate.instant('tour-user-lang-10'),
            canClickTarget: false,
            modalOverlayOpeningRadius: 8,
            classes: 'stt-custom-shapherd-header-arrow',
            attachTo: {
                element: '#geminiUserLangButton',
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
            title: translate.instant('tour-user-lang-11-title'),
            text: translate.instant('tour-user-lang-11'),
            canClickTarget: true,
            modalOverlayOpeningRadius: 4,
            classes: 'stt-custom-shapherd-header-arrow',
            attachTo: {
                element: '#rtlButton',
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
            title: translate.instant('tour-user-lang-12-title'),
            text: translate.instant('tour-user-lang-12'),
            canClickTarget: true,
            modalOverlayOpeningRadius: 8,
            classes: 'stt-custom-shapherd-header-arrow',
            attachTo: {
                element: '#userLangFilter',
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
            title: translate.instant('tour-finish-title'),
            text: translate.instant('tour-finish'),
            canClickTarget: false,
            buttons: [
                {
                    action() {
                        return this.next();
                    },
                    text: endTranslateText
                }
            ]
        },
    ];

    return { defaultStepOptions, defaultSteps };
}