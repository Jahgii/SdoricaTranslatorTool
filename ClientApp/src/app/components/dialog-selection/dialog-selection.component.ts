import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TUI_TREE_CONTENT, TuiTreeModule } from '@taiga-ui/kit';
import { EMPTY_ARRAY, TuiHandler } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { DialogTreeContentComponent } from './dialog-tree-content/dialog-tree-content.component';
import { DialogAssetsComponent } from '../dialog-assets/dialog-assets.component';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { flatMap, map, mergeMap, toArray } from 'rxjs/operators';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiButtonModule, TuiScrollbarModule } from '@taiga-ui/core';

@Component({
  selector: 'app-dialog-selection',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,

    TuiTreeModule,
    TuiScrollbarModule,
    TuiButtonModule,

    DialogTreeContentComponent,
    DialogAssetsComponent
  ],
  providers: [
    {
      provide: TUI_TREE_CONTENT,
      useValue: new PolymorpheusComponent(DialogTreeContentComponent),
    },
  ],
  templateUrl: './dialog-selection.component.html',
  styleUrl: './dialog-selection.component.scss'
})
export class DialogSelectionComponent implements OnInit, OnDestroy {
  @ViewChild(DialogAssetsComponent) dialogs!: DialogAssetsComponent;

  public treeNodes$!: Observable<TreeNode[]>;
  private subsLanguage!: Subscription;
  public groupSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  readonly handler: TuiHandler<TreeNode, readonly TreeNode[]> = item =>
    item.children || EMPTY_ARRAY;

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

}

interface TreeNode extends IMainGroup {
  children?: readonly IGroup[];
}
