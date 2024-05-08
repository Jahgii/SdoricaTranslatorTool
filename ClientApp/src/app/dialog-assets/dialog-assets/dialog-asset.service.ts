import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { IDialogAsset, IDialogAssetExport } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { TuiAlertService } from '@taiga-ui/core';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';

@Injectable()
export class DialogAssetService {
  private subsLanguage!: Subscription;
  private subsChanges!: Subscription;

  public translatedChange = new BehaviorSubject<{ node: any, translated: boolean } | undefined>(undefined);

  public mainGroup: string = "";
  public group: string = "";
  public node!: IGroup;

  public propagateTranslation: boolean = true;
  public previousPropagationValue: string = "";

  public otherText$!: Observable<any>;
  public tempId!: string;
  public tempNumber!: number;

  public dialogAssets$!: Observable<IDialogAsset[]>;
  public dialogAssetsChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public activeItemIndex: number = 0;
  public changes$: BehaviorSubject<IDialogAsset | undefined> = new BehaviorSubject<IDialogAsset | undefined>(undefined);
  public pendingChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(
    private api: ApiService,
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) { }

  public onDestroy() {
    if (this.subsLanguage) this.subsChanges.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();
  }

  public onSelectGroup(node: IGroup) {
    if (this.subsLanguage) this.subsChanges.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();

    if (this.mainGroup == node.MainGroup && this.group == node.OriginalName) return;

    this.mainGroup = node.MainGroup;
    this.group = node.OriginalName;
    this.node = node;
    this.activeItemIndex = 0;

    this.subsLanguage = this.languageOrigin.language$
      .subscribe((lang: string) => {
        this.dialogAssets$ = this.api
          .getWithHeaders('dialogassets', {
            language: lang,
            mainGroup: this.mainGroup,
            group: this.group
          });

        this.dialogAssetsChange$.next(true);
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

    // this.ref.markForCheck();
  }

  public onGetOtherOriginalText(number: number, id: string) {
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

  public onTextChange(dialogAsset: IDialogAsset) {
    this.pendingChanges$.next(true);
    this.changes$.next(dialogAsset);
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

  public onTranslatedChange(data: IDialogAsset[], translated: boolean) {
    this.translatedChange.next({ node: this.node, translated: translated });

    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
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
