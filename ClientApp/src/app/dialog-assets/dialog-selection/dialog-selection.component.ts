import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiElasticContainerModule, TuiInputInlineComponent, TuiInputInlineModule, TuiProgressModule, TuiTreeModule } from '@taiga-ui/kit';
import { DialogAssetsComponent } from '../dialog-assets/dialog-assets.component';
import { IGroup, IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { debounceTime, map, mergeMap, take, takeUntil, takeWhile, tap, toArray } from 'rxjs/operators';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiButtonModule, TuiExpandModule, TuiLoaderModule, TuiScrollbarModule, TuiSvgModule } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { error } from 'console';
import { DGroupsService, TreeNode } from './d-groups.service';

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
    TuiProgressModule,
    TuiLoaderModule,

    DialogAssetsComponent
  ],
  templateUrl: './dialog-selection.component.html',
  styleUrl: './dialog-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogSelectionComponent implements OnInit, OnDestroy {
  @ViewChild(DialogAssetsComponent) dialogs!: DialogAssetsComponent;

  public treeNodes$: Observable<TreeNode[]> = this.groupService.store$;
  public loadingNodes$: Observable<boolean> = this.groupService.loadingStore$;
  public groupSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hiddenScroll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private subsName: Subscription | undefined;
  private nodeSelected!: TreeNode;

  constructor(
    private groupService: DGroupsService
  ) {

  }

  ngOnInit(): void {
    this.onInit();
  }

  private onInit() {
    if (!this.treeNodes$)
      this.groupService
        .loadingStore$
        .pipe(takeWhile(_ => !this.treeNodes$))
        .subscribe(_ => this.treeNodes$ = this.groupService.store$);
  }

  ngOnDestroy(): void {
    this.nodeSelected?.selected?.next(false);
  }

  public onSelectGroup(node: TreeNode) {
    if (node.selected?.value === true) return;

    let mainGroup = (node as IGroup).MainGroup;
    let group = node.OriginalName;

    if (!mainGroup || !group) return;

    this.groupSelected$.next(true);
    this.dialogs.onSelectGroup(mainGroup, group);

    this.nodeSelected?.selected?.next(false);
    this.nodeSelected = node;
    this.nodeSelected.selected?.next(true);
  }

  public onMouseEnter() {
    this.hiddenScroll$.next(false);
  }

  public onMouseLeave() {
    this.hiddenScroll$.next(true);
    if (this.groupSelected$.value === true)
      (document.activeElement as any)?.blur();
  }

  public onFocusName(focus: boolean, input: TuiInputInlineComponent, node: TreeNode) {
    if (focus) {
      let oldName = `${node.Name}`;
      this.subsName = input.control?.valueChanges
        .pipe(
          tap(_ => node.saving?.next(true)),
          debounceTime(1000),
        ).subscribe(async _ => {
          await this.groupService.onChangeName(node, oldName, input);
          node.saving?.next(false);
        });
    }
    else {
      let cS = this.subsName;
      if (node.saving?.value === true) {
        node.saving?.pipe(take(2))
          .subscribe(_ => {
            if (_) return;
            if (cS) cS.unsubscribe();
          });
      }
      else {
        if (cS) cS.unsubscribe();
      }
    }
  }

}
