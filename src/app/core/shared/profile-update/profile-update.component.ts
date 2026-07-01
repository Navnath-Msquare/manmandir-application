import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-profile-update',
  templateUrl: './profile-update.component.html',
  styleUrls: ['./profile-update.component.scss'],
})
export class ProfileUpdateComponent implements OnInit {

  name = "";
  email = "";
  mobile = "";
  localdata : any = [];


  constructor(public auth:AuthenticationService,public api:ApiService, public toastController: ToastController,public modalCtrl:ModalController) { }

  ngOnInit() {
    this.name = this.auth.currentUserValue.name;
    this.email = this.auth.currentUserValue.email;
    this.mobile = this.auth.currentUserValue.mobile;
  }


  saveProfile(){
    if(this.name == "" || this.name == undefined || this.name == null){
      this.presentToast("Please enter Name","danger");
      return;
    }

    if(this.email == ""  || this.email == undefined || this.email == null){
      this.presentToast("Please enter Email","danger");
      return;
    }

    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    if(!re.test(String(this.email).toLowerCase())){
      this.presentToast("Please enter valid Email","danger");
      return;
    }

    const data = JSON.stringify({
      "name": this.name,
      "email": this.email,
    });

    this.api.updateUser(data,this.auth.currentUserValue._id).subscribe(res=>{
      this.presentToast("Profile updated successfully","success");
      // location.reload();
      this.modalCtrl.dismiss();
      console.log(this.modalCtrl)
      this.localdata = {
        _id: this.auth.currentUserValue._id,
        name: this.name,
        photo: this.auth.currentUserValue.photo,
        email: this.email,
        mobile: this.auth.currentUserValue.mobile,
        walletBalance: this.auth.currentUserValue.walletBalance,
        role: this.auth.currentUserValue.role,
        accessToken: this.auth.currentUserValue.accessToken
      }
      localStorage.setItem('currentUser',JSON.stringify(this.localdata));
      this.auth.updateData(this.localdata);
    });
  }

  async presentToast(message:string,color:string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1500
    });

    await toast.present();
  }
}
