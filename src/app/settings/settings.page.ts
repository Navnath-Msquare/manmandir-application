import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthenticationService } from '../core/services/authentication.service';
import { PrivacyPolicyComponent } from '../core/shared/privacy-policy/privacy-policy.component';
import { RefundPolicyComponent } from '../core/shared/refund-policy/refund-policy.component';
import { TermsConditionsComponent } from '../core/shared/terms-conditions/terms-conditions.component';
import { ProfileUpdateComponent } from '../core/shared/profile-update/profile-update.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(public auth: AuthenticationService, public modalController: ModalController) { }

  ngOnInit() {
  }


  logout(){
    this.auth.logout();
  }

  async openProfileModal() {
    const modal = await this.modalController.create({
        component: ProfileUpdateComponent,
        initialBreakpoint:0.80,
        mode:"ios",
        cssClass:"profile-update"
    });
    return await modal.present();
  }

  async openPrivacyModal() {
    const modal = await this.modalController.create({
        component: PrivacyPolicyComponent,
        initialBreakpoint:0.80,
        mode:"ios",
        cssClass:"profile-update"
    });
    return await modal.present();
  }

  async openTermsModal() {
    const modal = await this.modalController.create({
        component: TermsConditionsComponent,
        initialBreakpoint:0.80,
        mode:"ios",
        cssClass:"profile-update"
    });
    return await modal.present();
  }


  async openRefundModal() {
    const modal = await this.modalController.create({
        component: RefundPolicyComponent,
        initialBreakpoint:0.80,
        mode:"ios",
        cssClass:"profile-update"
    });
    return await modal.present();
  }

}
