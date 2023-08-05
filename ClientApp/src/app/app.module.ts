import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER, TuiButtonModule, TuiModeModule, TuiSvgModule, TuiThemeNightModule, TuiLoaderModule, TuiScrollbarModule, TuiTextfieldControllerModule, TuiDataListModule } from "@taiga-ui/core";
import { TuiCheckboxBlockModule, TuiDataListWrapperModule, TuiInputFilesModule, TuiInputModule, TuiIslandModule, TuiMarkerIconModule, TuiProgressModule, TuiSelectModule, TuiStepperModule, TuiTilesModule } from '@taiga-ui/kit';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiTableModule } from "@taiga-ui/addon-table";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from './app.component';
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from "./components/home/home.component";
import { NavMenuComponent } from "./components/nav-menu/nav-menu.component";
import { HttpClientModule } from "@angular/common/http";
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { LoadFileInputComponent } from './components/load-file-input/load-file-input.component';
import { LoadFileWizardUploadingComponent } from './components/load-file-wizard-uploading/load-file-wizard-uploading.component';
import { LoadFileWizardGroupsComponent } from './components/load-file-wizard-groups/load-file-wizard-groups.component';
import { GroupsComponent } from './components/groups/groups.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    LoadFileWizardComponent,
    LoadFileInputComponent,
    LoadFileWizardUploadingComponent,
    LoadFileWizardGroupsComponent,
    GroupsComponent
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
    TuiLoaderModule,
    TuiScrollbarModule,
    TuiInputModule,
    TuiTextfieldControllerModule,
    TuiTableModule,
    ScrollingModule,
    TuiTilesModule,
    TuiSelectModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
  ],
  providers: [{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer }],
  bootstrap: [AppComponent]
})
export class AppModule { }
