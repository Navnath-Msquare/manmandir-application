import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { AuthenticationService } from '../core/services/authentication.service';
import { ApiService } from '../core/services/api.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Checkout } from 'capacitor-razorpay';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-booking-summary',
  templateUrl: './booking-summary.component.html',
  styleUrls: ['./booking-summary.component.css']
})
export class BookingSummaryComponent implements OnInit {

  holdId = this.navParams.get('holdId');
  busDetails = this.navParams.get('busDetails');
  fare = this.navParams.get('fare');
  gst = this.navParams.get('gst');
  pickups = this.navParams.get('pickups');
  dropoffs = this.navParams.get('dropoffs');
  passengers = this.navParams.get('passengers');
  from = this.navParams.get('from');
  fromState = this.navParams.get('fromState');
  fromId = this.navParams.get('fromId');
  to = this.navParams.get('to');
  toState = this.navParams.get('toState');
  toId = this.navParams.get('toId');
  busId = this.navParams.get('busId');
  date = this.navParams.get('date');
  source = this.navParams.get('source');

  discount = 0;
  couponValue = "";
  amount = 0;
  walletPaidAmount = 0;

  loading = false;
  holdData: any = this.navParams.get('holdData') || null;

  constructor(public modalCtrl: ModalController, public navParams: NavParams, public auth: AuthenticationService, public api: ApiService,
    public toast: ToastController, public router: Router
  ) { }

  ngOnInit(): void {
    this.amount = this.fare;
    if (!this.holdData || !this.holdData._id) {
      this.fetchHoldData();
    }
  }

  fetchHoldData(callback?: () => void) {
    if (!this.holdId || !this.auth.currentUserValue?._id) return;
    this.api.getBookings({ HoldId: this.holdId, user: this.auth.currentUserValue._id }, 1, 1, "").subscribe(res => {
      if (res.data?.length > 0) {
        this.holdData = res.data[0];
      }
      if (callback) callback();
    }, error => {
      console.error(error);
      if (callback) callback();
    });
  }

  async applyCoupon() {
    let userType = "";
    await this.api.getBookings({ status: { $ne: "Pending" }, user: this.auth.currentUserValue._id }, 1, 50, "").subscribe(res => {
      if (res.data.length > 0) {
        userType = "Existing"
      } else {
        userType = "New"
      }
    }, error => {
      console.error(error);
    })
    this.api.getCoupon({ code: this.couponValue, role: "User", $or: [{ type: userType }, { type: "All" }] }, 1, 1, "").subscribe(res => {
      console.log(res);
      if (res.data.length > 0) {
        console.log(res.data[0].discount);
        console.log(this.fare);
        let discountPercentage = parseInt(res.data[0].discount);

        this.amount = parseFloat((parseFloat(this.fare) * ((100 - discountPercentage) / 100)).toFixed(2));
        this.discount = parseFloat((parseFloat(this.fare) - this.amount).toFixed(2));
      }

    })
  }

  changePaymentMode(event: any) {

    if (event.detail.value == "wallet") {
      let walletBalance = this.auth.currentUserValue.walletBalance;
      if (walletBalance >= parseFloat((parseFloat(this.fare) - this.discount).toFixed(2))) {
        this.amount = 0;
      } else {
        this.amount = parseFloat((parseFloat(this.fare) - this.discount).toFixed(2)) - walletBalance;
        this.walletPaidAmount = walletBalance;
      }

    } else {
      this.amount = parseFloat((parseFloat(this.fare) - this.discount).toFixed(2));
    }
  }

