import { TuiBlockStatus } from "@taiga-ui/layout";
import { TuiTable } from "@taiga-ui/addon-table";
import { TuiActiveZone, TuiItem } from "@taiga-ui/cdk";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiLoader, TuiDropdown, TuiIcon, TuiButton, TuiHint, TuiScrollable, TuiScrollbar, TuiDataList } from '@taiga-ui/core';
import { IDialog, IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { TranslateModule } from '@ngx-translate/core';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TuiDataListDropdownManager, TuiSwitch, TuiTabs } from '@taiga-ui/kit';
import { CommonModule } from '@angular/common';
import { ElementBreakpointService } from 'src/app/core/services/element-breakpoint.service';
import { DialogAssetService } from './dialog-asset.service';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { PortraitsService } from 'src/app/core/services/portraits.service';
import { DialogAssetSingleComponent } from "./dialog-asset-single/dialog-asset-single.component";
import { LanguageOriginService } from "src/app/core/services/language-origin.service";
import { TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { GeminiApiService } from "src/app/core/services/gemini-api.service";
import { GeminiIconDirective } from "src/app/core/directives/gemini-icon.directive";
import { AppStateService } from "src/app/core/services/app-state.service";

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DialogAssetService,
    GeminiApiService,
    ElementBreakpointService,
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    TuiScrollbar,
    TuiScrollable,
    TuiTabs,
    TuiItem,
    TuiIcon,
    TuiSwitch,
    TuiButton,
    TuiHint,
    TuiLoader,
    TuiTable,
    TuiDropdown,
    TuiBlockStatus,
    TuiActiveZone,
    TuiDataList,
    TuiTextfieldControllerModule,
    TuiDataListDropdownManager,

    DialogAssetSingleComponent,
    GeminiIconDirective,
  ],
})
export class DialogAssetsComponent implements OnDestroy {
  public openOption: boolean = false;
  public focusRow: string = "";

  constructor(
    protected readonly appState: AppStateService,
    protected readonly languageOrigin: LanguageOriginService,
    private readonly portraitsService: PortraitsService,
    private readonly ref: ChangeDetectorRef,
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

  public async onGeminiTranslate(data: IDialogAsset[]) {
    this.dAS.onGeminiTranslate(data);
  }

  public async onGeminiTranslateFromOriginLang(lang: string, data: IDialogAsset[]) {
    this.dAS.onGeminiTranslateFromOriginLang(lang, data);
  }

  public onCopyToClipboard(dialogAsset: IDialogAsset) {
    this.dAS.onCopySimpleConversation(dialogAsset);
  }

  public async onPasteClipboard(dialogAsset: IDialogAsset) {
    let updated = await this.dAS.onPasteSimpleConversation(dialogAsset)

    if (updated) this.onTextChange(dialogAsset);
  }

  public onDownload(dialogAsset: IDialogAsset) {
    this.dAS.onDownload(dialogAsset);
  }

  public onGetPortrait(name: string, ext: string = '.png') {
    return this.portraitsService.imageDir[name + ext];
  }

  public onActiveZone(active: boolean): void {
    this.openOption = active && this.openOption;
  }

  public trackByItemId(index: number, item: IDialog): string {
    return item.ID;
  }

}
