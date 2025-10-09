import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { CommonWordTableCellEditableComponent } from 'src/app/components/common-words/common-word-table/common-word-table-cell-editable/common-word-table-cell-editable.component';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  @Input()
  public cell!: CommonWordTableCellEditableComponent;

  constructor(private readonly el: ElementRef<HTMLInputElement>) { }

  ngAfterViewInit() {
    this.el.nativeElement.onblur = () => this.cell.onMouseLeave();
    if (this.el?.nativeElement) this.el.nativeElement.focus();
  }

}
