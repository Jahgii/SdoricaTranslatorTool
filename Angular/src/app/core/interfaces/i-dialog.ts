import { BehaviorSubject } from "rxjs";

export interface DialogState {
    isDragging: boolean;
    isHidden: boolean;
    xDiff: number;
    yDiff: number;
    x: number;
    y: number;
    yTopMargin: number;
    yBottomMargin: number;
    zIndex$: BehaviorSubject<number>;
}