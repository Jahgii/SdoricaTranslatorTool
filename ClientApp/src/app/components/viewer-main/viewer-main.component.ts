import { ChangeDetectionStrategy, Component, ComponentRef, HostBinding, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewerComponent } from '../viewer/viewer.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';

@Component({
  selector: 'app-viewer-main',
  standalone: true,
  imports: [
    CommonModule,
    AdHostDirective
  ],
  templateUrl: './viewer-main.component.html',
  styles: [`
    .root {
      overflow: hidden;
    }
  `],
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
  }

  public AddViewer() {
    let view = this.adHost
      .viewContainerRef
      .createComponent<ViewerComponent>(ViewerComponent);

    this.views.push(view);
  }

  public Resizers() {
    this.views.forEach(e => e.setInput('showResizer', true));
    this.views[this.views.length - 1].setInput('showResizer', false);
  }
}
