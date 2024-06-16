import { Type } from "@angular/core"
import { LocalizationComponent } from "../localization/localization.component";
import { DialogMainComponent } from "../dialog-assets/dialog-main/dialog-main.component";
import { ExportTranslationGuestComponent } from "../export/export-main/export-main.component";
import { LoginComponent } from "../components/login/login.component";
import { ImportMainComponent } from "../import/import-main/import-main.component";
import { WizardInitialComponent } from "../components/wizard-initial/wizard-initial.component";
import { AppLoadingComponent } from "../components/app-loading/app-loading.component";

export interface Viewers { [component: string]: Type<any> };

export var viewers: Viewers = {
    login: LoginComponent,
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: ImportMainComponent,
    export: ExportTranslationGuestComponent,
    wizard: WizardInitialComponent,
    loading: AppLoadingComponent
};

export enum AppViews {
    login = "login",
    localization = "localization",
    dialogs = "dialogs",
    import = "import",
    export = "export",
    wizard = 'wizard',
    loading = 'loading'
}