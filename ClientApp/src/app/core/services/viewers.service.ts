import { ComponentRef, Injectable, signal } from '@angular/core';
import { ViewerComponent } from 'src/app/components/viewer/viewer.component';
import { AdHostDirective } from '../directives/host-directive';
import { ViewerResizerComponent } from 'src/app/components/viewer-resizer/viewer-resizer.component';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViewersService {
  public views: ComponentRef<ViewerComponent>[] = [];
  private adHost!: AdHostDirective;
  public notifier: BehaviorSubject<boolean> = new BehaviorSubject(true);

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
      this.views.pop();
      this.resizeViewers();
    }

    this.notifier.next(true);
  }
}
