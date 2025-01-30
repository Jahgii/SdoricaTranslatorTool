import { TuiBlockStatus } from "@taiga-ui/layout";
import { TuiIcon, TuiScrollbar } from "@taiga-ui/core";
import { ChangeDetectorRef, Component, ComponentRef, HostBinding, HostListener, OnInit, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-viewer',
  standalone: true,
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
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  @ViewChild(AdHostDirective, { static: true })
  adHost!: AdHostDirective;
  @HostListener('click')
  setActiveViewer = (viewer: ComponentRef<ViewerComponent>): void => undefined;
  @HostBinding('style.width')
  widthPercentage = "100%";

  public componentLoadedName?: string;
  public componentLoaded: ComponentRef<any> | undefined;
  public active: boolean = false;
  public viewIndex = -1;

  constructor(
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  public changeWidth(width: number) {
    this.widthPercentage = `${width}%`;
    this.ref.markForCheck();
  }

  public loadComponent(component: Type<any>, args: { [arg: string]: any }) {
    if (this.componentLoaded && this.adHost.viewContainerRef.length > 0) {
      this.adHost.viewContainerRef.clear();
    }

    this.componentLoaded = this.adHost
      .viewContainerRef
      .createComponent<any>(component);

    this.componentLoaded.instance.viewIndex = this.viewIndex;

    Object.keys(args).forEach(k => {
      if (this.componentLoaded)
        this.componentLoaded.instance[k] = args[k];
    });

    this.ref.markForCheck();
  }

  public onClearComponent() {
    this.adHost.viewContainerRef.clear();
    this.componentLoadedName = undefined;
    this.componentLoaded = undefined;
    this.ref.markForCheck();
  }
}
