import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiBreakpointService, TuiSizeL } from '@taiga-ui/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class HomeComponent {
  size$: Observable<TuiSizeL> = this.breakpointService.pipe(
    map(key => (key === 'mobile' ? 'm' : 'l')),
  );

  public showBlockStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    public languageOrigin: LanguageOriginService,
    @Inject(TuiBreakpointService) readonly breakpointService: TuiBreakpointService
  ) { }

}
