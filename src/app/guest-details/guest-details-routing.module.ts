import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GuestDetailsPage } from './guest-details.page';

const routes: Routes = [
  {
    path: '',
    component: GuestDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuestDetailsPageRoutingModule {}
