import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadFileWizardComponent } from './components/load-file-wizard/load-file-wizard.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'loading', component: LoadFileWizardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
