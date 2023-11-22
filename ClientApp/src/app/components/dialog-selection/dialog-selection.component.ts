import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiElasticContainerModule, TuiInputInlineModule, TuiTreeModule } from '@taiga-ui/kit';
import { DialogAssetsComponent } from '../dialog-assets/dialog-assets.component';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { map, mergeMap, toArray } from 'rxjs/operators';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiButtonModule, TuiExpandModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,

    TuiScrollbarModule,
    TuiButtonModule,
    TuiSvgModule,
    TuiElasticContainerModule,
    TuiExpandModule,
    TuiInputInlineModule,

    DialogAssetsComponent
  ],
  templateUrl: './dialog-selection.component.html',
  styleUrl: './dialog-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogSelectionComponent implements OnInit, OnDestroy {
  @ViewChild(DialogAssetsComponent) dialogs!: DialogAssetsComponent;

  public treeNodes$!: Observable<TreeNode[]>;
  private subsLanguage!: Subscription;
  public groupSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hiddenScroll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private api: ApiService,
    readonly languageOrigin: LanguageOriginService,
  ) {

  }

  ngOnInit(): void {
    this.subsLanguage = this.languageOrigin.language$
      .subscribe((lang: string) => {
        let mainNodes = this.api
          .getWithHeaders<TreeNode[]>('maingroups', { language: lang })
          .pipe(
            map(array => array.map(
              g => {
                g.editing = false;
                g.expanded = false;
                return g;
              }
            ))
          );

        let groupNodes = mainNodes.pipe(
          mergeMap((v) => v),
          mergeMap((v) =>
            this.groupQuery(lang, v.OriginalName)
              .pipe(
                map((res) => {
                  v.children = res;
                  return v;
                })
              )
          ),
          toArray()
        );

        this.treeNodes$ = groupNodes;
      });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }

  private groupQuery(lang: string, originalName: string) {
    return this.api
      .getWithHeaders<IGroup[]>('groups', { language: lang, mainGroup: originalName })
      .pipe(map(array => array.map(
        g => {
          g.editing = false;
          return g;
        }
      ))
      );
  }

  public onSelectGroup(mainGroup: string, group: string) {
    if (!mainGroup || !group) return;
    this.groupSelected$.next(true);
    this.dialogs.onSelectGroup(mainGroup, group);
  }

  public onMouseEnter() {
    this.hiddenScroll$.next(false);
  }

  public onMouseLeave() {
    this.hiddenScroll$.next(true);
  }

}

interface TreeNode extends IMainGroup {
  children?: readonly IGroup[];
  expanded?: boolean;
}
