import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {

  journeyData: any = [];
  ticketDetails: any = [];
  loader = false;
  constructor(public route: ActivatedRoute, public api: ApiService, public toast: ToastController, private alertController: AlertController,
    public router: Router
  ) { }

  // ngOnInit(): void {
  //   this.route.queryParams.subscribe((data:any) => {
  //     this.api.getBookings({_id: data.id},1,1,"").subscribe(async res=>{
  //       console.info(res);
  //       this.journeyData = res.data[0];
  //       const seatNumbers = this.journeyData.Passengers.map((item:any) => item.SeatNo);
  //       const seatNumbersString = seatNumbers.join(',');
  //       let ticketDetails = await this.api.serverRequest("GET",environment.busTranApi+"IsCancellable?PNRNo="+this.journeyData.PNRNo+"&TicketNo="+this.journeyData.TicketNo+"&seatNos="+seatNumbersString,{}).toPromise();
  //       let body = JSON.parse(ticketDetails.body);
  //       if(body.success){
  //         this.ticketDetails = body.data;
  //         console.log(this.ticketDetails)
  //       }
  //     },error=>{
  //       console.error(error);
  //     })
  //   })
  // }
  async ngOnInit() {
    this.route.queryParams.subscribe(async (params: any) => {

      const res: any = await firstValueFrom(
        this.api.getBookings({ _id: params.id }, 1, 1, "")
      );

      this.journeyData = res.data[0];

      await this.getCancellationDetails();
    });
  }

  async getCancellationDetails() {

    const seatNumbers = this.journeyData.Passengers.map((p: any) => p.SeatNo);
    const seatNumbersString = seatNumbers.join(',');

    try {

      if (this.isNewApi()) {

        const res: any = await firstValueFrom(
          this.api.serverRequestGds('POST', '/gds', {
            method: 'GET',
            endpoint: 'can_cancel.json',
            query: {
              ticket_number: this.journeyData.TicketNo,
              seat_numbers: seatNumbersString,
              api_key: environment.newApikey
            }
          })
        );


        const result = res?.result?.is_ticket_cancellable;

        if (result?.is_cancellable) {
          this.ticketDetails = {
            RefundAmount: result.refund_amount,
            CancellationCharges: result.cancellation_charges,
            CancelPercent: result.cancel_percent
          };
        }

      } else {

        const res: any = await firstValueFrom(
          this.api.serverRequest(
            "GET",
            environment.busTranApi +
            "IsCancellable?PNRNo=" + this.journeyData.PNRNo +
            "&TicketNo=" + this.journeyData.TicketNo +
            "&seatNos=" + seatNumbersString,
            {}
          )
        );

        const body = JSON.parse(res.body);

        if (body.success) {
          this.ticketDetails = body.data;
        }
      }

    } catch (error) {
      console.error("Cancel check failed", error);
      this.presentToast("Unable to fetch cancellation details", "danger");
    }
  }

  async presentAlert() {

    const alert = await this.alertController.create({
      header: 'Cancel Ticket?',
      message: `
        Refund: ₹${this.ticketDetails?.RefundAmount} <br>
        Charges: ₹${this.ticketDetails?.CancellationCharges}
      `,
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Yes',
          handler: () => this.cancelTicket()
        }
      ],
    });

    await alert.present();
  }

  async cancelTicket() {

    this.loader = true;

    const seatNumbers = this.journeyData.Passengers.map((p: any) => p.SeatNo);
    const seatNumbersString = seatNumbers.join(',');

    try {

      let dbData: any = {
        status: "Cancel",
        IsCancelled: true
      };

      // ================= NEW API =================
      if (this.journeyData.source === "NEW_API") {

        const cancelRes: any = await firstValueFrom(
          this.api.serverRequestGds('POST', '/gds', {
            method: 'GET',
            endpoint: 'cancel_booking.json',
            query: {
              ticket_number: this.journeyData.TicketNo,
              seat_numbers: seatNumbersString,
              api_key: environment.newApikey
            }
          })
        );
        const cancelData = cancelRes?.result?.cancel_ticket;
        if (!cancelData) throw "Cancel Failed";

        const seatDetail =
          cancelData.cancel_seat_details?.[0]?.cancel_seat_detail;

        dbData = {
          ...dbData,

          RefundAmount: cancelData.refund_amount,
          ChargeAmt: cancelData.cancellation_charges,
          ChargePct: seatDetail?.cancel_percent || 0,

          CancelledSeatNumbers: cancelData.seat_numbers,
          CancelledFare: seatDetail?.cancelled_fare || 0,
          BaseCancelledFare: seatDetail?.base_cancelled_fare || 0,
          CancelledServiceTax: seatDetail?.cancelled_service_tax || 0,
          GstAmount: cancelData.operator_gst_details?.igst_amount || 0
        };

      }
      else {

        const res: any = await firstValueFrom(
          this.api.serverRequest(
            "POST",
            environment.busTranApi + "CancelSeats",
            {
              PNR: this.journeyData.PNRNo,
              TicketNo: this.journeyData.TicketNo,
              SeatNos: seatNumbersString
            }
          )
        );

        const body = JSON.parse(res.body);
        if (!body.success) throw body?.Error?.Msg;

        const data = body.data;

        dbData = {
          ...dbData,

          NewHoldId: data.NewHoldId,
          NewTotalFare: data.NewTotalFare,
          TotalFare: data.TotalFare,
          ChargeAmt: data.ChargeAmt,
          ChargePct: data.ChargePct,
          RefundAmount: data.RefundAmount,
          NewTicketNo: data.NewTicketNo,
          NewPNRNo: data.NewPNRNo
        };
      }

      await firstValueFrom(
        this.api.updateBookings(dbData, this.journeyData._id)
      );

      this.presentToast("Booking Cancelled Successfully", "success");
      this.router.navigateByUrl("/tickets");

    } catch (error) {
      console.error(error);
      this.presentToast("Cancellation Failed", "danger");
    }

    this.loader = false;
  }

  async updateDbAfterCancel(data: any) {
    await firstValueFrom(
      this.api.updateBookings(data, this.journeyData._id)
    );
  }

  isNewApi(): boolean {
    return this.journeyData?.source === 'NEW_API';
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toast.create({
      message,
      color,
      duration: 3000,
      position: "bottom"
    });
    await toast.present();
  }
}


