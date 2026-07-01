import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { FilterPipe } from '../filter.pipe';
import { ProfileUpdateComponent } from './profile-update/profile-update.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { RefundPolicyComponent } from './refund-policy/refund-policy.component';



@NgModule({
  declarations: [
    FilterPipe,
    ProfileUpdateComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    RefundPolicyComponent
  ],
  imports: [
    IonicModule,
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule
    
  ],
  exports:[
    FilterPipe
  ]
})
export class SharedModule { }
