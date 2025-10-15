import { Type } from "@angular/core"

export interface Viewers { [component: string]: Promise<Type<any>> };

export const viewers: Viewers = {
    login: import('../components/login/login.component').then(({ LoginComponent }) => LoginComponent),
    localization: import('../localization/localization.component').then(({ LocalizationComponent }) => LocalizationComponent),
    dialogs: import('../dialog-assets/dialog-main/dialog-main.component').then(({ DialogMainComponent }) => DialogMainComponent),
    import: import('../import/import-main/import-main.component').then(({ ImportMainComponent }) => ImportMainComponent),
    importall: import('../import/import-all/import-all.component').then(({ ImportAllComponent }) => ImportAllComponent),
    export: import('../export/export-main/export-main.component').then(({ ExportTranslationGuestComponent }) => ExportTranslationGuestComponent),
    wizard: import('../components/wizard-initial/wizard-initial.component').then(({ WizardInitialComponent }) => WizardInitialComponent),
    loading: import('../components/app-loading/app-loading.component').then(({ AppLoadingComponent }) => AppLoadingComponent),
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