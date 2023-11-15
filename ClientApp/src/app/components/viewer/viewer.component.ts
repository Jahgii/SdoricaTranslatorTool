import { ChangeDetectorRef, Component, ComponentRef, HostBinding, OnInit, Type, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TuiScrollbarModule } from '@taiga-ui/core';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { forEach } from 'jszip';

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
  @HostBinding('style.width')
  widthPercentage = "100%";

  public componentLoaded!: ComponentRef<any>;

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  public changeWidth(width: number) {
    this.widthPercentage = `${width}%`;
    this.ref.markForCheck();
  }

  public loadComponent(component: Type<any>, args: { [arg: string]: any }) {
    this.componentLoaded = this.adHost
      .viewContainerRef
      .createComponent<any>(component);

    Object.keys(args).forEach(k => {
      this.componentLoaded.instance[k] = args[k];
    });
  }
}
