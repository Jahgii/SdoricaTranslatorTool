import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { AdHostDirective } from 'src/app/core/directives/host-directive';
import { TuiResizerDirective, TuiResizerModule } from '@taiga-ui/cdk';
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
  @ViewChild(TuiResizerDirective, { static: true }) adResizer!: TuiResizerDirective;
  @ViewChild(AdHostDirective, { static: true }) adHost!: AdHostDirective;

  constructor() { }

  ngOnInit(): void {
    this.loadComponent();
  }

  public loadComponent() {
    this.adHost.viewContainerRef.createComponent<HomeComponent>(HomeComponent);
  }
}
