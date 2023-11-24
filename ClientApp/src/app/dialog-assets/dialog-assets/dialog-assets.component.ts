import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiScrollbarModule } from '@taiga-ui/core';
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

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,

    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,

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
export class DialogAssetsComponent implements OnInit, OnDestroy {
  public openOption: boolean = false;

  constructor(
    private ref: ChangeDetectorRef,
    @Inject(DialogAssetService) readonly dAS: DialogAssetService,
    @Inject(ElementBreakpointService) readonly breakpointService: ElementBreakpointService
  ) { }

  ngOnInit(): void {
  }

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
    this.onTextChange(dialogAsset);
  }

  public async onMachineTranslate(data: IDialogAsset[]) {
    this.dAS.onMachineTranslate(data);
  }

  public onDownload(dialogAsset: IDialogAsset) {
    this.dAS.onDownload(dialogAsset);
  }

}
