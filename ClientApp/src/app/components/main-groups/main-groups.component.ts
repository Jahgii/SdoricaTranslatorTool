import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';

@Component({
  selector: 'app-main-groups',
  templateUrl: './main-groups.component.html',
  styleUrls: ['./main-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class MainGroupsComponent {
  public mainGroups$!: Observable<IMainGroup[]>;
  public order = new Map();
  private subsLanguage!: Subscription;

  constructor(
    private api: ApiService,
    readonly languageOrigin: LanguageOriginService
  ) { }

  ngOnInit(): void {
    this.subsLanguage = this.languageOrigin.language$.subscribe((lang: string) => {
      this.mainGroups$ = this.api.getWithHeaders('maingroups', { language: lang });
    });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }
}