  async payWithRazorpay() {
    this.loading = true;

    if (!this.holdData || !this.holdData._id) {
      try {
        const res: any = await this.api.getBookings({ HoldId: this.holdId, user: this.auth.currentUserValue._id }, 1, 1, "").toPromise();
        if (res?.data?.length > 0) {
          this.holdData = res.data[0];
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (this.amount == 0) {
      let wData = JSON.stringify({
        description: "For Ticket Booking",
        amount: (this.discount == 0) ? this.fare : this.fare - this.discount,
        type: "debit",
        user: this.auth.currentUserValue._id
      })
      this.api.createWallet(wData).subscribe(res => {
        this.bookASeat();
      }, error => {
        console.error(error);
        this.presentToast("Something went wrong!", "danger")
        this.loading = false;
      })

    } else {
      this.api.createPaymentOrder((this.discount == 0) ? this.fare : this.fare - this.discount, this.makeid(10)).subscribe(async res => {

        const options = {
          key: environment.razorpayKey,
          amount: (this.discount == 0) ? ((Number.isInteger(this.fare)) ? (this.fare + "00").toString() : this.fare.toFixed(2)) : ((Number.isInteger(this.fare - this.discount)) ? ((this.fare - this.discount) + "00").toString() : (this.fare - this.discount).toFixed(2)),
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
          if (this.walletPaidAmount == 0) {
            this.bookASeat(transData?.razorpay_payment_id);
          } else {
            let wData = JSON.stringify({
              description: "For Ticket Booking",
              amount: this.walletPaidAmount,
              type: "debit",
              user: this.auth.currentUserValue._id
            })
            this.api.createWallet(wData).subscribe(res => {
              this.bookASeat(transData?.razorpay_payment_id);
            }, error => {
              console.error(error);
              this.presentToast("Something went wrong!", "danger")
              this.loading = false;
            })
          }



        } catch (error: any) {

          console.log(error);
          let err = JSON.parse(error);
          this.loading = false;
        }
      })
    }
  }



  bookASeat(paymentId?: string) {

    if (this.source === "OLD_API") {
      this.bookSeatOldApi(paymentId);
    } else {
      this.bookSeatNewApi(paymentId);
    }
  }

  bookSeatOldApi(paymentId?: string) {
    const data = {
      "HoldId": this.holdId
    }
    this.api.serverRequest("POST", environment.busTranApi + "BookSeats", data).subscribe(async res => {
      console.log(res);
      let body = JSON.parse(res.body);
      let status = body.success;

      if (res.statusCode != 200) {
        this.presentToast(body?.Message, "danger");
        this.loading = false;
        return;
      }

      if (!status) {
        this.presentToast(body?.Error.Msg, "danger");
        this.loading = false;
        return;
      }

      let data = body.data;
      let TicketNo = data.TicketNo;
      let PNRNo = data.PNRNo;

      
      this.api.serverRequest("GET", environment.busTranApi + "BookingDetails?PNR=" + PNRNo + "&TicketNo=" + TicketNo, {}).subscribe(async res => {
        console.log(res);
        let body = JSON.parse(res.body);
        let status = body.success;

        if (res.statusCode != 200) {
          this.presentToast(body?.Message, "danger");
          this.loading = false;
          return;
        }
        if (!status) {
          this.presentToast(body?.Error.Msg, "danger");
          this.loading = false;
          return;
        }

        let data = body.data;

        let dbData = {
          "TicketNo": data.TicketNo,
          "PNRNo": data.PNRNo,
          "BusTypeName": data.BusTypeName,
          "DepartureDateTime": data.DepartureDateTime,
          "ArrivalDateTime": data.ArrivalDateTime,
          "CompanyName": data.CompanyName,
          "PickupInfo": {
            "PickupTime": data.PickupInfo?.PickupTime,
            "Address": data.PickupInfo?.Address,
            "Phone": data.PickupInfo?.Phone,
            "Landmark": data.PickupInfo?.Landmark,
            "PickupName": data.PickupInfo?.PickupName,
          },
          "DropoffInfo": {
            "DropoffTime": this.dropoffs.DropoffTime,
            "DropoffName": this.dropoffs.DropoffName,
          },
          "TotalSeats": data.TotalSeats,
          "TotalFare": data.TotalFare || data.fare || data.total_fare || this.fare,
          "PaymentId": paymentId,
          "status": "Success"
        }

        let bookingId = this.holdData?._id;
        const executeOldUpdate = (targetId: string) => {
          this.api.updateBookings(dbData, targetId).subscribe(res => {
            this.presentToast("Booking Successful", "success");
            this.router.navigate(['/ticket-details'], { queryParams: { id: targetId, action: 'notify-booking' } });
            this.modalCtrl.dismiss();
            this.loading = false;
          }, error => {
            console.error(error);
            this.presentToast("Something Went Wrong!", "danger");
            this.loading = false;
          });
        };

        if (bookingId) {
          executeOldUpdate(bookingId);
        } else {
          this.api.getBookings({ HoldId: this.holdId, user: this.auth.currentUserValue._id }, 1, 1, "").subscribe(res => {
            if (res.data?.length > 0) {
              this.holdData = res.data[0];
              executeOldUpdate(this.holdData._id);
            } else {
              this.presentToast("Something Went Wrong!", "danger");
              this.loading = false;
            }
          }, error => {
            console.error(error);
            this.presentToast("Something Went Wrong!", "danger");
            this.loading = false;
          });
        }
      });
    });
  }

  bookSeatNewApi(paymentId?: string) {

    this.loading = true;

    this.api.serverRequestGds('POST', '/gds', {
      method: 'POST',
      endpoint: `confirm_booking/${this.holdId}.json`,
      query: { api_key: environment.newApikey },
      body: {
        pnr_number: this.holdId
      }
    }).subscribe(res => {

      const ticket = res?.data?.result?.ticket_details || res?.result?.ticket_details;
      if (!ticket) {
        this.presentToast("Booking Failed: No ticket details found", "danger");
        this.loading = false;
        return;
      }

      if (ticket.ticket_status !== "Confirmed" && !ticket.pnr_number) {
        this.presentToast("Booking Failed: Ticket not confirmed", "danger");
        this.loading = false;
        return;
      }

        let travelDate = ticket.travel_date || this.date;
        let depTime = ticket.boarding_point_details?.dep_time || ticket.dep_time || "00:00:00";
        
        let pickupMoment = moment(`${travelDate} ${depTime}`, ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD hh:mm A', 'DD-MM-YYYY HH:mm', 'YYYY-MM-DD']);
        let pickupTimeDate = pickupMoment.isValid() ? pickupMoment.toDate() : new Date(travelDate);
        if (isNaN(pickupTimeDate.getTime())) {
          pickupTimeDate = new Date();
        }
        let dropoffTimeDate = new Date(pickupTimeDate.getTime() + (12 * 60 * 60 * 1000)); // Estimated 12 hours later

        const dbData = {

          TicketNo: ticket.ticket_number,
          PNRNo: ticket.operator_pnr,
          BusTypeName: ticket.bus_type,
          DepartureDateTime: `${travelDate} ${depTime}`,
          ArrivalDateTime: dropoffTimeDate.toISOString(), // Estimated arrival time
          CompanyName: ticket.travels,

          PickupInfo: {
            PickupTime: pickupTimeDate.toISOString(),
            Address: ticket.boarding_point_details?.boarding_stage_address,
            Phone: ticket.boarding_point_details?.contact_numbers,
            Landmark: ticket.boarding_point_details?.landmark,
            PickupName: ticket.boarding_point_details?.name
          },

          DropoffInfo: {
            DropoffTime: dropoffTimeDate.toISOString(),
            DropoffName: ticket.destination
          },

        TotalSeats: ticket.no_of_seats,
        TotalFare: ticket.total_fare || ticket.totalFare || ticket.fare || ticket.total_amount || ticket.totalAmount || this.fare,

        SeatNumbers: ticket.seat_numbers,
        PassengerDetails: ticket.passenger_details,

        Commission: ticket.commission,
        ServiceTaxPercent: ticket.service_tax_percent,
        ConvenienceChargePercent: ticket.convenience_charge_percent,
        PaymentId: paymentId,

        status: "Success",
        source: this.source
      };

      const executeBookingUpdate = (targetId: string) => {
        this.api.updateBookings(dbData, targetId).subscribe(() => {
          this.presentToast("Booking Successful", "success");
          this.router.navigate(['/ticket-details'], { queryParams: { id: targetId, action: 'notify-booking' } });
          this.modalCtrl.dismiss();
          this.loading = false;
        }, err => {
          console.error(err);
          this.presentToast("DB Update Failed", "danger");
          this.loading = false;
        });
      };

      let bookingId = this.holdData?._id;
      if (bookingId) {
        executeBookingUpdate(bookingId);
      } else {
        this.api.getBookings({ HoldId: this.holdId, user: this.auth.currentUserValue._id }, 1, 1, "").subscribe(res => {
          if (res.data?.length > 0) {
            this.holdData = res.data[0];
            executeBookingUpdate(this.holdData._id);
          } else {
            this.presentToast("Booking update failed: Record not found", "danger");
            this.loading = false;
          }
        }, err => {
          console.error(err);
          this.presentToast("DB Update Failed", "danger");
          this.loading = false;
        });
      }

    }, err => {
      console.error(err);
      this.presentToast("GDS Booking Failed", "danger");
      this.loading = false;
    });
  }


  async presentToast(message: string, color: string) {
    const toast = await this.toast.create({
      message: message,
      color: color,
      duration: 1500,
      position: "bottom"
    });

    await toast.present();
  }


  makeid(length: number) {
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
}
