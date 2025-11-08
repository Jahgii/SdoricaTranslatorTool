import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ResizerDirective } from 'src/app/core/directives/resizer.directive';
import { ViewerComponent } from '../viewer/viewer.component';

@Component({
  selector: 'app-viewer-resizer',
  imports: [ResizerDirective],
  templateUrl: './viewer-resizer.component.html',
  styleUrl: './viewer-resizer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerResizerComponent {
  public views!: ViewerComponent[];
}
