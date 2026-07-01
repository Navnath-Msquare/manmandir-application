import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Route, Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';
import { DatePipe, Location } from '@angular/common';
import { PaymentComponent } from '../payment/payment.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-guest-details',
  templateUrl: './guest-details.page.html',
  styleUrls: ['./guest-details.page.scss'],
})
export class GuestDetailsPage implements OnInit {
  isGST = false;
  bookedData:any=[];
  pickups:any;
  dropoffs:any;
  busDetails:any;
  journeyDetails:any;
  fare:any;

  gstNo:any="";
  businessName:any="";
  email:any="";
  mobile:any="";
  name:any="";

  from = "";
  fromId = "";
  to = "";
  toId = "";
  date:any;
  busId = "";

  holdId = "";

  constructor(public api:ApiService,public authS:AuthenticationService,public toast:ToastController,public router:Router, public location: Location,
    public modal:ModalController,public datePipe: DatePipe) { 

    this.name = this.authS.currentUserValue.name;
    this.email = this.authS.currentUserValue.email;
    this.mobile = this.authS.currentUserValue.mobile;

    this.bookedData = history.state.bookedData;
    this.pickups = history.state.pickups;
    this.dropoffs = history.state.dropoffs;
    this.busDetails = history.state.busDetails;
    this.journeyDetails = history.state.journeyDetails;
    this.fare = history.state.fare;


    let tempFrom = this.journeyDetails['from'];
    this.from = tempFrom.split("-")[0];
    this.fromId = tempFrom.split("-")[1];

    let tempTo = this.journeyDetails['to'];
    this.to = tempTo.split("-")[0];
    this.toId = tempTo.split("-")[1];

    this.date = this.datePipe.transform(new Date(this.journeyDetails['date']), "yyyy-MM-dd");
    
    this.busId = this.journeyDetails['bus'];
    
  }

  ngOnInit() {
    
  }

  holdSeat(){
    let passengers:any = [];
    for(let i=0;i<this.bookedData.length;i++){
      passengers.push({"Name":this.bookedData[i].name,"Age":parseInt(this.bookedData[i].age),"Gender":this.bookedData[i].gender,
      "SeatNo":this.bookedData[i].seatNo.toString(),"Fare":this.bookedData[i].fare,"SeatTypeId":this.bookedData[i].seat_type,
      "IsAcSeat":false})
    }
    let data = {
      "FromCityId": parseInt(this.fromId),
      "ToCityId": parseInt(this.toId),
      "JourneyDate": this.date,
      "BusId": parseInt(this.busId),
      "PickUpID": this.pickups.PickupCode,
      "DropOffID": this.dropoffs.DropoffCode,
      "ContactInfo": {
        "CustomerName": this.name,
        "Email": this.email,
        "Phone": this.mobile.toString(),
        "Mobile": this.mobile.toString()
      },
      "GSTDetails": {
        "Gstin": this.gstNo,
        "GstCompany": this.businessName
      },
      "Passengers": passengers
    }
    

    this.api.serverRequest("POST",environment.busTranApi+"HoldSeats",data).subscribe(async res=>{
        console.log(res);
        let body = JSON.parse(res.body);
        let status = body.success;
        
        if(!status){
          this.presentToast(body?.Error.Msg,"danger");
          return;
        }
        
        let data = body.data;
        this.holdId = data.HoldId;

        let passengersData:any = [];
        for(let i=0;i<this.bookedData.length;i++){
          passengersData.push({"Seat":this.bookedData[i].seat,"Name":this.bookedData[i].name,"Age":parseInt(this.bookedData[i].age),"Gender":this.bookedData[i].gender,
          "SeatNo":this.bookedData[i].seatNo.toString(),"Fare":this.bookedData[i].fare,"SeatTypeId":this.bookedData[i].seat_type,
          "IsAcSeat":false})
        }
        let dbData = {
          "FromCityId": parseInt(this.fromId),
          "ToCityId": parseInt(this.toId),
          "JourneyDate": this.date,
          "BusId": parseInt(this.busId),
          "PickUpID": this.pickups.PickupCode,
          "DropOffID": this.dropoffs.DropoffCode,
          "FromCityName": this.from,
          "ToCityName": this.to,
          "ContactInfo": {
            "CustomerName": this.name,
            "Email": this.email,
            "Phone": this.mobile.toString(),
            "Mobile": this.mobile.toString()
          },
          "GSTDetails": {
            "Gstin": this.gstNo,
            "GstCompany": this.businessName
          },
          "Passengers": passengersData,
          "HoldId":this.holdId,
          "user":this.authS.currentUserValue._id,
          "status":"Pending"
        }

        console.log(dbData);
        this.api.createBookings(dbData).subscribe(async res=>{

          const modal = await this.modal.create({
            component: PaymentComponent,
            componentProps:{
              holdId: this.holdId,
              fare: this.fare,
              busDetails:this.busDetails,
              pickups: this.pickups,
              dropoffs: this.dropoffs,
              passengers:passengersData
            }
          });
        
          await modal.present();
        },error=>{
          console.log(error);
          this.presentToast("Something went wrong!","danger");
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


  back(){
    this.location.back();
  }
}
