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
    private vS: ViewersService,
    private indexedDB: IndexDBService,
    private langService: LanguageOriginService,
    private lStorage: LocalStorageService,
    private tour: TourService,
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
    await this.langService.onRetriveLanguages();
    this.lStorage.setAppWizardDone();
    await this.vS.initViewer();
    this.initialized$.next(true);
    this.tour.start();
  }
}

