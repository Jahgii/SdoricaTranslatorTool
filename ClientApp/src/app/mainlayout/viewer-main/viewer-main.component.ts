import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, HostBinding, OnInit, ViewChild } from '@angular/core';

import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { ViewersService } from 'src/app/core/services/viewers.service';
import { AppStateService } from 'src/app/core/services/app-state.service';

@Component({
  selector: 'app-viewer-main',
  imports: [
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
    private readonly viewers: ViewersService,
    private readonly app: AppStateService,
    private readonly cd: ChangeDetectorRef
  ) {
    effect(() => {
      this.viewers.notifier();
      this.cd.markForCheck();
    });
  }

  ngOnInit() {
    this.viewers.init(this.adHost);
    this.app.init();
  }

}
