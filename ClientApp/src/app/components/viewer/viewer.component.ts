import { ChangeDetectorRef, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TuiScrollbarModule } from '@taiga-ui/core';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TranslateModule } from '@ngx-translate/core';

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

  public componentLoaded: any;
  
  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadComponent();
  }

  public changeWidth(width: number) {
    this.widthPercentage = `${width}%`;
    this.ref.markForCheck();
  }

  public loadComponent() {
    // let component = this.adHost
    //   .viewContainerRef
    //   .createComponent<HomeComponent>(HomeComponent);
    
    // this.componentLoaded = component;
  }
}
