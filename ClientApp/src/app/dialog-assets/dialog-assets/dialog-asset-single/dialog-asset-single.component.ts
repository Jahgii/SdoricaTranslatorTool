import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, signal, SimpleChanges, WritableSignal } from '@angular/core';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { DialogAssetService } from '../dialog-asset.service';
import { IDialog, IDialogAsset, TriggerChange } from 'src/app/core/interfaces/i-dialog-asset';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, KeyValue, KeyValuePipe, NgStyle } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';
import { TuiHint, TuiIcon, TuiScrollable, TuiScrollbar, TuiTextfield } from '@taiga-ui/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { CommonDictionaryDirective } from 'src/app/core/directives/common-dictionary.directive';
import { TuiSheetDialog, TuiSheetDialogOptions } from '@taiga-ui/addon-mobile';
import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TuiFilterPipe } from '@taiga-ui/cdk';
import { GroupByRowPipe } from './group-by-row.pipe';
import { PortraitUrlPipe } from './portrait-url.pipe';

@Component({
  selector: 'app-dialog-asset-single',
  imports: [
    NgStyle,
    AsyncPipe,
    KeyValuePipe,
    FormsModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    TranslateModule,

    TuiScrollable,
    TuiHint,
    TuiIcon,
    TuiScrollbar,
    TuiBlockStatus,
    TuiSheetDialog,
    TuiFilterPipe,
    TuiTextfield,

    CommonDictionaryDirective,
    GroupByRowPipe,
    PortraitUrlPipe,
  ],
  templateUrl: './dialog-asset-single.component.html',
  styleUrl: './dialog-asset-single.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogAssetSingleComponent implements OnChanges {
  @Input() data!: IDialogAsset[];
  @Input() dialogAsset!: IDialogAsset;
  @Input() item!: IDialog;

  protected portraitSearch: string = '';
  protected currentSelectedItem?: IDialog;
  protected open = false;
  protected readonly options: Partial<TuiSheetDialogOptions> = {
    fullscreen: false,
  };

  protected triggerChange$ = signal(1);
  protected focus: WritableSignal<boolean> = signal(false);
  protected otherText$!: Observable<any>;
  protected showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    protected readonly portraitsService: PortraitsService,
    @Inject(DialogAssetService) public readonly dAS: DialogAssetService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.item.currentValue) {
      this.item[TriggerChange] = this.triggerChange$;

      this.otherText$ = this.dAS.onGetOtherOriginalText(
        this.data[this.dAS.activeItemIndex].Number,
        changes.item.currentValue.ID
      );
    }
  }

  protected onTextChange(dialogAsset: IDialogAsset) {
    this.dAS.onTextChange(dialogAsset);
  }

  protected onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    this.dAS.onSpeakerNameChange(name, data);
  }

  protected onChangeIconName(name: string) {
    if (this.currentSelectedItem) this.currentSelectedItem.IconName = name.split('.png')[0];
    this.toggle();
  }

  protected onTooltipCheck(scrollTooltip?: TuiScrollbar) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['offsetHeight'] < scrollTooltip['el']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

  protected toggleItem(item: IDialog) {
    this.portraitSearch = item.IconName.split('_')[0];
    this.currentSelectedItem = item;
    this.open = !this.open;
  }

  protected toggle() {
    this.open = !this.open;
  }

  protected readonly matcher = (item: KeyValue<string, string>, search: string): boolean =>
    item.key.includes(search.toLowerCase());
}
