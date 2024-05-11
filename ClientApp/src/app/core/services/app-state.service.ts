import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ViewersService } from './viewers.service';
import { LocalStorageService } from './local-storage.service';
import { AppViews, viewers } from '../viewers';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  public initialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private vS: ViewersService,
    private lStorage: LocalStorageService
  ) { }

  public init() {
    if (this.lStorage.getAppWizardDone() === 1)
      this.initializeApp();
    else
      this.vS.loadComponent(AppViews.wizard, viewers.wizard, {});
  }

  public async initializeApp() {
    this.initialized$.next(true);
    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
  }


}
