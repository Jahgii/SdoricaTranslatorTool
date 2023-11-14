import { ChangeDetectorRef, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TuiResizerModule } from '@taiga-ui/cdk';
import { TuiScrollbarModule } from '@taiga-ui/core';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [
    CommonModule,

    //Taiga
    TuiResizerModule,
    TuiScrollbarModule,

    AdHostDirective
  ],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  @ViewChild("viewerContent", { static: true }) content!: ElementRef;
  @ViewChild(AdHostDirective, { static: true }) adHost!: AdHostDirective;
  @HostBinding('style.width')
  widthPercentage = "100%";

  @Input() showResizer = false;

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadComponent();
  }

  public changeWidth(width: number) {
    this.widthPercentage = `${width}%`;
    this.ref.markForCheck();
  }

  public loadComponent() {
    this.adHost.viewContainerRef.createComponent<HomeComponent>(HomeComponent);
  }
}
