import { style, animate, trigger, transition } from '@angular/animations';

export const popinAnimation = trigger(
    'popIn', [
    transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('200ms', style({ transform: 'scale(1)', opacity: 1 }))
    ]),
    transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('10ms', style({ transform: 'translateY(100%)', opacity: 0 }))
    ])]
);


