import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';

@Component({
  selector: 'app-tickets',
  templateUrl: 'tickets.page.html',
  styleUrls: ['tickets.page.scss']
})
export class TicketsPage implements OnInit {

  journeyData: any = [];
  segmentData: any = "upcoming";

  loader = false;
  constructor(private api: ApiService, private auth: AuthenticationService) { }

  handleRefresh(event: any) {
    setTimeout(() => {
      // Any calls to load data go here
      event.target.complete();
    }, 2000);
  };


  ngOnInit(): void {
    this.fetchBookingData();
  }

  changeBooking(event: any) {
    this.segmentData = event.detail.value;
    this.fetchBookingData();
  }

  fetchBookingData() {
    this.loader = true;
    this.journeyData = [];
    if (this.segmentData == 'upcoming') {
      this.api.getBookings({ status: "Success", "PickupInfo.PickupTime": { $gte: new Date() }, user: this.auth.currentUserValue._id }, 1, 50, "").subscribe(res => {
        console.info(res);
        this.journeyData = res.data;
        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      })
    } else if (this.segmentData == 'completed') {
      this.api.getBookings({ status: "Success", "DropoffInfo.DropoffTime": { $lte: new Date() }, user: this.auth.currentUserValue._id }, 1, 50, "").subscribe(res => {
        console.info(res);
        this.journeyData = res.data;
        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      })
    } else if (this.segmentData == 'cancelled') {
      this.api.getBookings({ status: "Cancel", user: this.auth.currentUserValue._id }, 1, 50, "").subscribe(res => {
        console.info(res);
        this.journeyData = res.data;
        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      })
    }
  }
}
