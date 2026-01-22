import { Injectable, signal } from '@angular/core';
import { shareReplay, takeWhile } from 'rxjs';
import { ViewersService } from './viewers.service';
import { LocalStorageService } from './local-storage.service';
import { AppViews, viewers } from '../viewers';
import { IndexDBService } from './index-db.service';
import { LanguageOriginService } from './language-origin.service';
import { AppModes } from '../enums/app-modes';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  public initialized$ = signal(false);
  public isOnTour$ = signal(false);
  public isRTL = signal(false);

  constructor(
    private readonly vS: ViewersService,
    private readonly indexedDB: IndexDBService,
    private readonly langService: LanguageOriginService,
    private readonly lStorage: LocalStorageService,
  ) { }

  public async init() {
    this.vS.loadComponent(AppViews.loading, await viewers.loading(), {});

    this.indexedDB.dbLoaded$.pipe(
      shareReplay(),
      takeWhile(e => !e, true)
    ).subscribe(async _ => {
      if (!_) return;
      if (this.lStorage.getAppWizardDone() === 1) this.initializeApp();
      else this.vS.loadComponent(AppViews.wizard, await viewers.wizard(), {});
    });
  }

  public async initializeApp() {
    let languagesRetrive = await this.langService.onRetriveLanguages();
    let direction = this.lStorage.getAppDirection();

    if (!languagesRetrive && this.lStorage.getAppMode() === AppModes.Online) {
        this.vS.loadComponent(AppViews.login, await viewers.login(), {});
        return;
    }

    if (!languagesRetrive && this.lStorage.getAppMode() === AppModes.Offline) {
      this.vS.loadComponent(AppViews.wizard, await viewers.wizard(), {});
      return;
    }

    if (direction) this.isRTL.set(true);

    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.set(true);
  }

  public async InitializeAppAfterLogin() {
    let languagesRetrive = await this.langService.onRetriveLanguages();
    let direction = this.lStorage.getAppDirection();
    if (languagesRetrive === false) return;
    if (direction) this.isRTL.set(true);

    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.set(true);
  }

}

