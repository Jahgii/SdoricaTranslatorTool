import { ComponentRef, Inject, Injectable, signal, Type } from '@angular/core';
import { ViewerComponent } from 'src/app/mainlayout/viewer/viewer.component';
import { AdHostDirective } from '../directives/host-directive';
import { ViewerResizerComponent } from 'src/app/mainlayout/viewer-resizer/viewer-resizer.component';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { TuiBreakpointService } from '@taiga-ui/core';
import { AppViews, viewers } from 'src/app/core/viewers';
import { LocalStorageService } from './local-storage.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ViewersService {
  public views: ComponentRef<ViewerComponent>[] = [];
  public activeView!: ComponentRef<ViewerComponent>;
  private adHost!: AdHostDirective;
  public notifier = signal(true);
  public componentOpens: { [componentName: string]: BehaviorSubject<number> } = {};

  constructor(
    private readonly lStorage: LocalStorageService,
    private readonly auth: AuthService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

  public init(adHost: AdHostDirective) {
    this.adHost = adHost;
    this.AddViewer();

    this.breakpointService$.subscribe(v => {
      if (v === 'mobile' && this.views.length === 2)
        this.splitMode();
    });
  }

  public async initViewer() {
    this.activeView?.instance?.onClearComponent();

    let c1 = this.lStorage.getC1();
    let c2 = this.lStorage.getC2();

    if (c1 === AppViews.wizard) c1 = undefined;
    if (c2 === AppViews.wizard) c2 = undefined;

    if (c1) this.loadComponent(c1 as AppViews, await viewers[c1], {});
    if (c2 && await firstValueFrom(this.breakpointService$) !== 'mobile') {
      this.splitMode();
      this.loadComponent(c2 as AppViews, await viewers[c2], {});
    }

    let element = document.querySelector(':root') as HTMLElement;
    element.style.setProperty('--header-height', '2.9375rem');
    element.style.setProperty('--menu-width', '3rem');
  }

  private AddViewer() {
    let resizer;
    if (this.views.length >= 1) {
      resizer = this.adHost
        .viewContainerRef
        .createComponent<ViewerResizerComponent>(ViewerResizerComponent);

      resizer.instance.views = [this.views.at(-1)!.instance];
    }

    let view = this.adHost
      .viewContainerRef
      .createComponent<ViewerComponent>(ViewerComponent);

    this.views.push(view);
    this.onChangeActiveView(view);

    this.activeView = view;
    this.activeView.instance.active.set(true);
    this.activeView.instance.viewIndex = this.views.length - 1;
    this.activeView.instance.setActiveViewer = () => this.onChangeActiveView(view);

    if (resizer) resizer.instance.views.push(view.instance);
  }

  private resizeViewers() {
    let width: number = 100 / this.views.length;

    for (const v of this.views) v.instance.widthPercentage = `${width}%`
  }

  public splitMode() {
    if (this.views.length == 1) {
      this.AddViewer();
      this.resizeViewers();
    }
    else {
      this.adHost.viewContainerRef.remove(1);
      this.adHost.viewContainerRef.remove(1);
      let view = this.views.pop();
      if (view?.instance.componentLoaded && view.instance.componentLoadedName)
        this.componentOpens[view.instance.componentLoadedName].next(this.componentOpens[view.instance.componentLoadedName].value - 1);

      this.lStorage.setC2('');

      this.resizeViewers();
      this.onChangeActiveView(this.views[0]);
    }

    this.notifier.set(!this.notifier());
  }

  public async loadComponent(viewerKey: AppViews, component: Type<any>, args: { [arg: string]: any }) {
    if (this.activeView.instance.componentLoadedName === viewerKey) return;

    this.removeActiveViewComponentOpen();
    this.addComponentOpen(viewerKey);

    this.activeView.instance.loadComponent(component, args);
    this.activeView.instance.componentLoadedName = viewerKey;

    for (const k of Object.keys(viewers)) {
      if (k === AppViews.login || k === AppViews.loading) continue;
      if (await viewers[k] === component) {
        if (this.activeView == this.views[0])
          this.lStorage.setC1(k);
        else if (this.views[1] && this.activeView == this.views[1])
          this.lStorage.setC2(k);
      }
    }
  }

  private removeActiveViewComponentOpen() {
    if (this.activeView.instance.componentLoaded && this.activeView.instance.componentLoadedName)
      this.componentOpens[this.activeView.instance.componentLoadedName].next(this.componentOpens[this.activeView.instance.componentLoadedName].value - 1);
  }

  private addComponentOpen(viewerKey: AppViews) {
    if (!this.componentOpens[viewerKey])
      this.componentOpens[viewerKey] = new BehaviorSubject(1);
    else
      this.componentOpens[viewerKey].next(this.componentOpens[viewerKey].value + 1);
  }

  public clearActiveComponent() {
    this.removeActiveViewComponentOpen();
    this.activeView.instance.onClearComponent();
  }

  public restartView() {
    if (this.views.length > 1) this.splitMode();
    this.clearActiveComponent();
  }

  private onChangeActiveView(view: ComponentRef<ViewerComponent>) {
    for (const v of this.views) v.instance.active.set(false);
    view.instance.active.set(true);
    this.activeView = view;
  }
}
