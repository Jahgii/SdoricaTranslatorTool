import { Type } from "@angular/core"

export interface Viewers { [component: string]: () => Promise<Type<any>> };

export const viewers: Viewers = {
    login: async () => (await import('../components/login/login.component')).LoginComponent,
    localization: async () => (await import('../localization/localization.component')).LocalizationComponent,
    dialogs: async () => (await import('../dialog-assets/dialog-main/dialog-main.component')).DialogMainComponent,
    import: async () => (await import('../import/import-main/import-main.component')).ImportMainComponent,
    importall: async () => (await import('../import/import-all/import-all.component')).ImportAllComponent,
    export: async () => (await import('../export/export-main/export-main.component')).ExportTranslationGuestComponent,
    wizard: async () => (await import('../components/wizard-initial/wizard-initial.component')).WizardInitialComponent,
    loading: async () => (await import('../components/app-loading/app-loading.component')).AppLoadingComponent,
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