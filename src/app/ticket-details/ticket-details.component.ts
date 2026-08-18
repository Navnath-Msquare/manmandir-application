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

      if (this.journeyData?.status === 'Cancel' || this.journeyData?.IsCancelled) {
        // Fetch cancelled ticket historical snapshot strictly from MongoDB (No GDS API call)
        try {
          const cancelledRes: any = await firstValueFrom(this.api.getCancelledTicket(params.id));
          if (cancelledRes?.status && cancelledRes?.data) {
            const cData = cancelledRes.data;
            this.journeyData = {
              ...this.journeyData,
              ChargeAmt: cData.cancellation?.cancellationCharge || cData.ChargeAmt || this.journeyData.ChargeAmt,
              RefundAmount: cData.cancellation?.refundAmount || cData.refund?.amount || cData.RefundAmount || this.journeyData.RefundAmount,
              cancellationStatus: cData.refund?.status || cData.cancellation?.status || this.journeyData.cancellationStatus,
              cancellationDate: cData.cancellation?.cancelledAt || this.journeyData.cancellationDate,
              cancellationRef: cData.cancellation?.cancellationId || this.journeyData.cancellationRef
            };
          }
        } catch (e) {
          console.error("Error fetching cancelled ticket from MongoDB:", e);
        }
      } else {
        await this.getCancellationDetails();
      }

      const action = params.action;
      if (action === 'notify-booking' || action === 'notify-cancellation') {
        // Clean URL action parameter
        this.location.replaceState(`/ticket-details?id=${params.id}`);
      }
    });
  }

  getTotalFare(): number {
    if (this.journeyData?.TotalFare && Number(this.journeyData.TotalFare) > 0) return Number(this.journeyData.TotalFare);
    if (this.journeyData?.total_fare && Number(this.journeyData.total_fare) > 0) return Number(this.journeyData.total_fare);
    if (this.journeyData?.fare && Number(this.journeyData.fare) > 0) return Number(this.journeyData.fare);
    if (this.journeyData?.TotalAmount && Number(this.journeyData.TotalAmount) > 0) return Number(this.journeyData.TotalAmount);
    if (this.journeyData?.amount && typeof this.journeyData.amount === 'number' && this.journeyData.amount > 0) return Number(this.journeyData.amount);
    if (this.journeyData?.amount?.totalBookingAmount) return Number(this.journeyData.amount.totalBookingAmount);
    if (this.journeyData?.amount?.ticketAmount) return Number(this.journeyData.amount.ticketAmount);
    if (this.journeyData?.PaidAmount && Number(this.journeyData.PaidAmount) > 0) return Number(this.journeyData.PaidAmount);
    
    if (Array.isArray(this.journeyData?.Passengers) && this.journeyData.Passengers.length > 0) {
      const sum = this.journeyData.Passengers.reduce((acc: number, p: any) => {
        const fare = Number(p.Fare || p.fare || p.Price || p.price || 0);
        return acc + fare;
      }, 0);
      if (sum > 0) return sum;
    }
    
    return 0;
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

  async generateAndSendPDF(type: string) {
    let base64Data: string | null = null;
    const element = document.getElementById('ticket-pdf-content');

    if (element) {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        if (canvas.width > 50 && canvas.height > 50) {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 280));
          base64Data = pdf.output('datauristring');
        }
      } catch (canvasErr) {
        console.warn('Frontend canvas generation skipped, backend will generate PDF:', canvasErr);
      }
    }

    try {
      if (this.journeyData?._id) {
        await firstValueFrom(
          this.api.sendNotifications(this.journeyData._id, {
            type: type,
            pdfBase64: base64Data
          })
        );
        console.log(`[${type}] Notifications dispatched successfully with PDF`);
      }
    } catch (e) {
      console.error('Failed to dispatch notifications', e);
    }
  }

  async getCancellationDetails() {
    if (this.journeyData?.status === 'Cancel' || this.journeyData?.IsCancelled) {
      this.ticketDetails = { IsCancellable: false };
      return;
    }

    try {
      const res: any = await firstValueFrom(this.api.getCancellationPreview(this.journeyData._id));
      if (res?.status) {
        this.ticketDetails = {
          IsCancellable: res.canCancel !== false,
          RefundAmount: res.refundAmount || 0,
          CancellationCharges: res.cancellationCharge || 0,
          CancelPercent: res.cancellationChargePercentage || 0
        };
        if (res.cancellationPolicy) {
          this.parseCancellationPolicy(res.cancellationPolicy);
        }
      } else {
        this.ticketDetails = { IsCancellable: true };
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

    try {
      const res: any = await firstValueFrom(this.api.cancelBookingApi(this.journeyData._id));

      if (res?.status) {
        this.presentToast("Booking Cancelled Successfully", "success");
        this.router.navigate(['/ticket-details'], { queryParams: { id: this.journeyData._id, action: 'notify-cancellation' } });
      } else {
        throw new Error(res?.message || "Cancellation Failed");
      }

    } catch (error: any) {
      console.error("Cancellation error:", error);
      const errMsg = error?.error?.message || error?.message || "Cancellation Failed";
      this.presentToast(errMsg, "danger");
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

