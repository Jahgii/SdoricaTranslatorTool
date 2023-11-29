import { ComponentRef, Injectable, Type } from '@angular/core';
import { ViewerComponent } from 'src/app/mainlayout/viewer/viewer.component';
import { AdHostDirective } from '../directives/host-directive';
import { ViewerResizerComponent } from 'src/app/mainlayout/viewer-resizer/viewer-resizer.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewersService {
  public views: ComponentRef<ViewerComponent>[] = [];
  public activeView!: ComponentRef<ViewerComponent>;
  private adHost!: AdHostDirective;
  public notifier: BehaviorSubject<boolean> = new BehaviorSubject(true);
  public componentOpens: { [componentName: string]: BehaviorSubject<number> } = {};

  constructor() { }

  public init(adHost: AdHostDirective) {
    this.adHost = adHost;
    this.AddViewer();
  }

  private AddViewer() {
    let resizer;
    if (this.views.length >= 1) {
      resizer = this.adHost
        .viewContainerRef
        .createComponent<ViewerResizerComponent>(ViewerResizerComponent);

      resizer.instance.views = [this.views[this.views.length - 1].instance];
    }

    let view = this.adHost
      .viewContainerRef
      .createComponent<ViewerComponent>(ViewerComponent);

    this.views.push(view);
    this.onChangeActiveView(view);

    this.activeView = view;
    this.activeView.instance.active = true;
    this.activeView.instance.setActiveViewer = () => this.onChangeActiveView(view);

    if (resizer) {
      resizer.instance.views.push(view.instance);
    }
  }

  private resizeViewers() {
    let width: number = 100 / this.views.length;

    this.views.forEach(v => {
      v.instance.widthPercentage = `${width}%`
    });
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
      if (
        view?.instance.componentLoaded &&
        view.instance.componentLoadedName != this.views[0].instance.componentLoadedName
      )
        this.componentOpens[view.instance.componentLoadedName].next(this.componentOpens[view.instance.componentLoadedName].value - 1);

      this.resizeViewers();
      this.onChangeActiveView(this.views[0]);
    }

    this.notifier.next(true);
  }

  public loadComponent(component: Type<any>, args: { [arg: string]: any }) {
    if (this.activeView.instance.componentLoaded)
      this.componentOpens[this.activeView.instance.componentLoadedName].next(this.componentOpens[this.activeView.instance.componentLoadedName].value - 1);

    if (!this.componentOpens[component.name])
      this.componentOpens[component.name] = new BehaviorSubject(1);
    else
      this.componentOpens[component.name].next(this.componentOpens[component.name].value + 1);

    this.activeView.instance.loadComponent(component, args);
    this.activeView.instance.componentLoadedName = component.name;
  }

  private onChangeActiveView(view: ComponentRef<ViewerComponent>) {
    this.views.forEach(v => v.instance.active = false);
    view.instance.active = true;
    this.activeView = view;
  }
}
