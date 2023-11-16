import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { GroupsComponent } from './components/groups/groups.component';
import { DialogAssetsComponent } from './components/dialog-assets/dialog-assets.component';
import { LocalizationComponent } from './components/localization/localization.component';
import { MainGroupsComponent } from './components/main-groups/main-groups.component';
import { LoginComponent } from './components/login/login.component';
import { ExportTranslationGuestComponent } from './components/export-translation-guest/export-translation-guest.component';
import { authentificationGuard } from './core/guards/authentification.guard';
import { authorizationGuard } from './core/guards/authorization.guard';
import { translationLanguageGuard } from './core/guards/translation-language.guard';
import { ViewerMainComponent } from './mainlayout/viewer-main/viewer-main.component';

const routes: Routes = [
  {
    path: '',
    component: ExportTranslationGuestComponent,
    canActivate: [authentificationGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: ViewerMainComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard
    ]
  },
  {
    path: 'localization',
    component: LocalizationComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard,
      translationLanguageGuard
    ]
  },
  {
    path: 'dialogsAsset',
    component: MainGroupsComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard,
      translationLanguageGuard
    ]
  },
  {
    path: 'dialogsAsset/:mid',
    component: GroupsComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard,
      translationLanguageGuard
    ]
  },
  {
    path: 'dialogsAsset/:mid/:gid',
    component: DialogAssetsComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard,
      translationLanguageGuard
    ],
  },
  {
    path: 'loading',
    component: LoadFileWizardComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard
    ]
  },
  {
    path: 'export',
    component: ExportTranslationGuestComponent,
    canActivate: [
      authentificationGuard,
      authorizationGuard,
      translationLanguageGuard
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
