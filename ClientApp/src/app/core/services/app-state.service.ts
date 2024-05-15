import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ViewersService } from './viewers.service';
import { LocalStorageService } from './local-storage.service';
import { AppViews, viewers } from '../viewers';
import { AppModes } from '../enums/app-modes';
import { IndexDBService } from './index-db.service';
import { LanguageOriginService } from './language-origin.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  public initialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private vS: ViewersService,
    private indexedDB: IndexDBService,
    private langService: LanguageOriginService,
    private lStorage: LocalStorageService
  ) { }

  public async init() {
    if (this.lStorage.getAppMode() === AppModes.Offline) {
      await firstValueFrom(this.indexedDB.dbLoaded$);
    }

    await this.langService.onRetriveLanguages();

    if (this.lStorage.getAppWizardDone() === 1)
      this.initializeApp();
    else
      this.vS.loadComponent(AppViews.wizard, viewers.wizard, {});
  }

  public async initializeApp() {
    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.next(true);
  }
}
