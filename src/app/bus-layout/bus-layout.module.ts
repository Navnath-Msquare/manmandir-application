import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { BusLayoutPageRoutingModule } from './bus-layout-routing.module';

import { BusLayoutPage } from './bus-layout.page';
import { SwipeSegmentDirective } from '../core/directives/swipe-segment.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BusLayoutPageRoutingModule
  ],
  declarations: [BusLayoutPage,SwipeSegmentDirective]
})
export class BusLayoutPageModule {}
