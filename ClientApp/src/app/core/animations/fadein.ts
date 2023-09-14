import { style, animate, trigger, transition } from '@angular/animations';

export const fadeinAnimation = trigger(
    'fadeIn', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
    ]),
    transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 }))
    ])]
);


