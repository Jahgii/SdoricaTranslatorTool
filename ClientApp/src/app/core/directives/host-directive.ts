import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[adHost]',
})
export class AdHostDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}