import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { HomeComponent } from './components/home/home.component';
import { GroupsComponent } from './components/groups/groups.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'group/:id', component: GroupsComponent },
  { path: 'loading', component: LoadFileWizardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
