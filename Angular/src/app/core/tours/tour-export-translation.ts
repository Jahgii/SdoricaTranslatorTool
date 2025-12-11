import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function ExportTranslationTour(
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
            title: translate.instant('tour-export-translation-01-title'),
            text: translate.instant('tour-export-translation-01'),
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
            title: translate.instant('tour-export-translation-02-title'),
            text: translate.instant('tour-export-translation-02'),
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
            title: translate.instant('tour-export-translation-03-title'),
            text: translate.instant('tour-export-translation-03'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('#exportButton')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: '#exportButton',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '#exportButton',
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
            title: translate.instant('tour-export-translation-04-title'),
            text: translate.instant('tour-export-translation-04'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('tui-tabs > button:nth-child(2)')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: 'tui-tabs > button:nth-child(2)',
                on: 'bottom'
            },
            advanceOn: {
                selector: 'tui-tabs > button:nth-child(2)',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-export-translation-05-title'),
            text: translate.instant('tour-export-translation-05'),
            modalOverlayOpeningRadius: 8,
            canClickTarget: false,
            beforeShowPromise: () => {
                return new Promise(resolve => {
                    const checkExist = setInterval(() => {
                        if (document.querySelector('main > div > div > button')) {
                            clearInterval(checkExist);
                            resolve(true);
                        }
                    }, 1);
                });
            },
            attachTo: {
                element: 'main > div > div > button',
                on: 'bottom'
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