import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusSearchPage } from './bus-search.page';

const routes: Routes = [
  {
    path: '',
    component: BusSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusSearchPageRoutingModule {}
