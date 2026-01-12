import { offset } from "@floating-ui/dom";
import { TranslateService } from "@ngx-translate/core";
import { TuiBreakpointService } from "@taiga-ui/core";
import { firstValueFrom } from "rxjs";
import { StepOptions } from "shepherd.js";

export async function DialogTour(
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
            title: translate.instant('tour-dialog-01-title'),
            text: translate.instant('tour-dialog-01'),
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
            title: translate.instant('tour-dialog-02-title'),
            text: translate.instant('tour-dialog-02'),
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
            title: translate.instant('tour-dialog-03-title'),
            text: translate.instant('tour-dialog-03'),
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
                element: '#dialogsButton',
                on: mobile ? 'bottom' : 'right-start'
            },
            advanceOn: {
                selector: '#dialogsButton',
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
            title: translate.instant('tour-dialog-04-title'),
            text: translate.instant('tour-dialog-04'),
            canClickTarget: false,
            attachTo: {
                element: '.group-tree',
                on: 'auto'
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
            title: translate.instant('tour-dialog-05-title'),
            text: translate.instant('tour-dialog-05'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            attachTo: {
                element: '.tree-main',
                on: 'auto'
            },
            buttons: [
                {
                    action() {
                        let expanded = document.querySelector('tui-expand.tui-space_left-6._expanded');
                        if (!expanded) return;
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-dialog-06-title'),
            text: translate.instant('tour-dialog-06'),
            classes: 'stt-custom-shapherd-header-arrow',
            modalOverlayOpeningRadius: 8,
            canClickTarget: true,
            attachTo: {
                element: '._expanded > div:nth-child(1) > tui-elastic-container:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)',
                on: 'auto'
            },
            advanceOn: {
                selector: '._expanded > div:nth-child(1) > tui-elastic-container:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-dialog-07-title'),
            text: translate.instant('tour-dialog-07'),
            canClickTarget: false,
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
            title: translate.instant('tour-dialog-08-title'),
            text: translate.instant('tour-dialog-08'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: true,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: 'div.option-child:nth-child(1)',
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
            title: translate.instant('tour-dialog-09-title'),
            text: translate.instant('tour-dialog-09'),
            modalOverlayOpeningRadius: 8,
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: true,
            showOn: () => mobile,
            attachTo: {
                element: '#dialogActionsButton',
                on: 'bottom'
            },
            advanceOn: {
                selector: '#dialogActionsButton',
                event: 'click'
            },
        },
        {
            title: translate.instant('tour-dialog-10-title'),
            text: translate.instant('tour-dialog-10'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: mobile ? '.mobile-dropdown-container' : 'div.option-child:nth-child(2)',
                on: 'bottom'
            },
            buttons: [
                {
                    action() {
                        let button = (document.querySelector("#dialogActionsButton")) as HTMLButtonElement;
                        button?.click();
                        return this.next();
                    },
                    text: nextTranslateText
                }
            ],
        },
        {
            title: translate.instant('tour-dialog-11-title'),
            text: translate.instant('tour-dialog-11'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: 'app-dialog-asset-single > div > div:nth-child(1)',
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
            title: translate.instant('tour-dialog-12-title'),
            text: translate.instant('tour-dialog-12'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: 'app-dialog-asset-single > div > div:nth-child(2)',
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
            title: translate.instant('tour-dialog-13-title'),
            text: translate.instant('tour-dialog-13'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: '.portrait-select',
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
            title: translate.instant('tour-dialog-14-title'),
            text: translate.instant('tour-dialog-14'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: 'app-dialog-asset-single > div > div:nth-child(2) > div.dialog-translation-speaker > input',
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
            title: translate.instant('tour-dialog-15-title'),
            text: translate.instant('tour-dialog-15'),
            classes: 'stt-custom-shapherd-header-arrow',
            canClickTarget: false,
            beforeShowPromise: () => new Promise(resolve => {
                setTimeout(resolve, 1);
            }),
            attachTo: {
                element: 'app-dialog-asset-single > div > div:nth-child(2) > div.dialog-translation-input > textarea',
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