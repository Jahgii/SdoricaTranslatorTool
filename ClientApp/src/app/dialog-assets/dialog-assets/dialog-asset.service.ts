import { Inject, Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of } from 'rxjs';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { IDialog, IDialogAsset, IDialogAssetExport, TriggerChange } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { TuiAlertService } from '@taiga-ui/core';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AppModes } from 'src/app/core/enums/app-modes';
import { Indexes, ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { TranslateService } from '@ngx-translate/core';
import { GeminiApiService } from 'src/app/core/services/gemini-api.service';
import { AlertService } from 'src/app/core/services/alert.service';

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
    private readonly alert: AlertService,
    public readonly gemini: GeminiApiService,
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
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
          let r = this.indexedDB.getIndex<IDialogAsset[], ObjectStoreNames.DialogAsset>(
            ObjectStoreNames.DialogAsset,
            Indexes.DialogAsset.Group,
            [lang, this.mainGroup, this.group]
          );
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
      let r = this.indexedDB.getIndex<IDialogAsset[], ObjectStoreNames.DialogAsset>(
        ObjectStoreNames.DialogAsset,
        Indexes.DialogAsset.Content,
        [this.mainGroup, this.group, number]
      );
      langs$ = r.success$.pipe(
        map(dialogs => {
          let languageText: any = {};
          let index = dialogs.find(e => e.Language == this.languageOrigin.language.value)
            ?.Model
            .$content
            .findIndex(e => e.ID == id) ?? -1;

          if (index === -1) return languageText;

          for (const r of dialogs) {
            let originalText = r.Model.$content[index].OriginalText ?? "";
            languageText[r.Language] = originalText;
          }

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

    langs$ ??= of({});

    return langs$;
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.pendingChanges$.next(true);
    this.changes$.next(dialogAsset);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    if (this.propagateTranslation)
      for (const e of data[this.activeItemIndex].Model.$content)
        if (e.SpeakerName == this.previousPropagationValue) {
          e.SpeakerName = name;
          e[TriggerChange]?.set(e[TriggerChange]() + 1);
        }

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
    const dialog = data[this.activeItemIndex];
    const content = this.onCreateSimpleConversation(dialog);
    const response = await this.gemini.get(content);
    const conversation: { [dialogID: string]: string } = this.tryParseJson(response);

    if (!conversation) {
      this.alert.showAlert(
        'alert-error',
        'invalid-gemini-response',
        'accent',
        'triangle-alert'
      );

      return;
    }

    for (const d of dialog.Model.$content) {
      if (!conversation[d.ID]) continue;
      d.Text = conversation[d.ID];
      d[TriggerChange]?.set(d[TriggerChange]() + 1);
    }

    this.pendingChanges$.next(true);
    this.changes$.next(dialog);
  }

  public async onGeminiTranslateFromOriginLang(lang: string, data: IDialogAsset[]) {
    const dialog = data[this.activeItemIndex];
    const dialogCopy = structuredClone(dialog);
    let request;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      request = this.indexedDB.getIndex<IDialogAsset, ObjectStoreNames.DialogAsset>(
        ObjectStoreNames.DialogAsset,
        Indexes.DialogAsset.Dialog,
        [lang, this.mainGroup, this.group, dialog.Number],
        true
      ).success$;
    }
    else {
      request = this.api.getWithHeaders<IDialogAsset>('dialogAssets/searchlang', {
        language: lang,
        mainGroup: this.mainGroup,
        group: this.group,
        number: dialog.Number
      });
    }

    firstValueFrom(request).then(async dialogsFrom => {
      if (!dialogsFrom) {
        this.pendingChanges$.next(true);
        this.changes$.next(dialog);
        return;
      }

      let index = 0;
      for (const dialogFrom of dialogsFrom.Model.$content) {
        if (dialogCopy.Model.$content.length > index)
          dialogCopy.Model.$content[index].OriginalText = dialogFrom.OriginalText;

        index++;
      }

      const content = this.onCreateSimpleConversation(dialogCopy);
      const response = await this.gemini.get(content);
      const conversation: { [dialogID: string]: string } = this.tryParseJson(response);

      if (!conversation) {
        this.alert.showAlert(
          'alert-error',
          'invalid-gemini-response',
          'accent',
          'triangle-alert'
        );

        return;
      }

      for (const d of dialog.Model.$content) {
        if (!conversation[d.ID]) continue;
        d.Text = conversation[d.ID];
        d[TriggerChange]?.set(d[TriggerChange]() + 1);
      }

      this.pendingChanges$.next(true);
      this.changes$.next(dialog);

    });

  }

  public onCopySimpleConversation(dialogAsset: IDialogAsset) {
    let exportConversation = this.onCreateSimpleConversation(dialogAsset);

    navigator
      .clipboard
      .writeText(exportConversation)
      .then(_ => {
        this.alert.showAlert(
          'alert-success',
          'copy-to-clipboard',
          'positive',
          'circle-check-big'
        );
      }, err => {
        this.alert.showAlert(
          'alert-error',
          'copy-to-clipboard-error',
          'accent',
          'triangle-alert'
        );
      });
  }

  private onCreateSimpleConversation(dialogAsset: IDialogAsset) {
    let conversation: { [dialogID: string]: string } = {};

    for (const d of dialogAsset.Model.$content)
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
          this.alert.showAlert(
            'alert-error',
            'invalid-json',
            'accent',
            'triangle-alert'
          );

          return;
        }

        for (const element of dialogAsset.Model.$content) {
          let d = element;
          if (!conversation[d.ID]) continue;
          d.Text = conversation[d.ID];
        }

        this.alert.showAlert(
          'alert-success',
          'paste-correctly',
          'positive',
          'circle-check-big'
        );

        return true;
      }, _ => {
        this.alert.showAlert(
          'alert-error',
          'paste-clipboard-error',
          'accent',
          'triangle-alert'
        );

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
    let dialog = structuredClone(dialogAsset) as IDialogAssetExport;
    let dialogFileName = dialog.OriginalFilename;

    delete (dialog.Id);
    delete (dialog.OriginalFilename);
    delete (dialog.Filename);
    delete (dialog.MainGroup);
    delete (dialog.Group);
    delete (dialog.Number);
    delete (dialog.Language);
    delete (dialog.Translated);

    for (const e of dialog.Model.$content) {
      delete (e.OriginalSpeakerName);
      delete (e.OriginalIconName);
      delete (e.OriginalText);
    }

    let exportDialog = JSON.stringify(dialog);

    const blob = new Blob([exportDialog], {
      type: 'dialog'
    });

    const url = globalThis.URL.createObjectURL(blob)

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
