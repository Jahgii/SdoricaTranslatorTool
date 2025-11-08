import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiElasticContainer, TuiInputInline, TuiProgress } from '@taiga-ui/kit';
import { DialogAssetsComponent } from '../dialog-assets/dialog-assets.component';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { debounceTime, take, takeWhile, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiLoader, TuiScrollbar, TuiIcon } from '@taiga-ui/core';
import { FormsModule } from '@angular/forms';
import { DGroupsService, TreeNode } from './d-groups.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { TuiExpand } from '@taiga-ui/experimental';
import { TuiItem } from '@taiga-ui/cdk';

@Component({
  selector: 'app-dialog-selection',
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    TuiScrollbar,
    TuiIcon,
    TuiElasticContainer,
    TuiExpand,
    TuiItem,
    TuiInputInline,
    TuiProgress,
    TuiLoader,
  ],
  templateUrl: './dialog-selection.component.html',
  styleUrl: './dialog-selection.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogSelectionComponent implements OnInit, OnDestroy {
  @Input() dialogs!: DialogAssetsComponent;
  @Input() viewIndex!: number;

  public treeNodes$: Observable<TreeNode[]> = this.groupService.store$;
  public loadingNodes$: Observable<boolean> = this.groupService.loadingStore$;
  public groupSelected$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hiddenScroll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private subsName: Subscription | undefined;
  private subsCheck: Subscription | undefined;
  private nodeSelected!: TreeNode;
  private autoLoadGroupId: string | undefined;

  constructor(
    private readonly groupService: DGroupsService,
    private readonly lStorage: LocalStorageService,
  ) {

  }

  ngOnInit(): void {
    this.onInit();
  }

  ngOnDestroy(): void {
    this.nodeSelected?.selected?.next(false);
    this.subsCheck?.unsubscribe();
    this.subsName?.unsubscribe();
  }

  private onInit() {
    if (this.treeNodes$) this.initLastGroupSelected();
    else
      this.groupService
        .loadingStore$
        .pipe(takeWhile(_ => !this.treeNodes$))
        .subscribe(_ => {
          if (_) return;
          this.treeNodes$ = this.groupService.store$;
          this.initLastGroupSelected();
        });

    this.subsCheck = this.dialogs
      .dAS
      .translatedChange
      .subscribe(change => {
        if (change)
          this.groupService.onCheckTranslated(change.node, change.translated);
      });
  }

  private initLastGroupSelected() {
    this.autoLoadGroupId ??= this.lStorage.getGroup(this.viewIndex);

    let groups = this.groupService.getData();

    let group = groups
      .find(e => e.children?.find(c => c.Id?.toString() === this.autoLoadGroupId))
      ?.children
      ?.find(e => e.Id?.toString() === this.autoLoadGroupId);

    if (group) this.onSelectGroup(group);
  }

  public onSelectGroup(node: TreeNode) {
    if (node.selected?.value === true) return;

    let mainGroup = (node as IGroup).MainGroup;
    let group = node.OriginalName;

    if (!mainGroup || !group) return;

    this.groupSelected$.next(true);
    this.dialogs.onSelectGroup(node as IGroup);

    this.nodeSelected?.selected?.next(false);
    this.nodeSelected = node;
    this.nodeSelected.selected?.next(true);
    this.lStorage.setGroup(this.viewIndex, node.Id ?? '');
  }

  public onMouseEnter() {
    this.hiddenScroll$.next(false);
  }

  public onMouseLeave() {
    this.hiddenScroll$.next(true);
    if (this.groupSelected$.value === true)
      (document.activeElement as any)?.blur();
  }

  public onFocusName(focus: boolean, input: TuiInputInline, node: TreeNode) {
    if (focus) {
      let oldName = `${node.Name}`;
      if (this.subsName) this.subsName.unsubscribe();
      this.subsName = (input as any).control?.valueChanges
        .pipe(
          tap(_ => node.saving?.next(true)),
          debounceTime(1000),
        ).subscribe(async (_: any) => {
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
      else if (cS) cS.unsubscribe();
    }
  }

}
