import { Directive, ElementRef, Input, OnInit, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';

const REGEXP_SPECIAL_CHAR =
  /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;

@Directive({
  selector: '[appCommonDictionary]'
})
export class CommonDictionaryDirective implements OnInit {
  @Input() text!: string;

  constructor(
    private _elemRef: ElementRef<HTMLSpanElement>,
    private render: Renderer2
  ) {
  }

  ngOnInit(): void {
    let temporalText = this.text;

    let searchWords = ['[Extreme]'];
    this.treeSearch(searchWords, temporalText);
  }

  private treeSearch(searchWords: string[], temporalText: string) {
    let found = false;
    for (var index = 0; index < searchWords.length; index++) {
      const searchWord = searchWords[index];
      const escapedSW = searchWord.replace(REGEXP_SPECIAL_CHAR, '\\$&');

      let indexBeginChar = temporalText.search(escapedSW);
      if (indexBeginChar > -1) {
        let content = temporalText.substring(indexBeginChar, indexBeginChar + searchWord.length);

        //Left
        if (indexBeginChar > 0) {
          this.treeSearch(searchWords, temporalText.substring(0, indexBeginChar))
        }

        let span = this.render.createElement('span') as HTMLSpanElement;
        span.innerText = content;
        this.render.addClass(span, 'common-word');
        this.render.appendChild(this._elemRef.nativeElement, span);
        found = true;

        //Right
        if ((indexBeginChar + searchWord.length) < temporalText.length) {
          this.treeSearch(searchWords, temporalText.substring(indexBeginChar + searchWord.length, temporalText.length))
        }

        break;
      }
    }

    if (found == false) {
      let span = this.render.createElement('span') as HTMLSpanElement;
      span.innerText = temporalText;
      this.render.appendChild(this._elemRef.nativeElement, span);
    }
  }

}
