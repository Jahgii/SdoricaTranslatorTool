import { Type } from "@angular/core"
import { LocalizationComponent } from "../localization/localization.component";
import { DialogMainComponent } from "../dialog-assets/dialog-main/dialog-main.component";
import { ExportTranslationGuestComponent } from "../export/export-main/export-main.component";
import { LoginComponent } from "../components/login/login.component";
import { ImportMainComponent } from "../import/import-main/import-main.component";

export interface Viewers { [component: string]: Type<any> };

export var viewers: Viewers = {
    login: LoginComponent,
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: ImportMainComponent,
    export: ExportTranslationGuestComponent
};