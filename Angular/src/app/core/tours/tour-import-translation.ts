import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function ImportTranslationTour(
    translate: TranslateService,
    breakpointService$: TuiBreakpointService,
): Promise<{
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
            block: 'center',
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
            title: translate.instant('tour-import-translation-01-title'),
            text: translate.instant('tour-import-translation-01'),
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
            title: translate.instant('tour-import-translation-02-title'),
            text: translate.instant('tour-import-translation-02'),
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
            title: translate.instant('tour-import-translation-03-title'),
            text: translate.instant('tour-import-translation-03'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: mobile ? () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('.mobile-menu')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            } : undefined,
            attachTo: {
                element: '#importButton',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '#importButton',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-import-translation-04-title'),
            text: translate.instant('tour-import-translation-04'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('#importTranslationFile')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '#importTranslationFile',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '#importTranslationFile',
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
            title: translate.instant('tour-import-translation-05-title'),
            text: translate.instant('tour-import-translation-05'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('.file-input-empty')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '.file-input-empty',
                on: 'bottom'
            },
            buttons: [
                {
                    action() {
                        let button = (document.querySelector('#importFileButton')) as HTMLInputElement;
                        if (button) {
                            return this.next();
                        }
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-import-translation-06-title'),
            text: translate.instant('tour-import-translation-06'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: false,
            attachTo: {
                element: 'tui-tabs',
                on: 'top'
            },
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
            title: translate.instant('tour-import-translation-07-title'),
            text: translate.instant('tour-import-translation-07'),
            extraHighlights: ['main > tui-scrollbar:nth-child(6)'],
            attachTo: {
                element: 'main > section:nth-child(5)',
                on: 'top'
            },
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
            title: translate.instant('tour-import-translation-08-title'),
            text: translate.instant('tour-import-translation-08'),
            extraHighlights: ['main > tui-scrollbar:nth-child(8)'],
            attachTo: {
                element: 'main > section:nth-child(7)',
                on: 'top'
            },
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
            title: translate.instant('tour-import-translation-09-title'),
            text: translate.instant('tour-import-translation-09'),
            modalOverlayOpeningRadius: 8,
            classes: mobile ? 'stt-custom-shapherd-header-arrow' : undefined,
            canClickTarget: false,
            attachTo: {
                element: '#importFileButton',
                on: 'top'
            },
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