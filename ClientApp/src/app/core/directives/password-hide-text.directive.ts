import { Directive, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TUI_PASSWORD_TEXTS } from '@taiga-ui/kit';
import { map, startWith } from 'rxjs';

@Directive({
  selector: '[appPasswordHideText]',
  providers: [
    {
      provide: TUI_PASSWORD_TEXTS,
      useFactory: (translate = inject(TranslateService)) =>
        translate.onLangChange.pipe(
          map(_ => [translate.instant('show-api-key'), translate.instant('hide-api-key')]),
          startWith([translate.instant('show-api-key'), translate.instant('hide-api-key')]),
        ),
    }
  ]
})
export class PasswordHideTextDirective { }