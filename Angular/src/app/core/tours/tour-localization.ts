import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function LocalizationTour(
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
            title: translate.instant('tour-localization-01-title'),
            text: translate.instant('tour-localization-01'),
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
            title: translate.instant('tour-localization-02-title'),
            text: translate.instant('tour-localization-02'),
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
            title: translate.instant('tour-localization-03-title'),
            text: translate.instant('tour-localization-03'),
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
            title: translate.instant('tour-localization-04-title'),
            text: translate.instant('tour-localization-04'),
            canClickTarget: false,
            attachTo: {
                element: '.active',
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
            title: translate.instant('tour-localization-05-title'),
            text: translate.instant('tour-localization-05'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: false,
            attachTo: {
                element: '#categoriesInput',
                on: mobile ? 'bottom' : 'right-start'
            },
            buttons: [
                {
                    action() {
                        let button = (document.querySelector('#categoriesInputButton')) as HTMLElement;
                        button.click();
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-localization-06-title'),
            text: translate.instant('tour-localization-06'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: '[tuioption]:nth-of-type(2)',
                on: mobile ? 'bottom' : 'right-start'
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
            title: translate.instant('tour-localization-07-title'),
            text: translate.instant('tour-localization-07'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            attachTo: {
                element: '[tuioption]:nth-of-type(1)',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '[tuioption]:nth-of-type(1)',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-localization-08-title'),
            text: translate.instant('tour-localization-08'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: '#category-search',
                on: mobile ? 'bottom' : 'left-start'
            },
            buttons: [
                {
                    action() {
                        let button = (document.querySelector('#searchInputButton')) as HTMLElement;
                        button.click();
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-localization-09-title'),
            text: translate.instant('tour-localization-09'),
            modalOverlayOpeningRadius: 8,
            classes: mobile ? 'stt-custom-shapherd-header-arrow' : undefined,
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: '.filter-container',
                on: mobile ? 'bottom' : 'left-start'
            },
            buttons: [
                {
                    action() {
                        let button = (document.querySelector('#searchInputButton')) as HTMLElement;
                        button.click();
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-localization-10-title'),
            text: translate.instant('tour-localization-10'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            attachTo: {
                element: '#searchByKey',
                on: mobile ? 'bottom' : 'left-start'
            },
            buttons: [
                {
                    action() {
                        let key = (document.querySelector('#searchByKey')) as HTMLInputElement;
                        let table = (document.querySelector('table')) as HTMLElement;
                        let button = (document.querySelector('#searchInputHideButton')) as HTMLElement;
                        if (key.value === "b0001" && table) {
                            button.click();
                            return this.next();
                        }
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-localization-11-title'),
            text: translate.instant('tour-localization-11'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: 'table'
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
            title: translate.instant('tour-localization-12-title'),
            text: translate.instant('tour-localization-12'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: `tr:nth-of-type(${mobile ? '1' : '2'})`,
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
            title: translate.instant('tour-localization-13-title'),
            text: translate.instant('tour-localization-13'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: `tr:nth-of-type(${mobile ? '2' : '3'})`,
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
            title: translate.instant('tour-localization-14-title'),
            text: translate.instant('tour-localization-14'),
            canClickTarget: false,
            attachTo: {
                element: `tr:nth-of-type(${mobile ? '3' : '4'})`,
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
            title: translate.instant('tour-localization-15-title'),
            text: translate.instant('tour-localization-15'),
            canClickTarget: false,
            extraHighlights: ['tui-hint'],
            attachTo: {
                element: mobile ? `tr:nth-of-type(3) > td > div > div.cell-content-original`
                    : `tr:nth-of-type(4) > td.tooltip-name-cell`,
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
            title: translate.instant('tour-localization-16-title'),
            text: translate.instant('tour-localization-16'),
            canClickTarget: false,
            attachTo: {
                element: mobile ? `tr:nth-of-type(3) > td > div > div.cell-content-original > div:nth-child(1) > span`
                    : `tr:nth-of-type(4) > td.tooltip-name-cell > span`,
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
            title: translate.instant('tour-localization-17-title'),
            text: translate.instant('tour-localization-17'),
            canClickTarget: false,
            attachTo: {
                element: mobile ? `tr:nth-of-type(3) > td > div > div:nth-child(2)`
                    : `tr:nth-of-type(4) > td._editable`,
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
            title: translate.instant('tour-localization-18-title'),
            text: translate.instant('tour-localization-18'),
            canClickTarget: false,
            arrow: {
                padding: 10,
            },
            attachTo: {
                element: mobile ? `tr:nth-of-type(3) > td > div > div.cell-content-original > div.translated-checkbox-container > input`
                    : `tr:nth-of-type(4) > td:nth-child(3) > div > input`,
                on: mobile ? 'top-end' : 'left'
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
            title: translate.instant('tour-localization-19-title'),
            text: translate.instant('tour-localization-19'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: '[iconstart="gemini-color"]',
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
            title: translate.instant('tour-localization-20-title'),
            text: translate.instant('tour-localization-20'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: '[iconstart="list-x"]',
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
            title: translate.instant('tour-localization-21-title'),
            text: translate.instant('tour-localization-21'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: '[iconstart="list-checks"]',
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
            title: translate.instant('tour-localization-22-title'),
            text: translate.instant('tour-localization-22'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            attachTo: {
                element: '[iconstart="list-restart"]',
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