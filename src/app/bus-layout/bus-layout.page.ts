import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import * as _ from 'lodash';
import { ModalController, ToastController, IonRouterOutlet, LoadingController, Platform, } from '@ionic/angular';
import { Dir } from 'fs';
import { dir, log } from 'console';
import { AuthenticationService } from '../core/services/authentication.service';
import { BookingSummaryComponent } from '../booking-summary/booking-summary.component';
import { environment } from 'src/environments/environment';
import * as moment from 'moment-timezone';
import { App } from '@capacitor/app';

function sanitizeText(str: string): string {
  if (!str) return '';
  let cleaned = str.replace(/(contact|phone|mobile|mob|tele|tel)\s*[-:]?\s*[\d\s\-+\/]+/gi, '');
  cleaned = cleaned.replace(/\b(\+?91[\-\s]?)?[6-9]\d{9}\b/g, '');
  cleaned = cleaned.replace(/\b0\d{2,4}[\-\s]?\d{6,8}\b/g, '');
  cleaned = cleaned.replace(/\b\d{8,11}\b/g, '');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  let temp = cleaned.replace(/^(pickup\s+)?address\s*[-:]?\s*/i, '').trim();
  if (temp === '' || temp === '-' || temp === ':') {
    return '';
  }
  return cleaned;
}

@Component({
  selector: 'app-bus-layout',
  templateUrl: './bus-layout.page.html',
  styleUrls: ['./bus-layout.page.scss'],
})
export class BusLayoutPage implements OnInit {
  from = "";
  fromId = "";
  to = "";
  toId = "";
  date = "";
  busId = "";

  busList: any = [];
  Availability: any;

  upperlower: any = "Lower";
  lower: any;
  upper: any;
  rows: any;
  AllAmenities = [
    "Blanket",
    "Water Bottle",
    "Central TV",
    "WiFi",
    "Toilet",
    "Charging Point",
    "Personal TV",
    "Snacks",
    "GPS",
    "Newspaper",
    "Emergency Exit",
    "Facial Tissues",
    "Fire Extinguisher",
    "Hammer",
    "Reading Light",
    "Pillow",
    "Headsets",
    "Vomiting Bag",
    "Novel",
    "Heater",
    "CCTV",
    "Fan",
    "Water Bottle Holder",
    "First Aid Box",
    "Meal",
    "Extra Leg Space",
    "Social Distancing",
    "Staffs with facemask",
    "Hand Sanitizer",
    "Bus Sanitization",
    "Thermal Screening",
    "Partition between sleeper",
    "Bus Crew Covid Tested",
    "Passenger Face Mask"
  ];

  chartLayout: any = [];
  lowerRow: any = [];
  upperRow: any = [];
  litems: any = [];
  uitems: any = [];
  months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  busAmenities: any = [];
  pickups: any = [];
  dropOffs: any = [];
  seatNo: any = [];

  bookedData: any = [];
  modalName: any = "";
  pickupPoint: any = "";
  pickupPointIndex: any = "";
  dropoffPoint: any = "";
  dropoffPointIndex: any = "";
  fromState: any = "";
  toState: any = "";
  gstAmount: any = "";
  SeatFare: any = "";

  params: any;

  allData: any;
  isCardVisible: any
  public locationValue: string = 'boarding';
  public locationValues: Array<string> = ['boarding', 'dropping']

  isFareDetails: any = false;
  isBook: any = false;
  isAddPassenger: any = false;


  segmentData: any = 'Boarding';

  isGST = false;
  gstNo: any = "";
  businessName: any = "";
  email: any = "";
  mobile: any = "";
  name: any = "";

  holdId = "";
  holdLoader = false;
  pickupName: any = [];
  dropOffName: any = [];
  droptime: any;
  combinedList: any = [];
  fromNewCityId: any = '';
  fromOldCityId: any = '';
  toNewCityId: any = '';
  toOldCityId: any = '';
  source: any = '';
  scheduleId: any = '';
  gridTemplateColumnsLower: string = 'repeat(5, 1fr)';
  gridTemplateColumnsUpper: string = 'repeat(5, 1fr)';
  constructor(private route: ActivatedRoute, public api: ApiService, public router: Router, public location: Location, private toast: ToastController,
    public modalS: ModalController, public authS: AuthenticationService, public platform: Platform, private routerOutlet: IonRouterOutlet) { }

