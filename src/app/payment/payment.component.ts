import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';
import { Checkout } from 'capacitor-razorpay';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  holdId = this.navParams.get('holdId');
  busDetails = this.navParams.get('busDetails');
  fare = this.navParams.get('fare');
  pickups = this.navParams.get('pickups');
  dropoffs = this.navParams.get('dropoffs');
  passengers = this.navParams.get('passengers');

  viewDetails = true;
  loading = false;
  holdData:any = [];
  couponValue = "";
  amount = 0;
  walletPaidAmount = 0;
  discountAmount = 0;


    
  orderId = Math.floor(100000000 + Math.random() * 900000000);
  baseURL = environment.baseURL;
  item:any = [];
  paymentModal = false;
  amountToAdd:any = 0;
  constructor(public modal:ModalController,public navParams:NavParams, private toast: ToastController,private api: ApiService,public auth: AuthenticationService, public router: Router) { }

  ngOnInit(): void {
      console.log(this.pickups);
      console.log(this.dropoffs);
      console.log(this.holdId);

      this.amount = parseFloat(this.fare);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }


  async payWithRazorpay(){
    this.loading = true;

    this.api.getBookings({HoldId:this.holdId,user:this.auth.currentUserValue._id},1,1,"").subscribe(res=>{
      console.log(res);
      if(res.data?.length == 0){
        this.presentToast("Something went Wrong!","danger")
        return;
      }

      this.holdData = res.data[0];
    },error=>{
      console.error(error);
      this.presentToast("Something went Wrong!","danger")
    })
    
    if(this.amount == 0){
      let wData = JSON.stringify({
        description:"For Ticket Booking",
        amount:(this.discountAmount == 0)?this.fare:this.fare-this.discountAmount,
        type:"debit",
        user:this.auth.currentUserValue._id
      })
      this.api.createWallet(wData).subscribe(res=>{
        this.bookASeat();
        this.loading = false;
      },error=>{
        console.error(error);
        this.presentToast("Something went wrong!","danger")
      })

    }else{
      this.api.createPaymentOrder((this.discountAmount == 0)?this.fare:this.fare-this.discountAmount,this.makeid(10)).subscribe(async res=>{
        
        const options = {
          key: environment.razorpayKey,
          amount: (this.discountAmount == 0)?((Number.isInteger(this.fare))?(this.fare+"00").toString():this.fare.toFixed(2)):((Number.isInteger(this.fare-this.discountAmount))?((this.fare-this.discountAmount)+"00").toString():(this.fare-this.discountAmount).toFixed(2)),
          description: 'KBCash Credits',
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
          this.loading = false;
          let initPayment = await Checkout.open(options);
          
          let transData = JSON.parse(JSON.stringify(initPayment.response))
          if(this.walletPaidAmount == 0){
            this.bookASeat();
            this.loading = false;
          }else{
            let wData = JSON.stringify({
              description:"For Ticket Booking",
              amount:this.walletPaidAmount,
              type:"debit",
              user:this.auth.currentUserValue._id
            })
            this.api.createWallet(wData).subscribe(res=>{
              this.bookASeat();
              this.loading = false;
            },error=>{
              console.error(error);
              this.presentToast("Something went wrong!","danger")
            })
          }
          
          
          
        } catch (error:any) {
          
          console.log(error);
          let err = JSON.parse(error);
        }
      })
    }
  }



  bookASeat(){
    const data = {
      "HoldId": this.holdId
    }
    this.api.serverRequest("POST",environment.busTranApi+"BookSeats",data).subscribe(async res=>{
        console.log(res);
        let body = JSON.parse(res.body);
        let status = body.success;
        
        if(!status){
          this.presentToast(body?.Error.Msg,"danger");
          return;
        }
        
        let data = body.data;
        let TicketNo = data.TicketNo;
        let PNRNo = data.PNRNo;

        console.log("TicketNo",TicketNo);
        console.log("PNRNo",PNRNo);
        this.api.serverRequest("GET",environment.busTranApi+"BookingDetails?PNR="+PNRNo+"&TicketNo="+TicketNo,{}).subscribe(async res=>{
          console.log(res);
          let body = JSON.parse(res.body);
          let status = body.success;
          
          if(!status){
            this.presentToast(body?.Error.Msg,"danger");
            return;
          }
          
          let data = body.data;

          let dbData = {
            "TicketNo":data.TicketNo,
            "PNRNo": data.PNRNo,
            "BusTypeName":data.BusTypeName,
            "DepartureDateTime":data.DepartureDateTime,
            "ArrivalDateTime":data.ArrivalDateTime,
            "CompanyName":data.CompanyName,
            "PickupInfo":{
              "PickupTime":data.PickupInfo?.PickupTime,
              "Address":data.PickupInfo?.Address,
              "Phone":data.PickupInfo?.Phone,
              "Landmark":data.PickupInfo?.Landmark,
              "PickupName":data.PickupInfo?.PickupName,
            },
            "DropoffInfo":{
              "DropoffTime":this.dropoffs.DropoffTime,
              "DropoffName":this.dropoffs.DropoffName,
            },
            "TotalSeats":data.TotalSeats,
            "TotalFare":data.TotalFare,
            "status": "Success"
          }

          this.api.updateBookings(dbData,this.holdData._id).subscribe(res=>{
            this.presentToast("Booking Successful","success");
            this.router.navigateByUrl("/tickets");
            this.modal.dismiss();
          },error=>{
            console.error(error);
            this.presentToast("Something Went Wrong!","danger");
          });


        });

        
    });
  }


  async presentToast(message:string,color:string) {
    const toast = await this.toast.create({
      message: message,
      color: color,
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }


  makeid(length:number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  changePaymentMode(event:any){
    
    if(event.detail.value == "wallet"){
      let walletBalance = this.auth.currentUserValue.walletBalance;
      if(walletBalance >= parseFloat((parseFloat(this.fare) - this.discountAmount).toFixed(2))){
        this.amount = 0;
      }else{
        this.amount = parseFloat((parseFloat(this.fare) - this.discountAmount).toFixed(2)) - walletBalance;
        this.walletPaidAmount = walletBalance;
      }

    } else{
      this.amount = parseFloat((parseFloat(this.fare) - this.discountAmount).toFixed(2));
    }
  }

  async applyCoupon(){
    let userType = "";
    await this.api.getBookings({status: {$ne:"Pending"},user:this.auth.currentUserValue._id},1,50,"").subscribe(res=>{
      if(res.data.length > 0){
        userType = "Existing"
      } else{
        userType = "New"
      }
    },error=>{
      console.error(error);
    })
    this.api.getCoupon({code:this.couponValue,role:"User",$or:[{type:userType},{type:"All"}]},1,1,"").subscribe(res=>{
      console.log(res);
      if(res.data.length > 0){
        console.log(res.data[0].discount);
        console.log(this.fare);
        let discountPercentage = parseInt(res.data[0].discount);

        this.amount = parseFloat((parseFloat(this.fare) * ((100-discountPercentage)/100)).toFixed(2));
        this.discountAmount = parseFloat((parseFloat(this.fare) - this.amount).toFixed(2));
      }
      
    })
  }



}
