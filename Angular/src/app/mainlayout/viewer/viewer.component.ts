import { TuiBlockStatus } from "@taiga-ui/layout";
import { TuiIcon, TuiScrollbar } from "@taiga-ui/core";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, effect, HostBinding, HostListener, OnInit, signal, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TranslateModule } from '@ngx-translate/core';
import { ViewersService } from "src/app/core/services/viewers.service";

@Component({
  selector: 'app-viewer',
  imports: [
    CommonModule,
    TranslateModule,
    //Taiga
    TuiScrollbar,
    TuiBlockStatus,
    TuiIcon,
    AdHostDirective
  ],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerComponent {
  @ViewChild(AdHostDirective, { static: true })
  adHost!: AdHostDirective;
  @HostListener('click')
  setActiveViewer = (viewer: ComponentRef<ViewerComponent>): void => undefined;
  @HostBinding('style.width')
  widthPercentage = "100%";

  public componentLoadedName?: string;
  public componentLoaded: ComponentRef<any> | undefined;
  public active = signal(false);
  public viewIndex = -1;

  constructor(
    private readonly cd: ChangeDetectorRef,
    private readonly viewers: ViewersService,
  ) {
    effect(() => {
      this.viewers.notifier();
      this.cd.markForCheck();
    });
  }

  public changeWidth(width: number) {
    this.widthPercentage = `${width}%`;
    this.cd.markForCheck();
  }

  public loadComponent(component: Type<any>, args: { [arg: string]: any }) {
    if (this.componentLoaded && this.adHost.viewContainerRef.length > 0) {
      this.adHost.viewContainerRef.clear();
    }

    this.componentLoaded = this.adHost
      .viewContainerRef
      .createComponent<any>(component);

    this.componentLoaded.instance.viewIndex = this.viewIndex;

    for (const k of Object.keys(args))
      if (this.componentLoaded) this.componentLoaded.instance[k] = args[k];

    this.cd.markForCheck();
  }

  public onClearComponent() {
    this.adHost.viewContainerRef.clear();
    this.componentLoadedName = undefined;
    this.componentLoaded = undefined;
    this.cd.markForCheck();
  }
}
