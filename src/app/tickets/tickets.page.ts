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
        user: userId,
        status: { $nin: ["Pending", "Cancel", "Cancelled"] },
        IsCancelled: { $ne: true }
      };

      this.api.getBookings(condition, 1, 100, "").subscribe(res => {
        console.info(res);
        const rawBookings = res.data || [];
        const allBookings = this.deduplicateBookings(rawBookings);
        const startOfToday = moment().startOf('day');

        const dateFormats = [
          'YYYY-MM-DD HH:mm:ss',
          'YYYY-MM-DD HH:mm',
          'YYYY-MM-DD',
          'DD-MM-YYYY HH:mm',
          'DD-MM-YYYY',
          'DD/MM/YYYY',
          'YYYY-MM-DDTHH:mm:ss.SSSZ',
          'YYYY-MM-DDTHH:mm:ss.SSS'
        ];

        this.journeyData = allBookings.filter((item: any) => {
          let dateStr = item.PickupInfo?.PickupTime || item.DepartureDateTime || item.JourneyDate || item.ArrivalDateTime;
          let ticketMoment = moment(dateStr, dateFormats, true);
          if (!ticketMoment.isValid()) {
            ticketMoment = moment(dateStr);
          }

          if (!ticketMoment.isValid()) {
            return this.segmentData === 'upcoming';
          }

          if (this.segmentData === 'upcoming') {
            return ticketMoment.isSameOrAfter(startOfToday);
          } else {
            return ticketMoment.isBefore(startOfToday);
          }
        });

        // Sort upcoming (nearest first) or completed (newest first)
        this.journeyData.sort((a: any, b: any) => {
          let dateA = moment(a.PickupInfo?.PickupTime || a.DepartureDateTime || a.JourneyDate).valueOf();
          let dateB = moment(b.PickupInfo?.PickupTime || b.DepartureDateTime || b.JourneyDate).valueOf();
          return this.segmentData === 'upcoming' ? dateA - dateB : dateB - dateA;
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
        const rawBookings = res.data || [];
        this.journeyData = this.deduplicateBookings(rawBookings);
        this.journeyData.sort((a: any, b: any) => {
          let dateA = moment(a.cancellationDate || a.JourneyDate).valueOf();
          let dateB = moment(b.cancellationDate || b.JourneyDate).valueOf();
          return dateB - dateA;
        });
        this.loader = false;
      }, error => {
        console.error(error);
        this.loader = false;
      });
    }
  }

  deduplicateBookings(bookings: any[]): any[] {
    const seenMap = new Map<string, any>();

    for (const item of bookings) {
      if (item.status === 'Pending') {
        continue;
      }

      const seatStr = item.Passengers?.map((p: any) => p.SeatNo).sort().join(',') || item.SeatNumbers || '';
      const primaryKey = item.TicketNo || item.PNRNo || item.HoldId;
      const compositeKey = `${item.JourneyDate}_${item.FromCityName}_${item.ToCityName}_${seatStr}`;
      const uniqueKey = primaryKey ? `KEY_${primaryKey}` : `COMP_${compositeKey}`;

      if (!seenMap.has(uniqueKey)) {
        seenMap.set(uniqueKey, item);
      } else {
        const existing = seenMap.get(uniqueKey);
        if (existing.status !== 'Success' && item.status === 'Success') {
          seenMap.set(uniqueKey, item);
        } else if (!existing.TicketNo && item.TicketNo) {
          seenMap.set(uniqueKey, item);
        }
      }
    }

    return Array.from(seenMap.values());
  }

  formatLocationText(name?: string, city?: string, address?: string, landmark?: string): string {
    const parts: string[] = [];

    if (name && name.trim()) {
      parts.push(name.trim());
    }

    if (city && city.trim()) {
      const trimmedCity = city.trim();
      if (!name || !name.toLowerCase().includes(trimmedCity.toLowerCase())) {
        parts.push(trimmedCity);
      }
    }

    if (address && address.trim()) {
      const trimmedAddress = address.trim();
      if (!name || !name.toLowerCase().includes(trimmedAddress.toLowerCase())) {
        parts.push(trimmedAddress);
      }
    }

    if (landmark && landmark.trim()) {
      const trimmedLandmark = landmark.trim();
      if (!name || !name.toLowerCase().includes(trimmedLandmark.toLowerCase())) {
        parts.push(trimmedLandmark);
      }
    }

    const uniqueParts: string[] = [];
    for (const part of parts) {
      if (!uniqueParts.some(p => p.toLowerCase() === part.toLowerCase())) {
        uniqueParts.push(part);
      }
    }

    return uniqueParts.join(', ') || city || name || '';
  }
}
