import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TuiBreakpointService, TuiDialogContext, TuiDialogService, TuiDialogSize } from '@taiga-ui/core';
import { Subscription, firstValueFrom } from 'rxjs';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ICommonWord } from 'src/app/core/interfaces/i-common-word';
import { CommonWordsService } from 'src/app/core/services/common-words.service';
import { PolymorpheusContent } from '@tinkoff/ng-polymorpheus';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-common-words',
  templateUrl: './common-words.component.html',
  styleUrls: ['./common-words.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation,
    fadeinAnimation
  ]
})
export class CommonWordsComponent implements OnInit, OnDestroy {
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

  public commonWordForm: FormGroup = this.fB.group({
    Original: ['', [Validators.required]],
    Translation: ['', [Validators.required]],
  });

  private subsBreakpoint!: Subscription | undefined;
  private subsDialog!: Subscription | undefined;
  private dialog: 'list' | 'create' | undefined;

  constructor(
    public commonWords: CommonWordsService,
    private fB: FormBuilder,
    private cd: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService,
    @Inject(TuiDialogService) private readonly dialogs: TuiDialogService
  ) { }

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
              label: this.translate.instant('common-word-form'),
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

          this.cd.detectChanges();
        }
        else {
          this.menuOpen = false;
          this.dialog = 'list';
          this.subsDialog = this.dialogs
            .open(content, {
              label: this.translate.instant('dictionary'),
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

  public async onCreateKey() {
    let word: ICommonWord = this.commonWordForm.getRawValue();

    await this.commonWords.create(word);
  }

  public onCreateOther() {
    this.commonWordForm.reset(undefined, { emitEvent: false });
    this.commonWords.createOther$.next(false);
  }

}
