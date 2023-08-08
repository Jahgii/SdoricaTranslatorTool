import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { HomeComponent } from './components/home/home.component';
import { GroupsComponent } from './components/groups/groups.component';
import { DialogAssetsComponent } from './components/dialog-assets/dialog-assets.component';
import { LocalizationComponent } from './components/localization/localization.component';

const routes: Routes = [
  { path: '', component: LocalizationComponent },
  { path: 'main/:mid', component: GroupsComponent },
  { path: 'main/:mid/group/:gid', component: DialogAssetsComponent },
  { path: 'loading', component: LoadFileWizardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
