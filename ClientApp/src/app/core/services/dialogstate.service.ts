import { Injectable } from '@angular/core';
import { DialogState } from '../interfaces/i-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogstateService {
  private dialogStates: { [componentName: string]: DialogState } = {}

  public addState(key: string, state: DialogState) {
    this.dialogStates[key] = state;
  }

  public onChangeIndex(state: DialogState) {
    for (const k of Object.keys(this.dialogStates))
      this.dialogStates[k].zIndex$.next(1);

    state.zIndex$.next(2);
  }
}
