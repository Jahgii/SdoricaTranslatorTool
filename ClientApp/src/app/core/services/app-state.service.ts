import { Injectable, computed, signal } from '@angular/core';
import { shareReplay, takeWhile } from 'rxjs';
import { ViewersService } from './viewers.service';
import { LocalStorageService } from './local-storage.service';
import { AppViews, viewers } from '../viewers';
import { IndexDBService } from './index-db.service';
import { LanguageOriginService } from './language-origin.service';
import { TourService } from './tour.service';
import { AppModes } from '../enums/app-modes';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  public initialized$ = signal(false);
  public isOnTour$ = computed(() => this.tour.isOnTour$());

  constructor(
    private readonly vS: ViewersService,
    private readonly indexedDB: IndexDBService,
    private readonly langService: LanguageOriginService,
    private readonly lStorage: LocalStorageService,
    public readonly tour: TourService,
  ) { }

  public async init() {
    this.vS.loadComponent(AppViews.loading, await viewers.loading, {});

    this.indexedDB.dbLoaded$.pipe(
      shareReplay(),
      takeWhile(e => !e, true)
    ).subscribe(async _ => {
      if (!_) return;
      if (this.lStorage.getAppWizardDone() === 1) this.initializeApp();
      else this.vS.loadComponent(AppViews.wizard, await viewers.wizard, {});
    });
  }

  public async initializeApp() {
    let languagesRetrive = await this.langService.onRetriveLanguages();

    if (!languagesRetrive && this.lStorage.getAppMode() === AppModes.Online) {
      this.vS.loadComponent(AppViews.login, await viewers.login, {});
      return;
    }

    if (!languagesRetrive && this.lStorage.getAppMode() === AppModes.Offline) {
      this.vS.loadComponent(AppViews.wizard, await viewers.wizard, {});
      return;
    }

    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.set(true);
    this.initializeTour();
  }

  private initializeTour() {
    if (!this.lStorage.getAppMainTourDone())
      this.tour.start();
  }
}

