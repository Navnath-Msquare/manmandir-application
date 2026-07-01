import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';
declare var Razorpay:any;
import { Checkout } from 'capacitor-razorpay';
@Component({
  selector: 'app-wallet',
  templateUrl: 'wallet.page.html',
  styleUrls: ['wallet.page.scss']
})
export class WalletPage implements OnInit{

  userWalletBalance = this.auth.currentUserValue.walletBalance;
  walletTransactions:any = [];
  addAmountValue = 1000;
  lodingTrans = true;

  razorpayResponse: any;
  paymentId = '';
  characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  paymentRazorpayStatus = false;
  RAZORPAY_OPTIONS: any = {
   // key: environment.razorpayKey,
    amount: '',
    name: '',
    order_id: '',
    description: 'Wallet Amount',
    prefill: {
      name: '',
      email: 'milind@gmail.com',
      contact: '',
      method: ''
    },
    modal: {},
    theme: {
      color: '#F5A522'
    }
  };
  
  orderId = Math.floor(100000000 + Math.random() * 900000000);
  baseURL = environment.baseURL;
  item:any = [];
  paymentModal = false;

  //client = ZoomMtgEmbedded.createClient();
  interval:any = "";
  amountToAdd:any = 0;
  selectedSchedule:any=[];
  constructor(public auth: AuthenticationService, public toastController: ToastController, public api: ApiService, public modal:ModalController) {}



  ngOnInit() {
    this.fetchData();
  }

  fetchData(){
    this.walletTransactions = [];
    this.api.getAllWalletTransactions({user:this.auth.currentUserValue._id},1,25,"").subscribe(res=>{
      this.walletTransactions = res.data;
      this.lodingTrans = false;
      console.log(this.walletTransactions)
    });

    this.userWalletBalance = 0;
    this.api.getAllUser({_id:this.auth.currentUserValue._id},1,1,"").subscribe(res=>{
      this.userWalletBalance = res.data[0].walletBalance;
    });
  }


  addAmount(amount:number){
    this.addAmountValue += amount;
  }

  handleRefresh(event:any){
    this.fetchData();
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  


  paymentSuccess(){
    let wData = JSON.stringify({
      description:"Amount added",
      amount:this.addAmountValue,
      type:"credit",
      user:this.auth.currentUserValue._id
    })
    this.api.createWallet(wData).subscribe(res=>{
      this.presentToast(res.message,"success");
      let data :any = {
        adminAgentCommission:0,
        mobile: this.auth.currentUserValue.mobile,
        role: this.auth.currentUserValue.role,
        walletBalance: ((this.auth.currentUserValue.walletBalance*1) + (this.addAmountValue*1)).toString(),
        _id:this.auth.currentUserValue._id,
        name: this.auth.currentUserValue.name,
        email: this.auth.currentUserValue.email,
      }
     localStorage.setItem("currentUser",JSON.stringify(data));
     this.auth.updateData(data);
      this.modal.dismiss();
      this.fetchData();
    },error=>{
      console.error(error);
      this.presentToast("Something went wrong!","danger")
    })
  }

  async payWithRazorpay(){
    if(this.addAmountValue == 0 || this.addAmountValue == undefined){
      return;
    }
    this.api.createPaymentOrder(this.addAmountValue,this.generateRandomString()).subscribe(async res=>{
      const options = {
        key: environment.razorpayKey,
        amount:Number(this.addAmountValue)+"00",
        description: 'Add Money to wallet',
        image: 'https://karobooking.com/assets/images/logo.png',
        order_id: res.id,
        currency: 'INR',
        name: 'Karobooking',
        prefill: {
          email: this.auth.currentUserValue.email,
          contact: this.auth.currentUserValue.mobile
        },
        theme: {
          color: '#D92519'
        }
      }
      try {
        let data = (await Checkout.open(options));
        this.paymentSuccess();
      } catch (error) {
        //it's paramount that you parse the data into a JSONObject
        console.log(error);
        this.presentToast("Payment Transaction Cancelled","danger");
      }
    });
    
  }

  // pay(){
  //   console.log(this.item._id);
  //   console.log(this.auth.currentUserValue._id)
  //   const formElement = document.getElementById('customerData') as HTMLFormElement;
  //   formElement.submit();

  // }

  async presentToast(message:string,color:string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }

  generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

}
