import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ICommonWord } from '../interfaces/i-common-word';
import { CommonWordsService } from '../services/common-words.service';

const REGEXP_SPECIAL_CHAR =
  /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;

@Directive({
    selector: '[appCommonDictionary]',
    standalone: true
})
export class CommonDictionaryDirective implements OnInit {
  @Input() text!: string;

  private color: string = 'var(--tui-background-elevation-2)';

  constructor(
    private commonWords: CommonWordsService,
    private _elemRef: ElementRef<HTMLSpanElement>,
    private render: Renderer2
  ) {
  }

  ngOnInit(): void {
    let temporalText = this.text;
    this.treeSearch(this.commonWords.words, temporalText);
  }

  /**
   * Search all commons words in text with tree algorithm
   * @param searchWords common words
   * @param temporalText text to search
   */
  private treeSearch(searchWords: ICommonWord[], temporalText: string) {
    let found = false;
    for (var index = 0; index < searchWords.length; index++) {
      const searchWord = searchWords[index];
      const escapedSW = searchWord.Original.replace(REGEXP_SPECIAL_CHAR, '\\$&');

      let indexBeginChar = temporalText.search(escapedSW);
      if (indexBeginChar > -1) {
        let content = temporalText.substring(indexBeginChar, indexBeginChar + searchWord.Original.length);

        //Left
        if (indexBeginChar > 0) {
          this.treeSearch(searchWords, temporalText.substring(0, indexBeginChar))
        }

        let span = this.render.createElement('span') as HTMLSpanElement;

        span.innerText = `[${content} / ${searchWord.Translation}]`;
        this.render.addClass(span, 'common-word');
        this.render.appendChild(this._elemRef.nativeElement, span);

        found = true;

        //Right
        if ((indexBeginChar + searchWord.Original.length) < temporalText.length) {
          this.treeSearch(searchWords, temporalText.substring(indexBeginChar + searchWord.Original.length, temporalText.length))
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