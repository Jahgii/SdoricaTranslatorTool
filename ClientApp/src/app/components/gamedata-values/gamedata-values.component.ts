import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  TuiBreakpointService,
  TuiDialogContext,
  TuiDialogService,
  TuiDialogSize,
  TuiHostedDropdownModule,
  TuiModeModule,
  TuiDataListModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule,
  TuiPrimitiveTextfieldModule
} from '@taiga-ui/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { GamedataService } from 'src/app/core/services/gamedata.service';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { TuiCheckboxModule } from '@taiga-ui/kit/components/checkbox';
import { TuiTableModule } from '@taiga-ui/addon-table';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiInputModule, TuiInputNumberModule, TuiCheckboxBlockModule } from '@taiga-ui/kit';
import { DraggableElementDirective } from '../../core/directives/draggable-element.directive';
import { NgIf, NgSwitch, NgSwitchCase, AsyncPipe } from '@angular/common';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiDropdownModule } from '@taiga-ui/core/directives/dropdown';

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
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    TuiHostedDropdownModule,
    TuiDropdownModule,
    TuiButtonModule,
    TuiModeModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiScrollbarModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiPrimitiveTextfieldModule,
    TuiInputNumberModule,
    TuiHintModule,
    TuiCheckboxBlockModule,
    TuiLoaderModule,
    TuiTableModule,
    TuiCheckboxModule,

    DraggableElementDirective,
  ]

})
export class GamedataValuesComponent implements OnInit, OnDestroy {
  @ViewChild('createTemplate') createTemplateView!: TemplateRef<any>;
  @ViewChild('listTemplate') listTemplateView!: TemplateRef<any>;

  public menuOpen = false;

  public dialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 55,
    yBottomMargin: 10
  };

  public listDialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 50,
    yBottomMargin: 10
  };

  private subsBreakpoint!: Subscription | undefined;
  private subsDialog!: Subscription | undefined;
  private dialog: 'list' | 'create' | undefined;

  constructor(
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    public gamedataService: GamedataService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) {

  }

  ngOnInit(): void {
    this.subsBreakpoint = this.breakpointService$.subscribe(v => {
      if (v == 'mobile') {
        if (this.dialogState.isHidden === false) {
          this.dialogState.isHidden = true;
          this.onShowCreateNew(this.createTemplateView, 'm');
          this.cd.detectChanges();
        }
        else if (this.listDialogState.isHidden === false) {
          this.listDialogState.isHidden = true;
          this.onShowList(this.listTemplateView, 'm');
          this.cd.detectChanges();
        }
      }
      else {
        if (this.subsDialog) {
          this.subsDialog.unsubscribe();
          this.subsDialog = undefined;
          if (this.dialog == 'create') this.dialogState.isHidden = false;
          else if (this.dialog == 'list') this.listDialogState.isHidden = false;
          this.cd.detectChanges();
        }
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
            .subscribe();
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
            .subscribe();
          this.cd.detectChanges();
        }
      });
  }

}
