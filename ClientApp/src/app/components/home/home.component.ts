import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TuiBreakpointService, TuiSizeL } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  size$: Observable<TuiSizeL> = this.breakpointService.pipe(
    map(key => (key === 'mobile' ? 'm' : 'l')),
  );
  public showBlockStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public languages!: string[];
  public language: FormControl = new FormControl('', Validators.required);
  private subsLanguage!: Subscription;

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    @Inject(TuiBreakpointService) readonly breakpointService: TuiBreakpointService
  ) { }

  ngOnInit(): void {
    this.subsLanguage = this.language.valueChanges.subscribe((lang: string) => {
      this.local.setDefaultLang(lang);
    });

    firstValueFrom(this.api.get<ILanguage[]>('languages'))
      .then(r => {
        if (r.length == 0) {
          this.showBlockStatus.next(true);
          return;
        }

        this.languages = r.map(e => e.Name);

        let defaultLang = this.local.getDefaultLang();
        let lang = r.find(e => e.Name == defaultLang);

        if (!lang) {
          lang = r[0];
          this.local.setDefaultLang(lang.Name);
        }
        this.language.patchValue(lang.Name);
      });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }


}
