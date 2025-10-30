import { TuiBlockStatus } from "@taiga-ui/layout";
import { TuiTextfieldControllerModule, TuiComboBoxModule, TuiInputModule } from "@taiga-ui/legacy";
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { TuiDataList, TuiDropdown, TuiButton, TuiHint } from '@taiga-ui/core';
import { firstValueFrom } from 'rxjs';
import { ILocalizationCategory, ILocalizationKey } from 'src/app/core/interfaces/i-localizations';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';
import { LocalizationService } from 'src/app/core/services/localization.service';
import { TranslateModule } from '@ngx-translate/core';
import { LocalizationTableComponent } from './localization-table/localization-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButtonLoading, TuiDataListWrapper, TuiFilterByInputPipe } from '@taiga-ui/kit';
import { AsyncPipe } from '@angular/common';
import { LocalStorageService } from "../core/services/local-storage.service";
import { AppModes } from "../core/enums/app-modes";
import { LanguageType } from "../core/enums/languages";
import { IndexDBService } from "../core/services/index-db.service";
import { IGroup, IMainGroup } from "../core/interfaces/i-dialog-group";
import { ObjectStoreNames } from "../core/interfaces/i-indexed-db";
import { IDialogAsset } from "../core/interfaces/i-dialog-asset";

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LocalizationService
  ],
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TuiComboBoxModule,
    TuiTextfieldControllerModule,
    TuiDataList,
    TuiDataListWrapper,
    TuiDropdown,
    TuiButton,
    TuiButtonLoading,
    TuiInputModule,
    TuiHint,
    TuiBlockStatus,
    TuiFilterByInputPipe,
    LocalizationTableComponent
  ]
})
export class LocalizationComponent implements OnInit {
  viewIndex: number = -1;

  protected reset$ = signal(false);

  constructor(
    private readonly api: ApiService,
    private readonly lStorage: LocalStorageService,
    private readonly indexedDB: IndexDBService,
    public readonly languageOrigin: LanguageOriginService,
    public readonly libreTranslate: LibreTranslateService,
    public readonly localization: LocalizationService,
  ) {
  }

  ngOnInit(): void {
    this.localization.viewIndex = this.viewIndex;
    this.localization.loadStore();
  }

  public async onResetCategories() {
    this.reset$.set(true);
    if (this.lStorage.getAppMode() === AppModes.Online) {
      await firstValueFrom(this.api.post('localizationcategories/reset', {}));
    }
    else if (this.lStorage.getAppMode() === AppModes.Offline) {
      await this.onResetCategoriesOffline();
    }

    let langReverse = this.lStorage.getDefaultLang();
    this.languageOrigin.language.patchValue(langReverse);
    this.reset$.set(false);
  }

  private async onResetCategoriesOffline() {
    let langReverse = this.lStorage.getDefaultLang();
    let lang = (LanguageType as any)[langReverse];

    let mainGroupFecth = this.indexedDB.getIndex<IMainGroup[]>(ObjectStoreNames.MainGroup, "Language", langReverse);
    let mgs = await firstValueFrom(mainGroupFecth.success$);

    for (const mg of mgs) {
      let groupFetch = this.indexedDB.getIndex<IGroup[]>(ObjectStoreNames.Group, "MainGroup", [langReverse, mg.OriginalName]);
      let groups = await firstValueFrom(groupFetch.success$);
      let dAtranslatedFiles = 0;

      for (const group of groups) {
        let dasFetch = this.indexedDB.getIndex<IDialogAsset[]>(ObjectStoreNames.DialogAsset, "Group", [langReverse, mg.OriginalName, group.OriginalName]);
        let das = await firstValueFrom(dasFetch.success$);
        let groupTranslatedFiles = 0;

        groupTranslatedFiles += das.filter(e => e.Translated).length;

        group.TranslatedFiles = groupTranslatedFiles;
        await firstValueFrom(this.indexedDB.put(ObjectStoreNames.Group, group).success$);
        dAtranslatedFiles += groupTranslatedFiles;
      }

      mg.TranslatedFiles = dAtranslatedFiles;
      await firstValueFrom(this.indexedDB.put(ObjectStoreNames.MainGroup, mg).success$);
    }

    let categoriesFetch = this.indexedDB.getAll<ILocalizationCategory[]>(ObjectStoreNames.LocalizationCategory);
    let categories = await firstValueFrom(categoriesFetch.success$);

    for (const category of categories) {
      let keyFetch = this.indexedDB.getIndex<ILocalizationKey[]>(ObjectStoreNames.LocalizationKey, "Category", category.Name);
      let keys = await firstValueFrom(keyFetch.success$);

      category.Keys[lang] = keys.length;
      category.KeysTranslated[lang] = keys.filter(e => e.Translated[lang]).length;

      await firstValueFrom(this.indexedDB.put(ObjectStoreNames.LocalizationCategory, category).success$);
    }
  }

  readonly stringify = (item: ILocalizationCategory): string =>
    `${item.Name} [${item.KeysTranslated[this.languageOrigin.localizationLang]}/${item.Keys[this.languageOrigin.localizationLang]}]`;

}
