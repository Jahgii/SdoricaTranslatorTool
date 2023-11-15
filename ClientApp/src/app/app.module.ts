import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiModeModule, TuiSvgModule, TuiThemeNightModule, TuiLoaderModule, TuiScrollbarModule, TuiTextfieldControllerModule, TuiDataListModule, TuiTooltipModule, TuiHintModule, TuiGroupModule, TuiDropdownModule, TuiHostedDropdownModule, TuiExpandModule, TuiLinkModule } from "@taiga-ui/core";
import { TuiAvatarModule, TuiBadgeModule, TuiCheckboxBlockModule, TuiCheckboxModule, TuiComboBoxModule, TuiDataListWrapperModule, TuiFilterByInputPipeModule, TuiFilterModule, TuiInputFilesModule, TuiInputInlineModule, TuiInputModule, TuiInputNumberModule, TuiIslandModule, TuiMarkerIconModule, TuiProgressModule, TuiRadioBlockModule, TuiSelectModule, TuiStepperModule, TuiTabsModule, TuiTextareaModule, TuiTilesModule, TuiToggleModule } from '@taiga-ui/kit';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiTableFiltersModule, TuiTableModule } from "@taiga-ui/addon-table";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { TuiAppBarModule, TuiSidebarModule } from "@taiga-ui/addon-mobile";
import { TuiActiveZoneModule, TuiAutoFocusModule, TuiLetModule } from "@taiga-ui/cdk";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { TUI_LANGUAGE, TUI_ENGLISH_LANGUAGE } from '@taiga-ui/i18n';
import { TuiLanguageName } from '@taiga-ui/i18n/interfaces';
import { tuiLanguageSwitcher } from '@taiga-ui/i18n/switch';

import { SocialLoginModule, SocialAuthServiceConfig, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';

import { AppComponent } from './app.component';
import { HomeComponent } from "./components/home/home.component";
import { NavMenuComponent } from "./components/nav-menu/nav-menu.component";
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { LoadFileInputComponent } from './components/load-file-input/load-file-input.component';
import { LoadFileWizardUploadingComponent } from './components/load-file-wizard-uploading/load-file-wizard-uploading.component';
import { LoadFileWizardGroupsComponent } from './components/load-file-wizard-groups/load-file-wizard-groups.component';
import { GroupsComponent } from './components/groups/groups.component';
import { DialogAssetsComponent } from './components/dialog-assets/dialog-assets.component';
import { LoadFileLocalizationComponent } from './components/load-file-localization/load-file-localization.component';
import { LocalizationComponent } from './components/localization/localization.component';
import { MainGroupsComponent } from './components/main-groups/main-groups.component';
import { ExportTranslationComponent } from './components/export-translation/export-translation.component';
import { LoadObbFileExportComponent } from './components/load-obb-file-export/load-obb-file-export.component';
import { DraggableElementDirective } from './core/directives/draggable-element.directive';
import { LocalizationKeyComponent } from './components/localization-key/localization-key.component';
import { LoadFileGamedataComponent } from './components/load-file-gamedata/load-file-gamedata.component';
import { GamedataValuesComponent } from './components/gamedata-values/gamedata-values.component';
import { CommonDictionaryDirective } from './core/directives/common-dictionary.directive';
import { ThemeDarkComponent } from './components/theme-dark/theme-dark.component';
import { CommonWordsComponent } from './components/common-words/common-words.component';
import { of } from "rxjs";
import { LoginComponent } from "./components/login/login.component";
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { ExportTranslationGuestComponent } from './components/export-translation-guest/export-translation-guest.component';
import { JwtModule } from "@auth0/angular-jwt";
import { environment } from "src/environments/environment";
import { LocalizationTableComponent } from './components/localization/localization-table/localization-table.component';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


