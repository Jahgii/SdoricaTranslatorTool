import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiBreakpointService, TuiScrollbarModule } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IDialogAsset, IDialogAssetExport } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
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
import { NgIf, NgFor, NgStyle, AsyncPipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
  standalone: true,
  imports: [
    NgIf,
    TuiTabsModule,
    NgFor,
    TuiItemModule,
    TuiSvgModule,
    TuiToggleModule,
    FormsModule,
    TuiTooltipModule,
    TuiButtonModule,
    TuiHintModule,
    TuiLoaderModule,
    TuiScrollbarModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    TuiTableModule,
    CdkVirtualForOf,
    TuiDropdownModule,
    NgStyle,
    TuiBlockStatusModule,
    AsyncPipe,
    KeyValuePipe,
    TranslateModule,
  ],
})
export class DialogAssetsComponent implements OnInit, OnDestroy {
  readonly filterForm = new FormGroup({
    originalText: new FormControl(undefined),
  });

  readonly filterOriginalColumn = (text: string, value: string): boolean => {
    if (!value) value = "";
    return text.toLowerCase().includes(value.toLowerCase());
  };

  public pendingChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public changes$: BehaviorSubject<IDialogAsset | undefined> = new BehaviorSubject<IDialogAsset | undefined>(undefined);
  private subsChanges!: Subscription;
  public openOption: boolean = false;
  public propagateTranslation: boolean = true;
  public previousPropagationValue: string = "";
  public activeItemIndex: number = 0;
  public dialogAssets$!: Observable<IDialogAsset[]>;
  private subsLanguage!: Subscription;
  public otherText$!: Observable<any>;
  public tempId!: string;
  public tempNumber!: number;
  public mainGroup: string = "";
  public group: string = "";

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

  ngOnInit(): void {
  }

  public onSelectGroup(mainGroup: string, group: string) {
    if (this.subsLanguage) this.subsChanges.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();

    this.mainGroup = mainGroup;
    this.group = group;

    this.subsLanguage = this.languageOrigin.language$
      .subscribe((lang: string) => {
        this.dialogAssets$ = this.api.getWithHeaders('dialogassets', { language: lang, mainGroup: this.mainGroup, group: this.group });
      });

    this.subsChanges = this.changes$
      .pipe(debounceTime(1000))
      .subscribe(async dialogAsset => {
        if (!dialogAsset) return;
        await firstValueFrom(this.api.put('dialogassets', dialogAsset))
          .then(
            r => {

            },
            error => { console.log("CANT SAVE DATA"); }
          );
        this.pendingChanges$.next(false);
      });
  }

  ngOnDestroy(): void {
    if (this.subsLanguage) this.subsLanguage.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();
  }

  onGetOtherOriginalText(number: number, id: string) {
    if (this.tempId == id && this.tempNumber == number) return;

    this.tempNumber = number;
    this.tempId = id;

    this.otherText$ = this.api.getWithHeaders('dialogassets/searchothers', {
      language: this.languageOrigin.language.value,
      mainGroup: this.mainGroup,
      group: this.group,
      number: number,
      id: id
    });
  }

  public onTranslatedChange(data: IDialogAsset[]) {
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    if (this.propagateTranslation)
      data[this.activeItemIndex].Model.$content.forEach(e => {
        if (e.SpeakerName == this.previousPropagationValue) e.SpeakerName = name;
      });
    this.previousPropagationValue = name;
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.pendingChanges$.next(true);
    this.changes$.next(dialogAsset);
  }

  public async onMachineTranslate(data: IDialogAsset[]) {
    await this.libreTranslate.onTranslateDialogs(data[this.activeItemIndex].Model.$content);
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onDownload(dialogAsset: IDialogAsset) {
    var dialog = JSON.parse(JSON.stringify(dialogAsset)) as IDialogAssetExport;
    var dialogFileName = dialog.OriginalFilename;

    delete (dialog.Id);
    delete (dialog.OriginalFilename);
    delete (dialog.Filename);
    delete (dialog.MainGroup);
    delete (dialog.Group);
    delete (dialog.Number);
    delete (dialog.Language);
    delete (dialog.Translated);

    (dialog.Model.$content as any[]).forEach(e => delete (e.OriginalText));

    var exportDialog = JSON.stringify(dialog);

    const blob = new Blob([exportDialog], {
      type: 'dialog'
    });

    const url = window.URL.createObjectURL(blob)

    this.downloadURL(url, dialogFileName ?? "RENAME THE FILE TO CORRECT DIALOG NAME FILE");
  }

  private downloadURL = (data: any, fileName: string) => {
    const a = document.createElement('a');
    a.href = data;
    a.download = fileName;
    a.type = '';
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
  }

}
