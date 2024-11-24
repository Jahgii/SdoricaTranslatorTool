import { Injectable, Signal, WritableSignal, computed, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ViewersService } from './viewers.service';
import { LocalStorageService } from './local-storage.service';
import { AppViews, viewers } from '../viewers';
import { IndexDBService } from './index-db.service';
import { LanguageOriginService } from './language-origin.service';
import { TourService } from './tour.service';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {

  public initialized$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isOnTour$: Signal<boolean> = computed(() => this.tour.isOnTour$());

  constructor(
    private readonly vS: ViewersService,
    private readonly indexedDB: IndexDBService,
    private readonly langService: LanguageOriginService,
    private readonly lStorage: LocalStorageService,
    public tour: TourService,
  ) { }

  public async init() {
    this.vS.loadComponent(AppViews.loading, viewers.loading, {});

    await firstValueFrom(this.indexedDB.dbLoaded$);

    if (this.lStorage.getAppWizardDone() === 1)
      await this.initializeApp();
    else
      this.vS.loadComponent(AppViews.wizard, viewers.wizard, {});
  }

  public async initializeApp() {
    let languagesRetrive = await this.langService.onRetriveLanguages();

    if (!languagesRetrive) {
      this.vS.loadComponent(AppViews.login, viewers.login, {});
      return;
    }

    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.next(true);
    this.initializeTour();
  }

  private initializeTour() {
    if (!this.lStorage.getAppMainTourDone())
      this.tour.start();
  }
}

