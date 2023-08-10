import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { HomeComponent } from './components/home/home.component';
import { GroupsComponent } from './components/groups/groups.component';
import { DialogAssetsComponent } from './components/dialog-assets/dialog-assets.component';
import { LocalizationComponent } from './components/localization/localization.component';
import { MainGroupsComponent } from './components/main-groups/main-groups.component';
import { ExportTranslationComponent } from './components/export-translation/export-translation.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'localization', component: LocalizationComponent },
  { path: 'dialogsAsset', component: MainGroupsComponent },
  { path: 'dialogsAsset/:mid', component: GroupsComponent },
  { path: 'dialogsAsset/:mid/:gid', component: DialogAssetsComponent },
  { path: 'loading', component: LoadFileWizardComponent },
  { path: 'export', component: ExportTranslationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
