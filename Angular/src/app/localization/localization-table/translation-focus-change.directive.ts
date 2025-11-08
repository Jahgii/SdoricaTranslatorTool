import { Directive, Input, OnInit, WritableSignal } from '@angular/core';
import { TuiTextarea } from '@taiga-ui/kit';

@Directive({
  selector: '[appTranslationFocusChange]'
})
export class TranslationFocusChangeDirective implements OnInit {
  @Input()
  public textarea!: TuiTextarea;
  @Input()
  public signal!: WritableSignal<string>;
  @Input()
  public id!: string;

  ngOnInit(): void {
    const el = (this.textarea as any).el as HTMLElement;

    el.onfocus = (_) => this.signal.set(this.id);
  }
}
