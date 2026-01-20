import { Inject, Injectable, WritableSignal, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TuiBreakpointService } from '@taiga-ui/core';
import { pairwise, takeWhile } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ViewersService } from './viewers.service';
import { AppStateService } from './app-state.service';
import Shepherd, { StepOptions, Tour } from 'shepherd.js';
import { MainTour } from '../tours/tour-main';
import { LocalizationTour } from '../tours/tour-localization';
import { Tours } from '../enums/tours';
import { ImportTranslationTour } from '../tours/tour-import-translation';
import { ExportTranslationTour } from '../tours/tour-export-translation';
import { DialogTour } from '../tours/tour-dialog';

@Injectable()
export class TourService {
  protected translate = inject(TranslateService);
  public isOnTour$: WritableSignal<boolean> = signal(false);
  protected tour?: Tour;
  protected _tour?: Tours;

  constructor(
    private readonly viewers: ViewersService,
    private readonly lStorage: LocalStorageService,
    private readonly appState: AppStateService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
  ) { }

  private async init() {
    let tour = await this.getTour();
    this.createTour(tour);
    this.viewers.restartView();
    this.lStorage.resetCategories();
    this.lStorage.resetGroups();
    this.appState.isOnTour$ = this.isOnTour$;
  }

  private async getTour() {
    switch (this._tour) {
      case Tours.Main:
        return await MainTour(this.translate, this.breakpointService$);
      case Tours.Localization:
        return await LocalizationTour(this.translate, this.breakpointService$);
      case Tours.Dialog:
        return await DialogTour(this.translate, this.breakpointService$);
      case Tours.ImportTranslation:
        return await ImportTranslationTour(this.translate, this.breakpointService$);
      case Tours.ExportTranslation:
        return await ExportTranslationTour(this.translate, this.breakpointService$);
      default:
        return await MainTour(this.translate, this.breakpointService$);
    }
  }

  public async start(_tour: Tours) {
    this._tour = _tour;
    await this.init();
    this.isOnTour$.update(_ => true);
    this.disableScrollWheel();
    this.tour?.start();

    this.onBreakpointChange();
  }

  private onBreakpointChange() {
    this.breakpointService$
      .pipe(
        takeWhile(() => this.isOnTour$()),
        pairwise()
      )
      .subscribe(([previousBK, currentBK]) => {
        if (
          (previousBK === 'desktopLarge' && currentBK === 'desktopSmall') ||
          (previousBK === 'desktopSmall' && currentBK === 'desktopLarge')) return;

        this.restartTour();
      });
  }

  private onTourFinish() {
    document.body.removeAttribute('tuiTheme');
    document.body.classList.remove('stt-custom-shapherd-rtl');
    this.lStorage.setAppMainTourDone();
    this.isOnTour$.update(_ => false);
    this.enableScrollWheel();
  }

  private createTour(tour: { defaultStepOptions: StepOptions, defaultSteps: StepOptions[] }) {
    const tuiRoot = document.querySelector('tui-root');
    if (!tuiRoot) return;

    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      confirmCancel: false,
      keyboardNavigation: false,
      modalContainer: tuiRoot as HTMLElement,
      defaultStepOptions: tour.defaultStepOptions,
      steps: tour.defaultSteps,
    });

    const theme = tuiRoot?.getAttribute('tuiTheme');
    const direction = tuiRoot?.getAttribute('dir');
    if (theme) document.body.setAttribute('tuiTheme', theme);
    if (direction) document.body.classList.add('stt-custom-shapherd-rtl');

    this.tour.on('complete', this.onTourFinish.bind(this));
    this.tour.on('cancel', this.onTourFinish.bind(this));
  }

  private async restartTour() {
    this.tour?.cancel();

    await this.init();
    this.isOnTour$.update(_ => true);
    this.tour?.start();
  }

  private preventScroll(e: Event) {
    e.preventDefault();
  }

  private disableScrollWheel() {
    globalThis.addEventListener('wheel', this.preventScroll, { passive: false });
    globalThis.addEventListener('mousewheel', this.preventScroll, { passive: false });
    globalThis.addEventListener('DOMMouseScroll', this.preventScroll, { passive: false });
  }

  private enableScrollWheel() {
    globalThis.removeEventListener('wheel', this.preventScroll);
    globalThis.removeEventListener('mousewheel', this.preventScroll);
    globalThis.removeEventListener('DOMMouseScroll', this.preventScroll);
  }


}
