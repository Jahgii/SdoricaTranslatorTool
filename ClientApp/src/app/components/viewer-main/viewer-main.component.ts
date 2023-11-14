import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewerComponent } from '../viewer/viewer.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { ViewerResizerComponent } from '../viewer-resizer/viewer-resizer.component';
import { ViewersService } from 'src/app/core/services/viewers.service';

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
  @HostBinding('class')
  private classes = 'main-viewer';
  @ViewChild(AdHostDirective, { static: true })
  private adHost!: AdHostDirective;

  constructor(
    private viewers: ViewersService,
    private cd: ChangeDetectorRef
  ) {
    this.viewers.notifier.subscribe(e => {
      this.cd.markForCheck();
    });
  }

  ngOnInit() {
    this.viewers.init(this.adHost);
  }

}
