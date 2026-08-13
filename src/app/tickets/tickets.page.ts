import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';
import * as moment from 'moment-timezone';

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
    this.fetchBookingData();
    setTimeout(() => {
      event.target.complete();
    }, 1500);
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
    const userId = this.auth.currentUserValue?._id;
    if (!userId) {
      this.loader = false;
      return;
    }

    if (this.segmentData == 'upcoming' || this.segmentData == 'completed') {
      const condition = {
        status: "Success",
        user: userId,
        IsCancelled: { $ne: true }
      };

      this.api.getBookings(condition, 1, 100, "").subscribe(res => {
        console.info(res);
        const allBookings = res.data || [];
        const startOfToday = moment().startOf('day');

        this.journeyData = allBookings.filter((item: any) => {
          let dateStr = item.PickupInfo?.PickupTime || item.DepartureDateTime || item.JourneyDate;
          let ticketMoment = moment(dateStr);

          if (!ticketMoment.isValid()) {
            return this.segmentData === 'upcoming';
          }

          if (this.segmentData === 'upcoming') {
            return ticketMoment.isSameOrAfter(startOfToday);
          } else {
            return ticketMoment.isBefore(startOfToday);
          }
        });

        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      });

    } else if (this.segmentData == 'cancelled') {
      const condition = {
        user: userId,
        $or: [
          { status: "Cancel" },
          { IsCancelled: true }
        ]
      };

      this.api.getBookings(condition, 1, 100, "").subscribe(res => {
        console.info(res);
        this.journeyData = res.data || [];
        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      });
    }
  }
}
