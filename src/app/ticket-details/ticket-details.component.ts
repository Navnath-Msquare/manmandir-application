import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../core/services/api.service';
import { AlertController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.css']
})
export class TicketDetailsComponent implements OnInit {

  journeyData: any = [];
  ticketDetails: any = [];
  loader = false;
  cancellationPolicyText: string = '';
  cancellationPolicySlabs: any[] = [];

  constructor(public route: ActivatedRoute, public api: ApiService, public toast: ToastController, private alertController: AlertController,
    public router: Router, private location: Location
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params: any) => {

      const res: any = await firstValueFrom(
        this.api.getBookings({ _id: params.id }, 1, 1, "")
      );

      this.journeyData = res.data[0];

      await this.getCancellationDetails();

      const action = params.action;
      if (action === 'notify-booking' || action === 'notify-cancellation') {
        // Remove action from URL so it doesn't fire again on reload
        this.location.replaceState(`/ticket-details?id=${params.id}`);
        setTimeout(() => {
          this.generateAndSendPDF(action === 'notify-cancellation' ? 'cancellation' : 'booking');
        }, 1500);
      }
    });
  }

  getTotalFare(): number {
    if (this.journeyData?.TotalFare) return Number(this.journeyData.TotalFare);
    if (this.journeyData?.total_fare) return Number(this.journeyData.total_fare);
    if (this.journeyData?.fare) return Number(this.journeyData.fare);
    if (this.journeyData?.TotalAmount) return Number(this.journeyData.TotalAmount);
    if (this.journeyData?.amount) return Number(this.journeyData.amount);
    
    if (Array.isArray(this.journeyData?.Passengers) && this.journeyData.Passengers.length > 0) {
      const sum = this.journeyData.Passengers.reduce((acc: number, p: any) => {
        const fare = Number(p.Fare || p.fare || p.Price || p.price || 0);
        return acc + fare;
      }, 0);
      if (sum > 0) return sum;
    }
    
    return 0;
  }

  async generateAndSendPDF(type: string) {
    const element = document.getElementById('ticket-pdf-content');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const base64Data = pdf.output('datauristring'); // data:application/pdf;base64,...

      await firstValueFrom(
        this.api.sendNotifications(this.journeyData._id, {
          type: type,
          pdfBase64: base64Data
        })
      );
      console.log('Notifications sent successfully with PDF');
    } catch (e) {
      console.error('Failed to generate and send PDF', e);
    }
  }

  async getCancellationDetails() {
    if (this.journeyData?.status === 'Cancel' || this.journeyData?.IsCancelled) {
      this.ticketDetails = { IsCancellable: false };
      return;
    }

    const seatNumbers = this.journeyData.Passengers?.map((p: any) => p.SeatNo) || [];
    const seatNumbersString = seatNumbers.join(',');
    const ticketRef = this.journeyData.TicketNo || this.journeyData.PNRNo || this.journeyData.HoldId || '';

    try {
      if (this.isNewApi()) {
        const res: any = await firstValueFrom(
          this.api.serverRequestGds('POST', '/gds', {
            method: 'GET',
            endpoint: 'can_cancel.json',
            query: {
              ticket_number: ticketRef,
              seat_numbers: seatNumbersString,
              api_key: environment.newApikey
            }
          })
        );

        const result = res?.data?.result?.is_ticket_cancellable || res?.result?.is_ticket_cancellable;
        if (result?.is_cancellable !== false) {
          this.ticketDetails = {
            IsCancellable: true,
            RefundAmount: result?.refund_amount || 0,
            CancellationCharges: result?.cancellation_charges || 0,
            CancelPercent: result?.cancel_percent || 0
          };
          if (result) this.parseCancellationPolicy(result);
        } else {
          this.ticketDetails = { IsCancellable: true };
        }
      } else {
        const res: any = await firstValueFrom(
          this.api.serverRequest(
            "GET",
            environment.busTranApi +
            "IsCancellable?PNRNo=" + (this.journeyData.PNRNo || ticketRef) +
            "&TicketNo=" + ticketRef +
            "&seatNos=" + seatNumbersString,
            {}
          )
        );

        const body = JSON.parse(res.body);

        if (body.success) {
          this.ticketDetails = body.data || { IsCancellable: true };
          if (this.ticketDetails && this.ticketDetails.IsCancellable === undefined) {
            this.ticketDetails.IsCancellable = true;
          }
          this.parseCancellationPolicy(body.data);
        } else {
          this.ticketDetails = { IsCancellable: true };
        }
      }
    } catch (error) {
      console.error("Cancel check error", error);
      this.ticketDetails = { IsCancellable: true };
    }
  }

  parseCancellationPolicy(data: any) {
    this.cancellationPolicyText = '';
    this.cancellationPolicySlabs = [];

    if (!data) return;

    // Check for string policies first
    const policyCandidate = data.CancellationPolicy || 
                            data.cancellation_policy || 
                            data.CancellationPolicyText || 
                            data.cancellation_policy_text || 
                            data.policy || 
                            data.policy_with_details ||
                            data.Policy;

    if (policyCandidate) {
      if (typeof policyCandidate === 'string') {
        this.cancellationPolicyText = policyCandidate;
      } else if (Array.isArray(policyCandidate)) {
        this.cancellationPolicySlabs = this.mapPolicySlabs(policyCandidate);
      } else if (typeof policyCandidate === 'object') {
        this.cancellationPolicyText = JSON.stringify(policyCandidate);
      }
    }

    // Also check direct slabs fields
    const slabsCandidate = data.CancellationSlabs || 
                           data.cancellation_slabs || 
                           data.slabs || 
                           data.Slabs;
    if (Array.isArray(slabsCandidate) && this.cancellationPolicySlabs.length === 0) {
      this.cancellationPolicySlabs = this.mapPolicySlabs(slabsCandidate);
    }
  }

  mapPolicySlabs(slabs: any[]): any[] {
    return slabs.map((slab: any) => {
      const timeFrame = slab.timeFrame || slab.TimeFrame || slab.PolicyText || slab.policy_text || 
                        slab.cutoff_time || slab.cutoff_time_hour || slab.duration ||
                        (slab.from_time && slab.to_time ? `${slab.from_time} to ${slab.to_time} hrs` : '') ||
                        '';
      
      const deduction = slab.deduction || slab.Deduction || slab.deduction_amount || slab.cancellation_charge ||
                        slab.cancellation_fee || slab.charge || slab.cancel_percent || slab.cancellation_charges ||
                        (slab.cancellation_charge_percent !== undefined ? `${slab.cancellation_charge_percent}%` : '') ||
                        (slab.charge_percent !== undefined ? `${slab.charge_percent}%` : '') ||
                        '';
                        
      const refund = slab.refund || slab.Refund || slab.refund_amount || slab.refund_percent ||
                     (slab.refund_percent !== undefined ? `${slab.refund_percent}%` : '') ||
                     (slab.refund_in_percent !== undefined ? `${slab.refund_in_percent}%` : '') ||
                     '';
                     
      return {
        timeFrame: timeFrame || 'N/A',
        deduction: deduction !== undefined ? deduction : 'N/A',
        refund: refund !== undefined ? refund : 'N/A'
      };
    });
  }

  async presentAlert() {
    let policyHtml = '';
    if (this.cancellationPolicyText) {
      policyHtml = `<div style="font-size: 11px; margin-top: 10px; color: #666; max-height: 80px; overflow-y: auto; text-align: left;">
        <strong>Policy:</strong> ${this.cancellationPolicyText}
      </div>`;
    } else if (this.cancellationPolicySlabs && this.cancellationPolicySlabs.length > 0) {
      let slabsHtml = this.cancellationPolicySlabs.map(s => 
        `<tr>
          <td style="padding: 4px 0; font-size: 10px; color: #555; text-align: left;">${s.timeFrame}</td>
          <td style="padding: 4px 0; font-size: 10px; color: #d32f2f; text-align: right;">${s.deduction}</td>
        </tr>`
      ).join('');
      policyHtml = `<div style="margin-top: 10px;">
        <strong style="font-size: 11px; color: #333; display: block; text-align: left; margin-bottom: 4px;">Policy Slabs:</strong>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #eee; text-align: left;">
              <th style="font-size: 10px; padding-bottom: 2px; color: #888; text-align: left;">Time Frame</th>
              <th style="font-size: 10px; padding-bottom: 2px; color: #888; text-align: right;">Deduction</th>
            </tr>
          </thead>
          <tbody>
            ${slabsHtml}
          </tbody>
        </table>
      </div>`;
    }

    const alert = await this.alertController.create({
      header: 'Confirm Cancellation',
      subHeader: 'Please review the cancellation details below:',
      message: `
        <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">Total Fare:</span>
            <span style="font-size: 12px; font-weight: 600; color: #333;">₹${this.getTotalFare()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 12px; color: #666;">Deduction Charges:</span>
            <span style="font-size: 12px; font-weight: 600; color: #e04040;">₹${this.ticketDetails?.CancellationCharges ?? 0}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #eee;">
            <span style="font-size: 13px; font-weight: bold; color: #111;">Estimated Refund:</span>
            <span style="font-size: 13px; font-weight: bold; color: #2dd36f;">₹${this.ticketDetails?.RefundAmount ?? 0}</span>
          </div>
        </div>
        ${policyHtml}
      `,
      buttons: [
        { 
          text: 'No, Keep Ticket', 
          role: 'cancel'
        },
        {
          text: 'Yes, Cancel Ticket',
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
              ticket_number: this.journeyData.TicketNo || this.journeyData.PNRNo || this.journeyData.HoldId,
              seat_numbers: seatNumbersString,
              api_key: environment.newApikey
            }
          })
        );
        const cancelData = cancelRes?.data?.result?.cancel_ticket;
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
          GstAmount: cancelData.operator_gst_details?.igst_amount || 0,
          cancellationPolicy: this.cancellationPolicyText || JSON.stringify(this.cancellationPolicySlabs) || '',
          cancellationStatus: "Cancelled",
          cancellationRef: cancelData.ticket_number || cancelData.pnr_number || this.journeyData.TicketNo,
          cancellationDate: new Date().toISOString()
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
          NewPNRNo: data.NewPNRNo,
          cancellationPolicy: this.cancellationPolicyText || JSON.stringify(this.cancellationPolicySlabs) || '',
          cancellationStatus: "Cancelled",
          cancellationRef: data.NewHoldId || data.NewTicketNo || data.NewPNRNo || this.journeyData.TicketNo,
          cancellationDate: new Date().toISOString()
        };
      }

      await firstValueFrom(
        this.api.updateBookings(dbData, this.journeyData._id)
      );

      this.presentToast("Booking Cancelled Successfully", "success");
      this.router.navigate(['/ticket-details'], { queryParams: { id: this.journeyData._id, action: 'notify-cancellation' } });

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

  async downloadTicketPDF() {
    const element = document.getElementById('ticket-pdf-content');
    if (!element) {
      this.presentToast('Ticket content not found', 'danger');
      return;
    }
    
    this.loader = true;
    this.presentToast('Generating PDF...', 'success');

    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true, // Allow cross-origin images to be rendered
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = this.journeyData?.PNRNo ? `Ticket_${this.journeyData.PNRNo}.pdf` : 'Ticket.pdf';
      
      if (Capacitor.isNativePlatform()) {
        const base64Data = pdf.output('datauristring').split(',')[1];
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents
        });
        this.presentToast(`Ticket saved to: ${result.uri}`, 'success');
      } else {
        pdf.save(fileName);
        this.presentToast('Ticket downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.presentToast('Failed to generate PDF', 'danger');
    } finally {
      this.loader = false;
    }
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

