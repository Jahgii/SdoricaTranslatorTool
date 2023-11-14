import { ChangeDetectionStrategy, Component, ComponentRef, ElementRef, HostBinding, OnInit, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewerComponent } from '../viewer/viewer.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { ViewerResizerComponent } from '../viewer-resizer/viewer-resizer.component';

@Component({
  selector: 'app-viewer-main',
  standalone: true,
  imports: [
    CommonModule,
    AdHostDirective
  ],
  templateUrl: './viewer-main.component.html',
  styleUrls: ['./viewer-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerMainComponent implements OnInit {
  @HostBinding('class') classes = 'main-viewer';
  @ViewChild(AdHostDirective, { static: true }) adHost!: AdHostDirective;

  public views: ComponentRef<ViewerComponent>[] = [];

  constructor() { }

  ngOnInit() {
    this.AddViewer();
    this.AddViewer();
    this.resizeViewers();
  }

  public AddViewer() {
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

  public resizeViewers() {
    let width: number = 100 / this.views.length;

    this.views.forEach(v => {
      v.instance.widthPercentage = `${width}%`
    });
  }

  public Resizers() {
    this.views.forEach(e => e.setInput('showResizer', true));
    this.views[this.views.length - 1].setInput('showResizer', false);
  }
}
