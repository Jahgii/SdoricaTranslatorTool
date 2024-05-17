import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiScrollbarComponent, TuiScrollbarModule } from '@taiga-ui/core';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { TranslateModule } from '@ngx-translate/core';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiDropdownModule } from '@taiga-ui/core/directives/dropdown';
import { TuiTableModule } from '@taiga-ui/addon-table';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { TuiHintModule } from '@taiga-ui/core/directives/hint';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiTooltipModule } from '@taiga-ui/core/components/tooltip';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiItemModule } from '@taiga-ui/cdk';
import { TuiTabsModule, TuiToggleModule } from '@taiga-ui/kit';
import { CommonModule } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';
import { DialogAssetService } from './dialog-asset.service';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { BehaviorSubject } from 'rxjs';
import { CommonDictionaryDirective } from 'src/app/core/directives/common-dictionary.directive';

@Component({
  selector: 'app-dialog-assets',
  standalone: true,
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

    CommonDictionaryDirective,

    TuiTabsModule,
    TuiItemModule,
    TuiSvgModule,
    TuiToggleModule,
    TuiTooltipModule,
    TuiButtonModule,
    TuiHintModule,
    TuiLoaderModule,
    TuiScrollbarModule,
    TuiTableModule,
    TuiDropdownModule,
    TuiBlockStatusModule,
  ],
  providers: [
    DialogAssetService,
    ElementBreakpointService
  ]
})
export class DialogAssetsComponent implements OnDestroy {
  public showTooltipArrow$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public openOption: boolean = false;
  public focusRow: string = "";

  constructor(
    private ref: ChangeDetectorRef,
    @Inject(DialogAssetService) readonly dAS: DialogAssetService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  ngOnDestroy(): void {
    this.dAS.onDestroy();
  }

  public onSelectGroup(node: IGroup) {
    this.dAS.onSelectGroup(node);
    this.ref.markForCheck();
  }

  public onGetOtherOriginalText(number: number, id: string) {
    this.dAS.onGetOtherOriginalText(number, id);
  }

  public onTranslatedChange(data: IDialogAsset[], translated: boolean) {
    this.dAS.onTranslatedChange(data, translated);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    this.dAS.onSpeakerNameChange(name, data);
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.dAS.onTextChange(dialogAsset);
  }

  public async onMachineTranslate(data: IDialogAsset[]) {
    this.dAS.onMachineTranslate(data);
  }

  public onDownload(dialogAsset: IDialogAsset) {
    this.dAS.onDownload(dialogAsset);
  }

  public onTooltipCheck(scrollTooltip?: TuiScrollbarComponent) {
    let show = false;
    if (scrollTooltip)
      show = scrollTooltip['el']['nativeElement']['offsetHeight'] < scrollTooltip['el']['nativeElement']['scrollHeight'];

    this.showTooltipArrow$.next(show);
  }

}