  ngOnInit() {
    this.name = this.authS.currentUserValue.name;
    this.email = this.authS.currentUserValue.email;
    this.mobile = this.authS.currentUserValue.mobile;
    this.route.queryParams
      .subscribe(params => {
        this.params = params;
        // let tempFrom = params['from'];
        // this.fromState = params['fromState'];

        // this.from = tempFrom.split("-")[0];
        // this.fromId = tempFrom.split("-")[1];

        // let tempTo = params['to'];
        // this.toState = params['toState'];
        // this.to = tempTo.split("-")[0];
        // this.toId = tempTo.split("-")[1];

        // this.date = params['date'];
        // this.busId = params['bus'];

        // FROM
        this.from = params['fromCity'];
        this.fromState = params['fromState'];
        this.fromNewCityId = params['fromNewCityId'];
        this.fromOldCityId = params['fromOldCityId'];

        // TO
        this.to = params['toCity'];
        this.toState = params['toState'];
        this.toNewCityId = params['toNewCityId'];
        this.toOldCityId = params['toOldCityId'];
        this.source = params['source'];
        // COMMON
        this.date = params['date'];
        this.busId = params['bus'];
        this.scheduleId = params['bus'];
        if (this.source == 'OLD_API') {
          this.fromId = this.fromOldCityId;
          this.toId = this.toOldCityId;
        } else {
          this.fromId = this.fromNewCityId;
          this.toId = this.toNewCityId;
        }

      }
      );

    this.getData();
  }


  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.isBook = false
      this.location.back()
      // this.router.navigate(['/home']);
    });
  }

  // getData() {

  //   this.api.serverRequest("GET", environment.busApi + "Chart?fromCityId=" + this.fromId + "&toCityId=" + this.toId + "&journeyDate=" + this.date + "&busId=" + this.busId, "").subscribe(res => {

  //     let data = (JSON.parse(res.body)).data;
  //     this.allData = data;

  //     console.log("chart api", data)
  //     this.lower = data.ChartLayout?.Layout["Lower"];
  //     this.upper = data.ChartLayout?.Layout["Upper"];
  //     this.chartLayout = data.ChartLayout;
  //     console.log(this.allData);
  //     this.litems = Array(this.chartLayout?.Info?.Lower?.MaxCols).fill(0);
  //     this.uitems = Array(this.chartLayout?.Info?.Upper?.MaxCols).fill(0);
  //     this.pickups = data.Pickups;
  //     this.pickupName = this.pickups[0].PickupName
  //     console.log(this.pickupName);
  //     console.log(this.pickupName[0].Picku pName);


  //     this.dropOffs = data.Dropoffs;
  //     this.dropOffName = this.dropOffs[0]?.DropoffName
  //     this.droptime = this.dropOffs[0]?.DropoffTime

  //     console.log(this.dropOffName);
  //     console.log(this.droptime);


  //     let ar: any = [];
  //     for (let i = 0; i < this.lower.length; i++) {
  //       const obj: any = {};
  //       obj['index'] = this.lower[i][0];
  //       obj['row'] = this.lower[i][1];
  //       obj['col'] = this.lower[i][2];
  //       obj['width'] = this.lower[i][3];
  //       obj['height'] = this.lower[i][4];
  //       obj['seat_type'] = this.lower[i][5];

  //       ar.push(obj);
  //     }
  //     const finalData: any = {};
  //     ar.forEach((obj: any) => {
  //       const row = obj['row'].toString();
  //       const { index, col, width, height, seat_type } = obj;
  //       const seatObj = { seat: "Lower", index, col, width, height, seat_type };
  //       if (finalData[row]) {
  //         finalData[row].ar.push(seatObj);
  //       } else {
  //         finalData[row] = { row, ar: [seatObj] };
  //       }
  //     });

  //     const output = Object.values(finalData);
  //     this.lowerRow = output;
  //     let statusIndex = 0;
  //     for (let i = 0; i < this.lowerRow.length; i++) {
  //       const row = this.lowerRow[i].ar;
  //       for (let j = 0; j < row.length; j++) {
  //         const seat = row[j];
  //         seat.status = data.SeatsStatus.Status[statusIndex];
  //         seat.fare = data.SeatsStatus.Fares[statusIndex][0];
  //         statusIndex = (statusIndex + 1) % data.SeatsStatus.Status.length;
  //       }
  //     }

  //     let ar1: any = [];
  //     if (this.upper) {
  //       for (let i = 0; i < this.upper.length; i++) {
  //         const obj: any = {};
  //         obj['index'] = this.upper[i][0];
  //         obj['row'] = this.upper[i][1];
  //         obj['col'] = this.upper[i][2];
  //         obj['width'] = this.upper[i][3];
  //         obj['height'] = this.upper[i][4];
  //         obj['seat_type'] = this.upper[i][5];

  //         ar1.push(obj);
  //       }

  //       const finalData1: any = {};
  //       ar1.forEach((obj: any) => {
  //         const row = obj['row'].toString();
  //         const { index, col, width, height, seat_type } = obj;
  //         const seatObj = { seat: "Upper", index, col, width, height, seat_type };
  //         if (finalData1[row]) {
  //           finalData1[row].ar.push(seatObj);
  //         } else {
  //           finalData1[row] = { row, ar: [seatObj] };
  //         }
  //       });

  //       const output1 = Object.values(finalData1);
  //       this.upperRow = output1;
  //       let statusIndex1 = Math.floor(data.ChartSeats.Seats.length / 2);
  //       for (let i = 0; i < this.upperRow.length; i++) {
  //         const row = this.upperRow[i].ar;
  //         for (let j = 0; j < row.length; j++) {
  //           const seat = row[j];
  //           seat.status = data.SeatsStatus.Status[statusIndex1];
  //           seat.fare = data.SeatsStatus.Fares[statusIndex1][0];
  //           statusIndex1 = (statusIndex1 + 1) % data.SeatsStatus.Status.length;
  //         }
  //       }
  //     }
  //   });

  //   this.api.serverRequest("GET", environment.busApi + "SearchBus?fromCityId=" + this.fromId + "&toCityId=" + this.toId + "&journeyDate=" + this.date + "&busId=" + this.busId, "").subscribe(res => {

  //     let data = (JSON.parse(res.body)).data;
  //     this.busList = data.Buses[0];
  //     console.log(this.busList);

  //     // this.gstAmount = this.busList.BusStatus.BaseFares[0];
  //     // this.SeatFare = this.busList.BusStatus.BaseFares[0];
  //     console.log(data);
  //     this.Availability = this.busList.BusStatus?.Availability;
  //     this.busAmenities = this.busList.Amenities


  //   });
  // }

  getData() {
    // ===============================
    // OLD API CALL
    // ===============================
    if (this.source == 'OLD_API') {
      // OLD API
      this.api.serverRequest(
        "GET",
        `${environment.busApi}Chart?fromCityId=${this.fromId}&toCityId=${this.toId}&journeyDate=${this.date}&busId=${this.busId}`,
        ""
      ).subscribe(res => {
        const data = JSON.parse(res.body).data;
        if (!data) {
          console.error("No data returned from Chart API");
          return;
        }
        this.allData = data;

        const lowerLayout = (data.ChartLayout?.Layout && data.ChartLayout.Layout["Lower"]) || [];
        const upperLayout = (data.ChartLayout?.Layout && data.ChartLayout.Layout["Upper"]) || [];

        // Lower seats
        this.lower = lowerLayout.length > 0;
        this.upper = upperLayout.length > 0;
        this.chartLayout = data.ChartLayout;

        this.litems = Array(this.chartLayout?.Info?.Lower?.MaxCols || 5).fill(0);
        this.uitems = Array(this.chartLayout?.Info?.Upper?.MaxCols || 5).fill(0);

        // Pickups
        this.pickups = (data.Pickups || []).map((p: any) => ({
          ...p,
          PickupName: sanitizeText(p.PickupName),
          Address: sanitizeText(p.Address),
          Contact: ''
        }));
        this.pickupName = this.pickups.length > 0 ? this.pickups[0]?.PickupName : '';

        // Dropoffs
        this.dropOffs = (data.Dropoffs || []).map((d: any) => ({
          ...d,
          DropoffName: sanitizeText(d.DropoffName),
          Address: sanitizeText(d.Address),
          Contact: ''
        }));
        this.dropOffName = this.dropOffs.length > 0 ? this.dropOffs[0]?.DropoffName : '';
        this.droptime = this.dropOffs.length > 0 ? this.dropOffs[0]?.DropoffTime : '';

        // ===============================
        // Lower Row mapping
        // ===============================
        let ar: any = [];
        if (this.lower) {
          for (let i = 0; i < lowerLayout.length; i++) {
            const obj: any = {};
            obj['index'] = lowerLayout[i][0];
            obj['row'] = lowerLayout[i][1];
            obj['col'] = lowerLayout[i][2];
            obj['width'] = lowerLayout[i][3];
            obj['height'] = lowerLayout[i][4];
            obj['seat_type'] = lowerLayout[i][5];
            ar.push(obj);
          }
        }

        const finalData: any = {};
        ar.forEach((obj: any) => {
          const row = obj['row'].toString();
          const { index, col, width, height, seat_type } = obj;
          const seatObj = { seat: "Lower", index, col, width, height, seat_type };
          if (finalData[row]) finalData[row].ar.push(seatObj);
          else finalData[row] = { row, ar: [seatObj] };
        });

        const output = Object.values(finalData);
        this.lowerRow = output;

        let statusIndex = 0;
        if (data.SeatsStatus && data.SeatsStatus.Status) {
          for (let i = 0; i < this.lowerRow.length; i++) {
            const row = this.lowerRow[i].ar;
            for (let j = 0; j < row.length; j++) {
              const seat = row[j];
              seat.status = data.SeatsStatus.Status[statusIndex];
              seat.fare = data.SeatsStatus.Fares[statusIndex] ? data.SeatsStatus.Fares[statusIndex][0] : 0;
              statusIndex = (statusIndex + 1) % data.SeatsStatus.Status.length;
            }
          }
        }

        // ===============================
        // Upper Row mapping
        // ===============================
        if (this.upper) {
          let ar1: any = [];
          for (let i = 0; i < upperLayout.length; i++) {
            const obj: any = {};
            obj['index'] = upperLayout[i][0];
            obj['row'] = upperLayout[i][1];
            obj['col'] = upperLayout[i][2];
            obj['width'] = upperLayout[i][3];
            obj['height'] = upperLayout[i][4];
            obj['seat_type'] = upperLayout[i][5];
            ar1.push(obj);
          }

          const finalData1: any = {};
          ar1.forEach((obj: any) => {
            const row = obj['row'].toString();
            const { index, col, width, height, seat_type } = obj;
            const seatObj = { seat: "Upper", index, col, width, height, seat_type };
            if (finalData1[row]) finalData1[row].ar.push(seatObj);
            else finalData1[row] = { row, ar: [seatObj] };
          });

          const output1 = Object.values(finalData1);
          this.upperRow = output1;

          let statusIndex1 = Math.floor((data.ChartSeats?.Seats?.length || 0) / 2);
          if (data.SeatsStatus && data.SeatsStatus.Status) {
            for (let i = 0; i < this.upperRow.length; i++) {
              const row = this.upperRow[i].ar;
              for (let j = 0; j < row.length; j++) {
                const seat = row[j];
                seat.status = data.SeatsStatus.Status[statusIndex1];
                seat.fare = data.SeatsStatus.Fares[statusIndex1] ? data.SeatsStatus.Fares[statusIndex1][0] : 0;
                statusIndex1 = (statusIndex1 + 1) % data.SeatsStatus.Status.length;
              }
            }
          }
        }

        if (!this.lower && this.upper) {
          this.upperlower = 'Upper';
        } else {
          this.upperlower = 'Lower';
        }

        this.updateGridTemplateColumns();

        // Bus info
        this.api.serverRequest(
          "GET",
          `${environment.busApi}SearchBus?fromCityId=${this.fromId}&toCityId=${this.toId}&journeyDate=${this.date}&busId=${this.busId}`,
          ""
        ).subscribe(res => {
          if (!res || !res.body) return;
          let parsed;
          try {
            parsed = JSON.parse(res.body);
          } catch (e) { return; }
          const dataBus = parsed.data;
          if (dataBus && dataBus.Buses && dataBus.Buses.length > 0) {
            this.busList = dataBus.Buses.find((bus: any) => bus.RouteBusId == this.busId) || dataBus.Buses[0];
            console.log(this.busList)
            this.Availability = this.busList.BusStatus?.Availability;
            this.busAmenities = this.busList.Amenities;
          }
        });
      });
    }
    else {
      console.log("calling new GDS API");
      const scheduleId = this.busId;

      // =================== Fetch bus layout ===================
      this.api.serverRequestGds('POST', '/gds', {
        method: 'GET',
        endpoint: `schedule/${scheduleId}.json`,
        query: { api_key: environment.newApikey }
      }).subscribe(res => {
        const data = res?.data?.result;
        if (!data || !data.bus_layout) return;


        console.log(data)
        // =================== BUS INFO ===================
        const journeyDate = data.travel_date;

        this.busList = {
          CompanyName: data.travels_name,
          DeptTime: new Date(`${journeyDate}T${data.dep_time}:00`),
          ArrTime: new Date(`${journeyDate}T${data.arr_time}:00`),
          Duration: data.duration,
          BusName: data.name || data.travels_name,
          BusType: data.bus_type,
          Amenities: data.amenities ? JSON.parse(data.amenities) : [],
          BusStatus: { Availability: data.available_seats }
        };

        // =================== FARE MAP ===================
        const fareMap: any = {};
        const seatNames: any = {};
        (data.bus_layout.available || '')
          .split(',')
          .filter(Boolean)
          .forEach((x: string) => {
            const [seat, fare] = x.split('|');
            fareMap[seat] = +fare;
            seatNames[seat] = seat;
          });

        this.allData = { ChartSeats: { Seats: seatNames } };

        // =================== LAYOUT PARSER ===================
        const rows = data.bus_layout.coach_details.split(',');
        const lowerSeats: any[] = [];
        const upperSeats: any[] = [];
        let index = 0;
        let maxCols = 0;

        rows.forEach((rowStr: string, rowIndex: number) => {
          const cols = rowStr.split('-');
          maxCols = Math.max(maxCols, cols.length);
          const totalLowerRows = rows.length;

          cols.forEach((cell: string, colIndex: number) => {
            if (!cell || cell.includes('.GY') || cell.includes('--')) return;
            if (!cell.includes('|')) return;

            const [seatNo, seatType] = cell.split('|');
            if (!seatNo) return;

            const seatTypeUpper = (seatType || '').toUpperCase();
            let seat_type = 1;           // seater
            if (seatTypeUpper.includes('SL') || seatTypeUpper.includes('UB') || seatTypeUpper.includes('LB')) seat_type = 2; // sleeper
            if (seatTypeUpper.includes('DU')) seat_type = 4; // double sleeper

            const isUpper = seatNo.toUpperCase().startsWith('U') ||
              seatNo.toUpperCase().endsWith('UB') ||
              seatNo.toUpperCase().includes('UB') ||
              seatTypeUpper.startsWith('U') ||
              seatTypeUpper.endsWith('UB') ||
              seatTypeUpper.includes('UB');
            const seat = {
              seat: isUpper ? 'Upper' : 'Lower',
              index: index++,
              row: isUpper ? rowIndex + totalLowerRows : rowIndex,
              col: colIndex,
              width: 1,
              height: 1,
              seat_type,
              status: fareMap[seatNo] ? 1 : 0,
              fare: fareMap[seatNo] || 0,
              seat_no: seatNo
            };

            seat.seat === 'Lower'
              ? lowerSeats.push(seat)
              : upperSeats.push(seat);
          });
        });

        // =================== GROUP BY ROW ===================
        const groupByRow = (arr: any[]) => {
          const grouped: any = {};
          arr.forEach(s => {
            const r = Number(s.row);
            if (!grouped[r]) grouped[r] = { row: r, ar: [] };
            grouped[r].ar.push(s);
          });
          return Object.values(grouped);
        };

        // =================== AVAILABILITY COUNT (FIX) ===================
        const allSeats = [...lowerSeats, ...upperSeats];

        this.Availability = allSeats.filter(seat => seat.status === 1).length;

        this.busList.BusStatus = {
          Availability: this.Availability
        };

        this.upperRow = groupByRow(upperSeats);
        this.lowerRow = groupByRow(lowerSeats);

        this.lower = this.lowerRow.length > 0;
        this.upper = this.upperRow.length > 0;

        if (!this.lower && this.upper) {
          this.upperlower = 'Upper';
        } else {
          this.upperlower = 'Lower';
        }

        console.log("maxcol length", maxCols)
        // Max columns for rendering in UI
        this.chartLayout = {
          Info: {
            Lower: { MaxCols: maxCols },
            Upper: { MaxCols: maxCols }
          }
        };

        this.litems = new Array(maxCols);
        this.uitems = new Array(maxCols);

        this.updateGridTemplateColumns();

        console.log('LAYOUT OK', {
          lowerSeats: lowerSeats.length,
          upperSeats: upperSeats.length,
          total: lowerSeats.length + upperSeats.length
        });

        // =================== PICKUP / DROPOFF =================== 
        let stageNames = {};
        try {
          stageNames = JSON.parse(localStorage.getItem('stageNames') || '{}');
        } catch (e) { }

        this.pickups = this.parseStages(
          data.bus_layout.boarding_stages,
          'pickup',
          stageNames
        );

        this.dropOffs = this.parseStages(
          data.bus_layout.dropoff_stages,
          'drop',
          stageNames
        );

        this.pickupName = this.pickups[0]?.PickupName;
        this.dropOffName = this.dropOffs[0]?.DropoffName;
        this.droptime = this.dropOffs[0]?.DropoffTime;

        console.log(this.pickups)
      });
    }

  }

  parseStages(stageStr: string, type: 'pickup' | 'drop', stageNames?: any) {
    if (!stageStr) return [];

    return stageStr
      .split('~')
      .filter(Boolean)
      .map((s: string) => {
        const p = s.split('|');
        const stageId = p[0] || '';
        const realName = stageNames?.[stageId] || '';

        if (type === 'pickup') {
          const PickupId = p[0] || '';
          const PickupTime = p[1] || '';
          const PickupName = sanitizeText(realName || p[2] || '');
          const PickupLandmark = p[3] || '';
          const PickupPhone = '';
          const PickupArea = p[5] || '';

          return {
            PickupId,
            PickupTime,
            PickupName,
            PickupLandmark,
            PickupPhone,
            PickupArea,

            // ✅ Common keys (for template)
            Address: sanitizeText(PickupLandmark || PickupArea || ''),
            Contact: ''
          };
        }

        const DropoffId = p[0] || '';
        const DropoffTime = p[1] || '';
        const DropoffName = sanitizeText(realName || p[2] || '');
        const DropoffLandmark = p[3] || '';
        const DropoffPhone = '';
        const DropoffArea = p[5] || '';

        return {
          DropoffId,
          DropoffTime,
          DropoffName,
          DropoffLandmark,
          DropoffPhone,
          DropoffArea,

          Address: sanitizeText(DropoffLandmark || DropoffArea || ''),
          Contact: ''
        };
      });
  }

  getSeatObject(col: number, arr: any[]) {
    return arr.find(s => s.col === col);
  }


  // ADD this new method
  getColumnArray(deck: string): number[] {
    const maxCols = deck === 'Lower'
      ? (this.chartLayout?.Info?.Lower?.MaxCols || 5)
      : (this.chartLayout?.Info?.Upper?.MaxCols || 5);
    return Array.from({ length: maxCols }, (_, i) => i);
  }

  back() {
    this.location.back();
  }

  getCol(i: any, arr: any) {
    return arr.some((obj: any) => obj.col === i);
  }

  getSeatNo(i: any, arr: any) {
    if (arr.some((obj: any) => obj.col === i)) {
      let index = arr.findIndex((item: any) => item.col == i);
      return arr[index].index;
    }
  }

  getSeatType(i: any, arr: any) {
    if (arr.some((obj: any) => obj.col === i)) {
      let index = arr.findIndex((item: any) => item.col == i);
      return arr[index].seat_type;
    }
  }

  getSeatPrice(i: any, arr: any) {
    if (arr.some((obj: any) => obj.col === i)) {
      let index = arr.findIndex((item: any) => item.col == i);
      return arr[index].fare;
    }
  }

  getSeatStatus(i: any, arr: any) {
    if (arr.some((obj: any) => obj.col === i)) {
      let index = arr.findIndex((item: any) => item.col == i);
      return arr[index].status;
    }
  }

  // getSelectedSeat(i: any, arr: any) {
  //   console.log(i, arr)
  //   this.isCardVisible = true;
  //   console.log(arr);
  //   if (arr.some((obj: any) => obj.col === i)) {
  //     let index = arr.findIndex((item: any) => item.col == i);
  //     if (this.bookedData.some((res: any) => res.index == arr[index].index)) {
  //       let index1 = this.bookedData.findIndex((item: any) => item.index == arr[index].index);
  //       this.bookedData.splice(index1, 1);
  //     } else {
  //       arr[index].seatNo = this.allData.ChartSeats.Seats[arr[index].index];
  //       this.bookedData.push(arr[index]);
  //     }
  //     this.getSeatFare();
  //   }
  // }

  getSelectedSeat(i: any, arr?: any) {
    this.isCardVisible = true;

    let seat: any;
    if (arr && Array.isArray(arr)) {
      if (arr.some((obj: any) => obj.col === i)) {
        const index = arr.findIndex((item: any) => item.col == i);
        seat = arr[index];
      } else {
        return;
      }
    } else {
      seat = i; // The first argument is the seat object itself
    }

    if (!seat) return;

    // REMOVE seat
    if (this.bookedData.some((res: any) => res.index == seat.index)) {
      const index1 = this.bookedData.findIndex(
        (item: any) => item.index == seat.index
      );
      this.bookedData.splice(index1, 1);
    }
    // ADD seat
    else {
      seat.seatNo =
        seat.seat_no ||                              // NEW API
        this.allData?.ChartSeats?.Seats?.[seat.index]; // OLD API

      this.bookedData.push(seat);
    }

    this.getSeatFare();
  }

  isSeatSelected(seat: any): boolean {
    return this.bookedData.some((res: any) => res.index === seat.index);
  }

  updateGridTemplateColumns() {
    this.gridTemplateColumnsLower = this.calculateGridTemplateColumns('Lower');
    this.gridTemplateColumnsUpper = this.calculateGridTemplateColumns('Upper');
  }

  calculateGridTemplateColumns(deck: 'Lower' | 'Upper'): string {
    const maxCols = deck === 'Lower'
      ? (this.chartLayout?.Info?.Lower?.MaxCols || 5)
      : (this.chartLayout?.Info?.Upper?.MaxCols || 5);

    const rows = deck === 'Lower' ? this.lowerRow : this.upperRow;
    if (!rows || rows.length === 0) {
      return `repeat(${maxCols}, 1fr)`;
    }

    const activeCols = new Set<number>();
    rows.forEach((row: any) => {
      if (row && row.ar) {
        row.ar.forEach((seat: any) => {
          if (seat && typeof seat.col === 'number') {
            activeCols.add(seat.col);
          }
        });
      }
    });

    const colWidths: string[] = [];
    let prevWasEmpty = false;
    for (let c = 0; c < maxCols; c++) {
      if (activeCols.has(c)) {
        colWidths.push('1fr');
        prevWasEmpty = false;
      } else {
        if (prevWasEmpty) {
          colWidths.push('0fr');
        } else {
          colWidths.push('0.4fr');
          prevWasEmpty = true;
        }
      }
    }
    return colWidths.join(' ');
  }

  selectedSeat(arr: any, index: any) {

    let searched = false;
    this.bookedData.map((res: any) => {
      if (index === res.index) {
        searched = true;
      }
    })
    if (searched) {
      return true;
    } else {
      return false;
    }
  }

  gstcalculate() {
    let gst = 0;
    console.log(this.bookedData)
    this.bookedData.map((res: any) => {
      this.seatNo = (res.seatNo);
      // gst = (res.SeatFare * 1)+ (this.SeatFare);
      console.log(res)
      if (this.allData?.SeatsStatus?.Fares?.[res.index]) {
        gst = (gst * 1) + (res.fare - this.allData.SeatsStatus.Fares[res.index][1]);
      } else {
        gst = 0;
      }
    })
    return gst * 1;
  }
  calculateFare() {
    let fare = 0;
    this.bookedData.map((res: any) => {
      fare = (fare * 1) + (res.fare * 1);
    })
    return fare;
  }

  getSeatFare() {
    this.SeatFare = this.bookedData.reduce((total: any, aData: any) => Number(total) + Number(aData.fare), 0);
  }


  onTabChanged(tabName: any) {
    this.locationValue = tabName;
  }

  getBoarding(event: any) {
    this.pickupPoint = {};
    this.pickupPointIndex = event.target.value;
    this.pickupPoint = this.pickups[event.target.value];
    this.segmentData = 'Dropping';
    if (this.dropoffPoint != undefined && this.dropoffPoint != '' && this.dropoffPoint != null && this.pickupPoint != undefined && this.pickupPoint != '' && this.pickupPoint != null) {
      this.modalS.dismiss();
    }
  }

  getDropping(event: any) {
    this.dropoffPoint = {};
    this.dropoffPointIndex = event.target.value;
    this.dropoffPoint = this.dropOffs[event.target.value];
    if (this.dropoffPoint != undefined && this.dropoffPoint != '' && this.dropoffPoint != null && this.pickupPoint != undefined && this.pickupPoint != '' && this.pickupPoint != null) {
      this.modalS.dismiss();
    }
  }

  openGuestDetails() {
    if (this.pickupPoint == "" && this.dropoffPoint == "") {
      this.presentToast("Please. select pickup and dropping point", "danger")
    }
    else {
      this.router.navigate(['/guest-details'], {
        state: {
          bookedData: this.bookedData,
          pickups: this.pickupPoint,
          dropoffs: this.dropoffPoint,
          journeyDetails: this.params,
          busDetails: this.busList,
          fare: this.calculateFare()
        }
      })
    }
  }


  combineLists() {
    const pickups = this.busList.Pickups.map((item: { PickupName: any; PickupTime: any; }) => ({
      name: item.PickupName,
      time: item.PickupTime,
      type: 'pickup'
    }));

    const dropoffs = this.busList.Dropoffs.map((item: { DropoffName: any; DropoffTime: any; }) => ({
      name: item.DropoffName,
      time: item.DropoffTime,
      type: 'dropoff'
    }));

    this.combinedList = [...pickups, ...dropoffs];
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

  goBack(): void {
    this.location.back();
  }

  limitAge(event: any, item: any) {
    let value = event.target.value;
    if (value !== undefined && value !== null) {
      let valStr = value.toString().replace(/[^0-9]/g, '');
      if (valStr.length > 3) {
        valStr = valStr.slice(0, 3);
      }
      item.age = valStr;
      event.target.value = valStr;
    }
  }

  async holdSeat() {
    this.holdLoader = true;

    if (this.pickupPoint == "" && this.dropoffPoint == "") {
      this.presentToast("Please. select pickup and dropping point", "danger");
      this.holdLoader = false;
      return;
    }

    for (let i = 0; i < this.bookedData.length; i++) {

      if (!this.bookedData[i].name || this.bookedData[i].name == "") {
        this.presentToast("Please Enter Your Name", "danger");
        this.holdLoader = false;
        return;
      }

      if (!this.bookedData[i].age || this.bookedData[i].age == "") {
        this.presentToast("Please Enter Your Age", "danger");
        this.holdLoader = false;
        return;
      }

      if (this.bookedData[i].age.toString().length > 3) {
        this.presentToast("Please Enter a Valid Age (max 3 digits)", "danger");
        this.holdLoader = false;
        return;
      }

    }

    if (this.source === 'OLD_API') {
      this.holdSeatOldAPI();
    } else {
      this.holdSeatNewAPI();
    }
  }


  holdSeatOldAPI() {
    let passengers: any = [];
    for (let i = 0; i < this.bookedData.length; i++) {
      passengers.push({
        "Name": this.bookedData[i].name, "Age": parseInt(this.bookedData[i].age), "Gender": this.bookedData[i].gender,
        "SeatNo": this.bookedData[i].seatNo.toString(), "Fare": this.bookedData[i].fare, "SeatTypeId": this.bookedData[i].seat_type,
        "IsAcSeat": false
      })
    }
    let data = {
      "FromCityId": parseInt(this.fromId),
      "ToCityId": parseInt(this.toId),
      "JourneyDate": moment(new Date(this.date)).format('YYYY-MM-DD'),
      "BusId": parseInt(this.busId),
      "PickUpID": this.pickupPoint.PickupCode,
      "DropOffID": this.dropoffPoint.DropoffCode,
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


    this.api.serverRequest("POST", environment.busTranApi + "HoldSeats", data).subscribe(async res => {
      console.log(res);
      let body = JSON.parse(res.body);
      let status = body.success;

      if (res.statusCode != 200) {
        this.presentToast(body?.Message, "danger");
        this.holdLoader = false;
        return;
      }
      if (!status) {
        this.presentToast(body?.Error.Msg, "danger");
        this.holdLoader = false;
        return;
      }

      let data = body.data;
      this.holdId = data.HoldId;

      let passengersData: any = [];
      for (let i = 0; i < this.bookedData.length; i++) {
        passengersData.push({
          "Seat": this.bookedData[i].seat, "Name": this.bookedData[i].name, "Age": parseInt(this.bookedData[i].age), "Gender": this.bookedData[i].gender,
          "SeatNo": this.bookedData[i].seatNo.toString(), "Fare": this.bookedData[i].fare, "SeatTypeId": this.bookedData[i].seat_type,
          "IsAcSeat": false
        })
      }
      let dbData = {
        "FromCityId": parseInt(this.fromId),
        "ToCityId": parseInt(this.toId),
        "JourneyDate": this.date,
        "BusId": parseInt(this.busId),
        "PickUpID": this.pickupPoint.PickupCode,
        "DropOffID": this.dropoffPoint.DropoffCode,
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
        "HoldId": this.holdId,
        "user": this.authS.currentUserValue._id,
        "status": "Pending",
        "source": this.source
      }

      this.api.createBookings(dbData).subscribe(async res => {

        this.holdLoader = false;
        const modal = await this.modalS.create({
          component: BookingSummaryComponent,
          componentProps: {
            holdId: this.holdId,
            source: this.source,
            fare: this.calculateFare(),
            gst: this.gstcalculate(),
            busDetails: this.busList,
            pickups: this.pickupPoint,
            dropoffs: this.dropoffPoint,
            passengers: passengersData,
            from: this.from,
            fromState: this.fromState,
            fromId: this.fromId,
            to: this.to,
            toState: this.toState,
            toId: this.toId,
            busId: this.busId,
            date: this.date
          }
        });

        await modal.present();
      }, error => {
        console.log(error);
        this.presentToast("Something went wrong!", "danger");
        this.holdLoader = false;
      });

    });
  }

  holdSeatNewAPI() {

    if (!this.dropoffPoint || !this.dropoffPoint.DropoffId) {
      this.presentToast("Please select valid drop point", "danger");
      this.holdLoader = false;
      return;
    }

    if (!this.pickupPoint || !this.pickupPoint.PickupId) {
      this.presentToast("Please select valid pickup point", "danger");
      this.holdLoader = false;
      return;
    }

    // ---------- GDS seat payload ----------
    const seat_detail = this.bookedData.map((p: any) => ({
      seat_number: p.seatNo,
      fare: p.fare.toString(),
      title: "Mr",
      name: p.name,
      age: p.age.toString(),
      sex: p.gender === 'M' ? 'M' : 'F',
      is_primary: "true"
    }));

    const body = {
      book_ticket: {
        seat_details: { seat_detail },
        contact_detail: {
          mobile_number: this.mobile.toString(),
          email: this.email
        }
      },
      origin_id: this.fromId,
      destination_id: this.toId,
      boarding_at: this.pickupPoint.PickupId,
      drop_of: this.dropoffPoint.DropoffId,
      no_of_seats: this.bookedData.length.toString(),
      travel_date: moment(this.date).format('YYYY-MM-DD')
    };


    console.log(body)

    this.api.serverRequestGds('POST', '/gds', {
      method: 'POST',
      endpoint: `tentative_booking/${this.scheduleId}.json`,
      query: { api_key: environment.newApikey },
      body
    }).subscribe(res => {
      console.log(res)
      const pnr = res?.result?.ticket_details?.pnr_number;


      if (!pnr) {
        this.presentToast("GDS seat hold failed", "danger");
        this.holdLoader = false;
        return;
      }

      console.log(pnr)

      this.holdId = pnr;

      const passengers = this.bookedData.map((p: any) => ({
        Seat: p.seat,
        Name: p.name,
        Age: parseInt(p.age),
        Gender: p.gender,
        SeatNo: p.seatNo.toString(),
        Fare: p.fare,
        SeatTypeId: p.seat_type,
        IsAcSeat: false
      }));

      this.createBookingAndOpenSummary(passengers);

    }, err => {
      console.error(err);
      this.presentToast("GDS API error", "danger");
      this.holdLoader = false;
    });
  }


  async createBookingAndOpenSummary(passengersData: any[]) {

    const dbData = {
      FromCityId: parseInt(this.fromId),
      ToCityId: parseInt(this.toId),
      JourneyDate: this.date,
      BusId: parseInt(this.busId),
      PickUpID: this.pickupPoint.PickupId,
      DropOffID: this.dropoffPoint.DropoffId,
      FromCityName: this.from,
      ToCityName: this.to,
      ContactInfo: {
        CustomerName: this.name,
        Email: this.email,
        Phone: this.mobile.toString(),
        Mobile: this.mobile.toString()
      },
      GSTDetails: {
        Gstin: this.gstNo,
        GstCompany: this.businessName
      },
      Passengers: passengersData,
      HoldId: this.holdId,
      source: this.source,
      status: "Pending",
      user: this.authS.currentUserValue._id
    };

    this.api.createBookings(dbData).subscribe(async () => {

      this.holdLoader = false;

      const modal = await this.modalS.create({
        component: BookingSummaryComponent,
        componentProps: {
          holdId: this.holdId,
          source: this.source,
          fare: this.calculateFare(),
          gst: this.gstcalculate(),
          busDetails: this.busList,
          pickups: this.pickupPoint,
          dropoffs: this.dropoffPoint,
          passengers: passengersData,
          from: this.from,
          to: this.to,
          busId: this.busId,
          date: this.date
        }
      });

      await modal.present();

    }, err => {
      console.error(err);
      this.presentToast("DB booking failed", "danger");
      this.holdLoader = false;
    });
  }


}

