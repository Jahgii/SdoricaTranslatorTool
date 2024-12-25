import { TuiTable } from "@taiga-ui/addon-table";
import { TuiPrimitiveTextfieldModule, TuiTextfieldControllerModule, TuiInputModule, TuiInputNumberModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { TuiBreakpointService, TuiDialogContext, TuiDialogService, TuiDialogSize, TuiDataList, TuiLoader, TuiScrollbar, TuiDropdown, TuiIcon, TuiButton, TuiHint } from '@taiga-ui/core';
import { BehaviorSubject, Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { GamedataService } from 'src/app/core/services/gamedata.service';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TuiCheckbox, TuiBlock, TuiButtonLoading } from '@taiga-ui/kit';
import { DraggableElementDirective } from '../../core/directives/draggable-element.directive';
import { NgIf, NgSwitch, NgSwitchCase, AsyncPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { DialogState } from 'src/app/core/interfaces/i-dialog';
import { DialogstateService } from 'src/app/core/services/dialogstate.service';
import { IGamedataValue } from "src/app/core/interfaces/i-gamedata";

@Component({
  selector: 'app-gamedata-values',
  templateUrl: './gamedata-values.component.html',
  styleUrls: ['./gamedata-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation,
    fadeinAnimation
  ],
  standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgStyle,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgTemplateOutlet,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    TuiDropdown,
    TuiButton,
    TuiDataList,
    TuiIcon,
    TuiScrollbar,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiPrimitiveTextfieldModule,
    TuiInputNumberModule,
    TuiHint,
    TuiBlock,
    TuiCheckbox,
    TuiLoader,
    TuiTable,
    TuiButtonLoading,

    DraggableElementDirective,
  ]

})
export class GamedataValuesComponent implements OnInit, OnDestroy {
  @ViewChild('createTemplate') createTemplateView!: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplateView!: TemplateRef<any>;

  public menuOpen = false;

  public dialogStateName = 'gamedata';
  public dialogState: DialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 55,
    yBottomMargin: 10,
    zIndex$: new BehaviorSubject(1)
  };

  public dialogListStateName = 'gamedataList';
  public listDialogState: DialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 50,
    yBottomMargin: 10,
    zIndex$: new BehaviorSubject(1)
  };

  private subsBreakpoint!: Subscription | undefined;
  private subsDialog!: Subscription | undefined;
  private dialog: 'list' | 'create' | undefined;

  constructor(
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    public gamedataService: GamedataService,
    private dStateService: DialogstateService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {
    this.dStateService.addState(this.dialogStateName, this.dialogState);
    this.dStateService.addState(this.dialogListStateName, this.listDialogState);
  }

  ngOnInit(): void {
    this.subsBreakpoint = this.breakpointService$.subscribe(v => {
      if (v == 'mobile') {
        if (this.dialogState.isHidden === false) {
          this.dialogState.isHidden = true;
          if (this.dialogState.zIndex$.value === 2)
            this.onShowCreateNew(this.createTemplateView, 'm');
          this.cd.detectChanges();
        }
        if (this.listDialogState.isHidden === false) {
          this.listDialogState.isHidden = true;
          if (this.listDialogState.zIndex$.value === 2)
            this.onShowList(this.listTemplateView, 'm');
          this.cd.detectChanges();
        }
      }
      else if (this.subsDialog) {
        this.subsDialog.unsubscribe();
        this.subsDialog = undefined;
        if (this.dialog == 'create') this.dialogState.isHidden = false;
        else if (this.dialog == 'list') this.listDialogState.isHidden = false;
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.gamedataService.subsKeyName?.unsubscribe();
    this.subsBreakpoint?.unsubscribe();
  }

  public onShowCreateNew(content: PolymorpheusContent<TuiDialogContext>, size: TuiDialogSize) {
    firstValueFrom(this.breakpointService$)
      .then(v => {
        if (window.innerHeight > 500 && (v == 'desktopLarge' || v == 'desktopSmall')) {
          this.menuOpen = false;
          this.dialogState.isHidden = !this.dialogState.isHidden;
          this.changeIndex(this.dialogState);
          this.cd.detectChanges();
        }
        else {
          this.menuOpen = false;
          this.dialog = 'create';
          this.subsDialog = this.dialogs
            .open(content, {
              label: this.translate.instant('buffinfo-form'),
              size: size,
            })
            .subscribe({
              complete: () => {
                this.subsDialog = undefined;
              },
            });
          this.cd.detectChanges();
        }
      });
  }

  public onShowList(content: PolymorpheusContent<TuiDialogContext>, size: TuiDialogSize) {
    firstValueFrom(this.breakpointService$)
      .then(v => {
        if (window.innerHeight > 500 && (v == 'desktopLarge' || v == 'desktopSmall')) {
          this.menuOpen = false;
          this.listDialogState.isHidden = !this.listDialogState.isHidden;
          this.changeIndex(this.listDialogState);
          this.cd.detectChanges();
        }
        else {
          this.menuOpen = false;
          this.dialog = 'list';
          this.subsDialog = this.dialogs
            .open(content, {
              label: this.translate.instant('buffinfo-list'),
              size: size,
            })
            .subscribe({
              complete: () => {
                this.subsDialog = undefined;
              },
            });
          this.cd.detectChanges();
        }
      });
  }

  public changeIndex(state: DialogState) {
    this.dStateService.onChangeIndex(state);
  }

  public trackByItemId(index: number, item: IGamedataValue): string {
    console.log()
    return item.Id ?? String(index);
  }

}
