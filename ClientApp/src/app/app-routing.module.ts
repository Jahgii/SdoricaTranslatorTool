import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewerMainComponent } from './mainlayout/viewer-main/viewer-main.component';

const routes: Routes = [
  {
    path: '',
    component: ViewerMainComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
