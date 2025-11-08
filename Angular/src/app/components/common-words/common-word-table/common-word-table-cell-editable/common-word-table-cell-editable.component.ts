import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, Input, signal, TemplateRef } from '@angular/core';

@Component({
    selector: 'app-common-word-table-cell-editable',
    imports: [NgTemplateOutlet],
    templateUrl: './common-word-table-cell-editable.component.html',
    styleUrl: './common-word-table-cell-editable.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonWordTableCellEditableComponent {
  @Input() focusTemplate!: TemplateRef<any>;
  @Input() unfocusTemplate!: TemplateRef<any>;

  protected readonly isHovered = signal(false);

  @HostListener('click')
  onMouseEnter() {
    this.isHovered.set(true);
  }

  onMouseLeave() {
    this.isHovered.set(false);
  }
}
