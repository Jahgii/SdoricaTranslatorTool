import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, firstValueFrom, map, of, tap } from 'rxjs';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { IDialogAsset, IDialogAssetExport, PlainDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { TuiAlertService } from '@taiga-ui/core';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { IndexDBService } from 'src/app/core/services/index-db.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { AppModes } from 'src/app/core/enums/app-modes';
import { ObjectStoreNames } from 'src/app/core/interfaces/i-indexed-db';
import { TranslateService } from '@ngx-translate/core';

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
    private indexedDB: IndexDBService,
    private lStorage: LocalStorageService,
    private translate: TranslateService,
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

        if (dialogs$ === undefined) dialogs$ = of([]);

        this.dialogAssets$ = dialogs$;

        this.dialogAssetsChange$.next(true);
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

  public onGetOtherOriginalText(number: number, id: string) {
    if (this.tempId == id && this.tempNumber == number) return;

    this.tempNumber = number;
    this.tempId = id;

    let langs$: Observable<any> | undefined;

    if (this.lStorage.getAppMode() === AppModes.Offline) {
      let r = this.indexedDB.getIndex<IDialogAsset[]>(ObjectStoreNames.DialogAsset, "Content", [this.mainGroup, this.group, number]);
      langs$ = r.success$
        .pipe(
          map(dialogs => {
            let languageText: any = {};
            let index = dialogs.find(e => e.Language == this.languageOrigin.language.value)?.Model.$content.findIndex(e => e.ID == id) ?? -1;
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

    if (langs$ === undefined) langs$ = of([]);

    this.otherText$ = langs$;
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

  public onCopySimpleConversation(dialogAsset: IDialogAsset) {
    let dialog = JSON.parse(JSON.stringify(dialogAsset)) as IDialogAssetExport;
    let conversation: PlainDialogAsset[] = [];

    dialog.Model.$content.forEach(d => {
      let message: PlainDialogAsset = {
        ID: d.ID,
        Text: d.OriginalText
      };

      conversation.push(message);
    });

    let exportConversation = JSON.stringify(conversation);

    navigator
      .clipboard
      .writeText(exportConversation)
      .then(_ => {
        this.alerts
          .open(undefined, { label: this.translate.instant('copy-to-clipboard'), status: 'success', autoClose: true })
          .subscribe();
      }, err => {
        this.alerts
          .open(undefined, { label: this.translate.instant('copy-to-clipboard-error'), status: 'error', autoClose: true })
          .subscribe();
      });
  }

  public async onPasteSimpleConversation(dialogAsset: IDialogAsset) {
    return await navigator
      .clipboard
      .readText()
      .then(text => {
        let conversation: PlainDialogAsset[] = this.tryParseJson(text);

        if (!conversation) {
          this.alerts
            .open(undefined, {
              label: this.translate.instant('invalid-json')
              , status: 'warning'
              , autoClose: true
            })
            .subscribe();

          return;
        }

        if (!Array.isArray(conversation) || conversation.length == 0) {
          this.alerts
            .open(undefined, {
              label: this.translate.instant('nothing-to-paste')
              , status: 'warning'
              , autoClose: true
            })
            .subscribe();

          return;
        };

        for (let i = 0; i < dialogAsset.Model.$content.length; i++) {
          let d = dialogAsset.Model.$content[i];
          let message = conversation.find(e => e.ID == d.ID);
          if (!message) continue;

          d.Text = message.Text;
        }

        this.alerts
          .open(undefined, { label: this.translate.instant('paste-correctly'), status: 'success', autoClose: true })
          .subscribe();

        return true;
      }, _ => {
        this.alerts
          .open(undefined, { label: this.translate.instant('copy-to-clipboard-error'), status: 'error', autoClose: true })
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