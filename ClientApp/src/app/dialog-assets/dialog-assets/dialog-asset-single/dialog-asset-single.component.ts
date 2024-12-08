import { Component, Inject, Input, OnChanges, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { DialogAssetService } from '../dialog-asset.service';
import { IDialog, IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, KeyValuePipe, NgFor, NgIf, NgStyle } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';
import { TuiHint, TuiIcon, TuiScrollbar } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { popinAnimation } from 'src/app/core/animations/popin';
import { CommonDictionaryDirective } from 'src/app/core/directives/common-dictionary.directive';

@Component({
  selector: 'app-dialog-asset-single',
  standalone: true,
  imports: [
    FormsModule,
    AsyncPipe,
    NgStyle,
    NgIf,
    NgFor,
    KeyValuePipe,
    CommonDictionaryDirective,

    TranslateModule,

    TuiHint,
    TuiIcon,
    TuiScrollbar,
    TuiBlockStatus,
  ],
  animations: [popinAnimation],
  templateUrl: './dialog-asset-single.component.html',
  styleUrl: './dialog-asset-single.component.scss',
})
export class DialogAssetSingleComponent implements OnChanges {
  @Input() data!: IDialogAsset[];
  @Input() dialogAsset!: IDialogAsset;
  @Input() item!: IDialog;

  protected focus: WritableSignal<boolean> = signal(false);
  protected otherText$!: Observable<any>;
  protected showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private readonly portraitsService: PortraitsService,
    @Inject(DialogAssetService) public readonly dAS: DialogAssetService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item.currentValue)
      this.otherText$ = this.dAS.onGetOtherOriginalText(this.data[this.dAS.activeItemIndex].Number, changes.item.currentValue.ID);
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.dAS.onTextChange(dialogAsset);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    this.dAS.onSpeakerNameChange(name, data);
  }

  public onGetPortrait(name: string, ext: string = '.png') {
    return this.portraitsService.imageDir[name + ext];
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbar) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['offsetHeight'] < scrollTooltip['el']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }
}
