import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiModeModule, TuiSvgModule, TuiThemeNightModule, TuiLoaderModule, TuiScrollbarModule, TuiTextfieldControllerModule, TuiDataListModule, TuiTooltipModule, TuiHintModule, TuiGroupModule, TuiDropdownModule } from "@taiga-ui/core";
import { TuiBadgeModule, TuiCheckboxBlockModule, TuiCheckboxModule, TuiDataListWrapperModule, TuiFilterModule, TuiInputFilesModule, TuiInputInlineModule, TuiInputModule, TuiIslandModule, TuiMarkerIconModule, TuiProgressModule, TuiSelectModule, TuiStepperModule, TuiTabsModule, TuiTextAreaModule, TuiTilesModule, TuiToggleModule } from '@taiga-ui/kit';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiTableFiltersModule, TuiTableModule } from "@taiga-ui/addon-table";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";

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
import { TuiSidebarModule } from "@taiga-ui/addon-mobile";
import { TuiActiveZoneModule, TuiLetModule } from "@taiga-ui/cdk";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    LoadFileWizardComponent,
    LoadFileInputComponent,
    LoadFileWizardUploadingComponent,
    LoadFileWizardGroupsComponent,
    GroupsComponent,
    DialogAssetsComponent,
    LoadFileLocalizationComponent,
    LocalizationComponent,
    MainGroupsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    TuiThemeNightModule,
    TuiModeModule,
    TuiButtonModule,
    TuiSvgModule,
    TuiInputFilesModule,
    TuiStepperModule,
    TuiIslandModule,
    TuiMarkerIconModule,
    TuiProgressModule,
    TuiBlockStatusModule,
    TuiCheckboxBlockModule,
    TuiCheckboxModule,
    TuiLoaderModule,
    TuiScrollbarModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTableModule,
    TuiTableFiltersModule,
    TuiFilterModule,
    ScrollingModule,
    TuiTilesModule,
    TuiSelectModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
    TuiTabsModule,
    TuiTooltipModule,
    TuiHintModule,
    TuiTextAreaModule,
    TuiGroupModule,
    TuiToggleModule,
    TuiInputInlineModule,
    TuiDropdownModule,
    TuiSidebarModule,
    TuiActiveZoneModule,
    TuiLetModule,
    TuiBadgeModule,
  ],
  providers: [{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer }],
  bootstrap: [AppComponent]
})
export class AppModule { }
