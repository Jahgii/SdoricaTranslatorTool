import { Type } from "@angular/core"
import { LocalizationComponent } from "../localization/localization.component";
import { DialogMainComponent } from "../dialog-assets/dialog-main/dialog-main.component";
import { ExportTranslationGuestComponent } from "../export/export-main/export-main.component";
import { ImportMainComponent } from "../import/import-main/import-main.component";
import { WizardInitialComponent } from "../components/wizard-initial/wizard-initial.component";
import { AppLoadingComponent } from "../components/app-loading/app-loading.component";
import { LoginComponent } from "../components/login/login.component";
import { ImportAllComponent } from "../import/import-all/import-all.component";

export interface Viewers { [component: string]: Type<any> };

export const viewers: Viewers = {
    login: LoginComponent,
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: ImportMainComponent,
    importall: ImportAllComponent,
    export: ExportTranslationGuestComponent,
    wizard: WizardInitialComponent,
    loading: AppLoadingComponent
};

export enum AppViews {
    login = "login",
    localization = "localization",
    dialogs = "dialogs",
    import = "import",
    importall = "importall",
    export = "export",
    wizard = 'wizard',
    loading = 'loading'
}