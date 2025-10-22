import { Inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of } from 'rxjs';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { IDialogAsset, IDialogAssetExport } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { TuiAlertService } from '@taiga-ui/core';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AppModes } from 'src/app/core/enums/app-modes';
import { ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { TranslateService } from '@ngx-translate/core';
import { GeminiApiService } from 'src/app/core/services/gemini-api.service';

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

  public dialogAssets$: WritableSignal<IDialogAsset[] | undefined> = signal(undefined);
  public dialogAssetsChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public activeItemIndex: number = 0;
  public changes$: BehaviorSubject<IDialogAsset | undefined> = new BehaviorSubject<IDialogAsset | undefined>(undefined);
  public pendingChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly api: ApiService,
    private readonly indexedDB: IndexDBService,
    private readonly lStorage: LocalStorageService,
    private readonly translate: TranslateService,
    public readonly gemini: GeminiApiService,
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    @Inject(TuiAlertService) private readonly alerts: TuiAlertService
  ) { }

  public onDestroy() {
    if (this.subsLanguage) this.subsChanges.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();
  }

  public onSelectGroup(node: IGroup) {
    this.dialogAssetsChange$.next(false);

    if (this.subsLanguage) this.subsChanges.unsubscribe();
    if (this.subsChanges) this.subsChanges.unsubscribe();

    if (this.mainGroup == node.MainGroup && this.group == node.OriginalName) return;

    this.mainGroup = node.MainGroup;
    this.group = node.OriginalName;
    this.node = node;
    this.activeItemIndex = 0;

    this.subsLanguage = this.languageOrigin.language$
      .subscribe((lang: string) => {
        let dialogs$: Observable<IDialogAsset[]> | Subject<IDialogAsset[]> | undefined;
        if (this.lStorage.getAppMode() === AppModes.Offline) {
          let r = this.indexedDB.getIndex<IDialogAsset[]>(ObjectStoreNames.DialogAsset, "Group", [lang, this.mainGroup, this.group]);
          dialogs$ = r.success$;
        }
        else if (this.lStorage.getAppMode() === AppModes.Online) {
          dialogs$ = this.api
            .getWithHeaders('dialogassets', {
              language: lang,
              mainGroup: this.mainGroup,
              group: this.group
            });
        }

        dialogs$ ??= of([]);
        firstValueFrom(dialogs$).then(d => {
          this.dialogAssets$.set(d);
          this.dialogAssetsChange$.next(true);
        })
      });

    this.subsChanges = this.changes$
      .pipe(debounceTime(1000))
      .subscribe(async dialogAsset => {
        if (!dialogAsset) return;

        let dialog$: Observable<IDialogAsset> | Subject<IDialogAsset> | undefined;

        if (this.lStorage.getAppMode() === AppModes.Offline) {
          let r = this.indexedDB.put<IDialogAsset>(ObjectStoreNames.DialogAsset, dialogAsset);
          dialog$ = r.success$;
        }
        else if (this.lStorage.getAppMode() === AppModes.Online) {
          dialog$ = this.api.put('dialogassets', dialogAsset);
        }

        if (dialog$ === undefined) return;

        await firstValueFrom(dialog$)
          .then(r => {

          }, error => {

          }
          );
        this.pendingChanges$.next(false);
      });
  }

  public onGetOtherOriginalText(number: number, id: string): Observable<any> {
    let langs$: Observable<any> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getIndex<IDialogAsset[]>(ObjectStoreNames.DialogAsset, "Content", [this.mainGroup, this.group, number]);
      langs$ = r.success$.pipe(
        map(dialogs => {
          let languageText: any = {};
          let index = dialogs.find(e => e.Language == this.languageOrigin.language.value)
            ?.Model
            .$content
            .findIndex(e => e.ID == id) ?? -1;

          if (index === -1) return languageText;

          dialogs.forEach(r => {
            let originalText = r.Model.$content[index].OriginalText ?? "";
            languageText[r.Language] = originalText;
          });

          return languageText;
        })
      );
    }
    else if (this.lStorage.getAppMode() === AppModes.Online) {
      langs$ = this.api.getWithHeaders('dialogassets/searchothers', {
        language: this.languageOrigin.language.value,
        mainGroup: this.mainGroup,
        group: this.group,
        number: number,
        id: id
      });
    }

    if (langs$ === undefined) langs$ = of({});

    return langs$;
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.pendingChanges$.next(true);
    this.changes$.next(dialogAsset);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    if (this.propagateTranslation)
      for (const e of data[this.activeItemIndex].Model.$content)
        if (e.SpeakerName == this.previousPropagationValue) e.SpeakerName = name;

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

  public async onGeminiTranslate(data: IDialogAsset[]) {
    const content = this.onCreateSimpleConversation(data[this.activeItemIndex]);
    const response = await this.gemini.get(content);
    const conversation: { [dialogID: string]: string } = this.tryParseJson(response);

    if (!conversation) {
      this.alerts
        .open(undefined, {
          label: this.translate.instant('invalid-gemini-response')
          , appearance: 'warning'
          , autoClose: 3000
        })
        .subscribe();

      return;
    }

    for (const element of data[this.activeItemIndex].Model.$content) {
      let d = element;
      if (!conversation[d.ID]) continue;
      d.Text = conversation[d.ID];
    }

    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onCopySimpleConversation(dialogAsset: IDialogAsset) {
    let exportConversation = this.onCreateSimpleConversation(dialogAsset);

    navigator
      .clipboard
      .writeText(exportConversation)
      .then(_ => {
        this.alerts
          .open(undefined, { label: this.translate.instant('copy-to-clipboard'), appearance: 'success', autoClose: 3_000 })
          .subscribe();
      }, err => {
        this.alerts
          .open(undefined, { label: this.translate.instant('copy-to-clipboard-error'), appearance: 'error', autoClose: 3_000 })
          .subscribe();
      });
  }

  private onCreateSimpleConversation(dialogAsset: IDialogAsset) {
    let dialog = structuredClone(dialogAsset);
    let conversation: { [dialogID: string]: string } = {};

    for (const d of dialog.Model.$content)
      conversation[d.ID] = d.OriginalText;

    return JSON.stringify(conversation);
  }

  public async onPasteSimpleConversation(dialogAsset: IDialogAsset) {
    return await navigator
      .clipboard
      .readText()
      .then(text => {
        let conversation: { [dialogID: string]: string } = this.tryParseJson(text);

        if (!conversation) {
          this.alerts
            .open(undefined, {
              label: this.translate.instant('invalid-json')
              , appearance: 'warning'
              , autoClose: 3000
            })
            .subscribe();

          return;
        }

        for (const element of dialogAsset.Model.$content) {
          let d = element;
          if (!conversation[d.ID]) continue;
          d.Text = conversation[d.ID];
        }

        this.alerts
          .open(undefined, { label: this.translate.instant('paste-correctly'), appearance: 'success', autoClose: 3000 })
          .subscribe();

        return true;
      }, _ => {
        this.alerts
          .open(undefined, { label: this.translate.instant('paste-clipboard-error'), appearance: 'error', autoClose: 3_000 })
          .subscribe();

        return false;
      });
  }

  private tryParseJson(text: string) {
    try {
      return JSON.parse(text)
    }
    catch {
      return undefined;
    }
  }

  public onDownload(dialogAsset: IDialogAsset) {
    let dialog = JSON.parse(JSON.stringify(dialogAsset)) as IDialogAssetExport;
    let dialogFileName = dialog.OriginalFilename;

    delete (dialog.Id);
    delete (dialog.OriginalFilename);
    delete (dialog.Filename);
    delete (dialog.MainGroup);
    delete (dialog.Group);
    delete (dialog.Number);
    delete (dialog.Language);
    delete (dialog.Translated);

    (dialog.Model.$content as any[]).forEach(e => delete (e.OriginalText));

    let exportDialog = JSON.stringify(dialog);

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