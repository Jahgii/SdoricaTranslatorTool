import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizerDirective } from 'src/app/core/directives/resizer.directive';
import { ViewerComponent } from '../viewer/viewer.component';

@Component({
    selector: 'app-viewer-resizer',
    imports: [CommonModule, ResizerDirective],
    templateUrl: './viewer-resizer.component.html',
    styleUrl: './viewer-resizer.component.scss'
})
export class ViewerResizerComponent {
  public views!: ViewerComponent[];
}
