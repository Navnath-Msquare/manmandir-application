import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../core/services/authentication.service';

import { PrivacyPolicyComponent } from '../core/shared/privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from '../core/shared/terms-conditions/terms-conditions.component';


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})
export class WelcomePage implements OnInit {

  serverOTP = "";
  valueOTP = "";
  optBox = false;
  mobileNo = "";
  loader = false;
  constructor(public authService: AuthenticationService, private toastController: ToastController, public router: Router, public modalController: ModalController) { }

  ngOnInit() {

  }


  sendOTP() {
    this.loader = true;
    if (this.mobileNo == "") {
      this.presentToast("Please enter mobile no.", "danger");
      this.loader = false;
      return;
    }
    if (this.mobileNo.toString().length != 10) {
      this.presentToast("Please enter 10 digit mobile no.", "danger");
      this.loader = false;
      return;
    }
    this.optBox = true;
    this.authService.sendOTP(this.mobileNo).subscribe(res => {
      this.serverOTP = res.otp;
      this.presentToast("OTP Sent", "success");
      this.loader = false;
    });
  }

  verifyOTP() {
    this.loader = true;
    if (this.valueOTP == this.serverOTP) {
      this.authService.checkUser(this.mobileNo).subscribe(res => {
        this.presentToast("OTP Verifed", "success");
        this.loader = false;
        this.router.navigate(['/home']);
      });

    } else {
      this.presentToast("Please enter valid OTP", "danger");
      this.loader = false;
    }
  }

  changeNumber() {
    this.serverOTP = "";
    this.valueOTP = "";
    this.optBox = false;
    this.loader = false;
    this.mobileNo = "";
  }

  onOtpChange(event: any) {
    if (event.length == 4) {
      this.valueOTP = event
    }
  }


  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  async openPrivacyModal() {
    const modal = await this.modalController.create({
      component: PrivacyPolicyComponent,
      initialBreakpoint: 0.80,
      mode: "ios",
      cssClass: "profile-update"
    });
    return await modal.present();
  }

  async openTermsModal() {
    const modal = await this.modalController.create({
      component: TermsConditionsComponent,
      initialBreakpoint: 0.80,
      mode: "ios",
      cssClass: "profile-update"
    });
    return await modal.present();
  }


}



