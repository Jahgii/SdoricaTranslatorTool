import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
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
      this.groups$ = this.api.getWithHeaders<IGroup[]>('groups', { language: lang, mainGroup: mainGroup })
        .pipe(
          map(array => array.map(
            g => {
              g.editing = false;
              return g;
            }
          ))
        );
    });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }

  public onFocusedChange(focused: boolean, group: IGroup): void {
    if (!focused) {
      group.editing = false;
      this.updateGroup(group);
    }
  }

  public toogle(group: IGroup) {
    group.editing = !group.editing
  }

  public onEditGroupName(group: IGroup) {
    group.editing = false;
    this.updateGroup(group);
  }

  private async updateGroup(group: IGroup) {
    await firstValueFrom(this.api.put('groups', group))
      .then(
        r => { },
        error => { }
      );
  }
}