// cancelTicket() {
//   this.loader = true;
//   const seatNumbers = this.journeyData.Passengers.map((item: any) => item.SeatNo);
//   const seatNumbersString = seatNumbers.join(',');
//   let data = {
//     "PNR": this.journeyData.PNRNo,
//     "TicketNo": this.journeyData.TicketNo,
//     "SeatNos": seatNumbersString
//   }



//   this.api.serverRequest("POST", environment.busTranApi + "CancelSeats", data).subscribe(async res => {
//     console.log(res);
//     let body = JSON.parse(res.body);
//     let status = body.success;

//     if (!status) {
//       this.presentToast(body?.Error.Msg, "danger");
//       this.loader = false;
//       return;
//     }

//     let data = body.data;

//     let dbData = {
//       "NewHoldId": data.NewHoldId,
//       "NewTotalFare": data.NewTotalFare,
//       "ChargeAmt": data.ChargeAmt,
//       "ChargePct": data.ChargePct,
//       "RefundAmount": data.RefundAmount,
//       "TotalFare": data.TotalFare,
//       "NewTicketNo": data.NewTicketNo,
//       "NewPNRNo": data.NewPNRNo,
//       "status": "Cancel"
//     }

//     this.api.updateBookings(dbData, this.journeyData._id).subscribe(res => {
//       this.presentToast("Booking cancelled", "success");
//       this.router.navigateByUrl("/tickets");
//       this.loader = false;
//     }, error => {
//       console.error(error);
//       this.presentToast("Something Went Wrong!", "danger");
//       this.loader = false;
//     });

//   });
// }

// async presentAlert() {
//   const alert = await this.alertController.create({
//     header: 'Do you really want to cancel the ticket?',
//     message: 'Refund amount is ₹' + this.ticketDetails.RefundAmount,
//     buttons: [
//       {
//         text: 'Cancel',
//         role: 'cancel'
//       },
//       {
//         text: 'OK',
//         role: 'confirm',
//         handler: () => {
//           this.cancelTicket();
//         },
//       },
//     ],
//   });

//   await alert.present();

// }

// async presentToast(message: string, color: string) {
//   const toast = await this.toast.create({
//     message: message,
//     color: color,
//     duration: 3000,
//     position: "bottom"
//   });

//   await toast.present();
// }

