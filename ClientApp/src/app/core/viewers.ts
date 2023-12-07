import { Type } from "@angular/core"
import { LocalizationComponent } from "../localization/localization.component";
import { DialogMainComponent } from "../dialog-assets/dialog-main/dialog-main.component";
import { LoadFileWizardComponent } from "../components/load-file-wizard/load-file-wizard.component";
import { ExportTranslationGuestComponent } from "../export/export-main/export-main.component";

export interface Viewers { [component: string]: Type<any> };

export var viewers: Viewers = {
    localization: LocalizationComponent,
    dialogs: DialogMainComponent,
    import: LoadFileWizardComponent,
    // import: ImportMainComponent,
    export: ExportTranslationGuestComponent
};