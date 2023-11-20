import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiTreeItemContentComponent } from '@taiga-ui/kit';
import { TuiSvgModule } from '@taiga-ui/core';

@Component({
  selector: 'app-dialog-tree-content',
  standalone: true,
  imports: [
    CommonModule,
    
    TuiSvgModule
  ],
  templateUrl: './dialog-tree-content.component.html',
  styleUrl: './dialog-tree-content.component.scss',
  host: {
    '(click)': `onClick()`,
  },
})
export class DialogTreeContentComponent extends TuiTreeItemContentComponent {
  get icon(): string {
    return this.isExpandable ? `tuiIconFolder` : `tuiIconFile`;
  }
}
