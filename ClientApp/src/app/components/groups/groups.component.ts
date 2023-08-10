import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class GroupsComponent {
  public groups$!: Observable<IGroup[]>;
  private subsLanguage!: Subscription;
  public order = new Map();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    readonly languageOrigin: LanguageOriginService
  ) { }

  ngOnInit(): void {
    let mainGroup = this.route.snapshot.params['mid'];

    this.subsLanguage = this.languageOrigin.language$.subscribe((lang: string) => {
      this.groups$ = this.api.getWithHeaders('groups', { language: lang, mainGroup: mainGroup });
    });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }
}
