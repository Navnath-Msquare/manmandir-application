import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BusSearchPageRoutingModule } from './bus-search-routing.module';

import { BusSearchPage } from './bus-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusSearchPageRoutingModule
  ],
  declarations: [BusSearchPage]
})
export class BusSearchPageModule {}
