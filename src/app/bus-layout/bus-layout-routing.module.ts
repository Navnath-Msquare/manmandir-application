import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusLayoutPage } from './bus-layout.page';

const routes: Routes = [
  {
    path: '',
    component: BusLayoutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusLayoutPageRoutingModule {}
