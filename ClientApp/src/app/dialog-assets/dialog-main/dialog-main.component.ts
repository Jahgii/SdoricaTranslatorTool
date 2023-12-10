import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiLoaderModule } from '@taiga-ui/core';
import { DialogSelectionComponent } from '../dialog-selection/dialog-selection.component';
import { DialogAssetsComponent } from '../dialog-assets/dialog-assets.component';

@Component({
  selector: 'app-dialog-main',
  standalone: true,
  templateUrl: './dialog-main.component.html',
  styleUrl: './dialog-main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    TuiBlockStatusModule,
    TuiLoaderModule,

    DialogSelectionComponent,
    DialogAssetsComponent
  ],
  providers: [ElementBreakpointService]
})
export class DialogMainComponent {
  viewIndex: number = -1;

  constructor(
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

}
