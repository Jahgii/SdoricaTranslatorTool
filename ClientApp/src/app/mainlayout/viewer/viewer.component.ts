import { ChangeDetectorRef, Component, ComponentRef, HostBinding, HostListener, OnInit, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TuiScrollbarModule } from '@taiga-ui/core';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TranslateModule } from '@ngx-translate/core';
import { ViewersService } from 'src/app/core/services/viewers.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [
    CommonModule,

    //Taiga
    TuiScrollbarModule,
    TuiBlockStatusModule,

    TranslateModule,
    AdHostDirective
  ],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  @ViewChild(AdHostDirective, { static: true })
  adHost!: AdHostDirective;
  @HostListener('click')
  setActiveViewer = (viewer: ComponentRef<ViewerComponent>): void => console.log("CLICK");
  @HostBinding('style.width')
  widthPercentage = "100%";

  public componentLoaded!: ComponentRef<any>;
  public active: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    private viewersService: ViewersService
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

    Object.keys(args).forEach(k => {
      this.componentLoaded.instance[k] = args[k];
    });

    this.ref.markForCheck();
  }
}
