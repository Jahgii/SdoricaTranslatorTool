import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TuiBreakpointService, TuiDialogContext, TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom, map } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGamedataValue } from 'src/app/core/interfaces/i-gamedata';
import { ApiService } from 'src/app/core/services/api.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { GamedataService } from 'src/app/core/services/gamedata.service';
import { fadeinAnimation } from 'src/app/core/animations/fadein';

@Component({
  selector: 'app-gamedata-values',
  templateUrl: './gamedata-values.component.html',
  styleUrls: ['./gamedata-values.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation,
    fadeinAnimation
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
    private fB: FormBuilder,
    private api: ApiService,
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
