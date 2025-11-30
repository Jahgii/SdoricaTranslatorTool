import { Directive, SkipSelf } from '@angular/core';
import { TuiStringHandler } from '@taiga-ui/cdk';
import { TUI_ICON_RESOLVER } from '@taiga-ui/core';
@Directive({
  selector: '[appGeminiIcon]',
  providers: [
    {
      provide: TUI_ICON_RESOLVER,
      deps: [[new SkipSelf(), TUI_ICON_RESOLVER]],
      useFactory(defaultResolver: TuiStringHandler<string>) {
        return (name: string) =>
          name.startsWith('@tui.')
            ? defaultResolver(name)
            : `/assets/icons/${name}.svg`;
      },
    },
  ]
})
export class GeminiIconDirective { }