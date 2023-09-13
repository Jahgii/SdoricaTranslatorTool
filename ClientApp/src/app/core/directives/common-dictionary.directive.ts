import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { computePosition, flip, shift, arrow, autoUpdate } from '@floating-ui/dom';

const REGEXP_SPECIAL_CHAR =
  /[\!\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-]/g;

@Directive({
  selector: '[appCommonDictionary]'
})
export class CommonDictionaryDirective implements OnInit {
  @Input() text!: string;

  private color: string = 'var(--tui-elevation-02)';

  constructor(
    private _elemRef: ElementRef<HTMLSpanElement>,
    private render: Renderer2
  ) {
  }

  ngOnInit(): void {
    let temporalText = this.text;
    let searchWords: ICommonDictionary[] = [
      { Original: '[Extreme]', Translation: '[Extremo]' },
      { Original: 'Wonderland Trial', Translation: 'Wonderland Trial' },
      { Original: 'achievement', Translation: 'Logro' },
      { Original: 'Tier SSR', Translation: 'Rareza SSR' }
    ];
    this.treeSearch(searchWords, temporalText);
  }

  /**
   * Search all commons words in text with tree algorithm
   * @param searchWords common words
   * @param temporalText text to search
   */
  private treeSearch(searchWords: ICommonDictionary[], temporalText: string) {
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
        let tooltip = this.render.createElement('div') as HTMLDivElement;
        let tooltipSpan = this.render.createElement('span') as HTMLSpanElement;
        let tooltipArrow = this.render.createElement('div') as HTMLSpanElement;

        span.innerText = content;
        this.render.addClass(span, 'common-word');
        this.render.appendChild(this._elemRef.nativeElement, span);

        tooltip.role = 'tooltip';
        tooltip.style.width = 'max-content';
        tooltip.style.position = 'absolute';
        tooltip.style.top = '0';
        tooltip.style.left = '0';
        tooltip.style.background = this.color;
        // tooltip.style.color = 'white';
        tooltip.style.fontWeight = 'bold';
        tooltip.style.filter = 'drop-shadow(0 0 .125rem rgba(0,0,0,.16)) drop-shadow(0 1.5rem 1rem rgba(0,0,0,.03)) drop-shadow(0 .75rem .75rem rgba(0,0,0,.04)) drop-shadow(0 .25rem .375rem rgba(0,0,0,.05))';
        tooltip.style.padding = '6px';
        tooltip.style.borderRadius = 'var(--tui-radius-s)';
        tooltip.style.fontSize = '80%';

        tooltipArrow.style.position = 'absolute';
        tooltipArrow.style.background = this.color;
        tooltipArrow.style.width = '8px';
        tooltipArrow.style.height = '8px';
        tooltipArrow.style.transform = 'rotate(45deg)';

        tooltipSpan.innerText = searchWord.Translation;

        this.render.appendChild(tooltip, tooltipSpan);
        this.render.appendChild(tooltip, tooltipArrow);
        this.render.appendChild(this._elemRef.nativeElement, tooltip);

        function updatePosition() {
          computePosition(span, tooltip, {
            placement: 'top',
            middleware: [
              flip(),
              shift({ padding: 5 }),
              arrow({ element: tooltipArrow }),
            ],
          }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(tooltip.style, {
              left: `${x}px`,
              top: `${y}px`,
            });

            // Accessing the data
            const { x: arrowX, y: arrowY } = middlewareData.arrow ?? { x: 0, y: 0 };

            const staticSide = {
              top: 'bottom',
              right: 'left',
              bottom: 'top',
              left: 'right',
            }[placement.split('-')[0]];

            Object.assign(tooltipArrow.style, {
              left: arrowX != null ? `${arrowX}px` : '',
              top: arrowY != null ? `${arrowY}px` : '',
              right: '',
              bottom: '',
              [staticSide ?? 'bottom']: '-4px',
            });
          });
        }

        const cleanup = autoUpdate(
          span,
          tooltip,
          updatePosition
        );

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

interface ICommonDictionary {
  Original: string;
  Translation: string;
}