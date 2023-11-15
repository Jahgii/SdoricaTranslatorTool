import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, Subscription, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiTextfieldControllerModule, TuiModeModule } from '@taiga-ui/core';
import { TuiDropdownModule } from '@taiga-ui/core/directives/dropdown';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { FormsModule } from '@angular/forms';
import { TuiAutoFocusModule } from '@taiga-ui/cdk';
import { TuiTilesModule, TuiInputInlineModule, TuiInputModule } from '@taiga-ui/kit';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        popinAnimation
    ],
    standalone: true,
    imports: [
        NgIf,
        TuiTilesModule,
        NgFor,
        TuiInputInlineModule,
        TuiAutoFocusModule,
        FormsModule,
        TuiButtonModule,
        TuiDropdownModule,
        TuiInputModule,
        TuiTextfieldControllerModule,
        TuiSvgModule,
        TuiModeModule,
        RouterLink,
        TuiBlockStatusModule,
        TuiLoaderModule,
        AsyncPipe,
        TranslateModule,
    ],
})
export class GroupsComponent {
  public groups$!: Observable<IGroup[]>;
  private subsLanguage!: Subscription;
  public mainGroup!: string;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    readonly languageOrigin: LanguageOriginService
  ) { }

  ngOnInit(): void {
    if(!this.mainGroup)
    this.mainGroup = this.route.snapshot.params['mid'];

    this.subsLanguage = this.languageOrigin.language$.subscribe((lang: string) => {
      this.groups$ = this.api.getWithHeaders<IGroup[]>('groups', { language: lang, mainGroup: this.mainGroup })
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

  public async updateGroup(group: IGroup) {
    await firstValueFrom(this.api.put('groups', group))
      .then(
        r => { },
        error => { }
      );
  }
}
