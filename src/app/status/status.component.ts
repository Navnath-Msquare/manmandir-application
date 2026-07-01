import { ActivatedRoute, Route } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../core/services/authentication.service';
import { ApiService } from '../core/services/api.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {
status: any;

  constructor( public authS:AuthenticationService,public api:ApiService,public route:ActivatedRoute) { }

  ngOnInit(): void {
this.route.params.subscribe(async(data:any)=>{
  this.status=JSON.parse(data.status)
  let subscriptions = await this.api.getSubscriptions({user:this.status.user,schedules:this.status.schedules},1,1,"").toPromise();
  if(subscriptions.data.length > 0){
    const sData = JSON.stringify({
      paymentStatus:this.status.paymentStatus,
      orderId:this.status.orderId,
      trackingId:this.status.trackingId
    })
    this.api.updateSubscriptions(sData,subscriptions.data[0]._id).subscribe((cdata:any)=>{
      console.log(cdata)
    })
  }else{
    this.api.createSubscriptions(this.status).subscribe((cdata:any)=>{
      console.log(cdata)
    })
  }
})

  }

}
