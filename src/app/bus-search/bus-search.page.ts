// import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
// import { ActivatedRoute, Router } from "@angular/router";
// import { ApiService } from "../core/services/api.service";
// import { Location } from "@angular/common";
// import { environment } from "src/environments/environment";
// import * as moment from "moment-timezone";
// import { of, Subscription } from "rxjs";
// import { log } from "console";
// import { set } from "lodash";
// import {
//   ModalController,
//   ToastController,
//   IonRouterOutlet,
//   LoadingController,
//   Platform,
//   IonModal,
//   AlertController,
// } from "@ionic/angular";
// import { App } from "@capacitor/app";
// import { HttpClient } from "@angular/common/http";
// import { forkJoin } from "rxjs";
// import { catchError } from "rxjs/operators";

// function sanitizeText(str: string): string {
//   if (!str) return "";
//   let cleaned = str.replace(
//     /(contact|phone|mobile|mob|tele|tel)\s*[-:]?\s*[\d\s\-+\/]+/gi,
//     "",
//   );
//   cleaned = cleaned.replace(/\b(\+?91[\-\s]?)?[6-9]\d{9}\b/g, "");
//   cleaned = cleaned.replace(/\b0\d{2,4}[\-\s]?\d{6,8}\b/g, "");
//   cleaned = cleaned.replace(/\b\d{8,11}\b/g, "");
//   cleaned = cleaned.replace(/\s+/g, " ").trim();
//   let temp = cleaned.replace(/^(pickup\s+)?address\s*[-:]?\s*/i, "").trim();
//   if (temp === "" || temp === "-" || temp === ":") {
//     return "";
//   }
//   return cleaned;
// }

// @Component({
//   selector: "app-bus-search",
//   templateUrl: "./bus-search.page.html",
//   styleUrls: ["./bus-search.page.scss"],
// })
// export class BusSearchPage implements OnInit, OnDestroy {
//   @ViewChild("modal", { static: true }) modal!: IonModal;
//   from = "";
//   fromState = "";
//   fromId = "";
//   to = "";
//   toState = "";
//   toId = "";
//   date = "";
//   busAvailable = 0;
//   busList: any = [];
//   OriginalbusList: any = [];
//   filterBusList: any = [];
//   filterbusmodel = false;
//   isBusFeaturesClicked = false;
//   AmenitiesClicked = false;
//   // modelbusroutes= false;

//   boarding: any = [];
//   dropping: any = [];
//   AllAmenities: any = [];
//   filteredBusList: any = [];
//   checkedPickup: any = [];
//   checkedDroping: any = [];
//   checkedSeatType: any = [];

//   filteredArray: any = [];
//   originalArray: any = [];
//   private queryParamsSubscription!: Subscription;

//   currentDate: any = moment()
//     .tz("Asia/Kolkata")
//     .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
//   item: any;
//   uniquePickupPoints: any = [];
//   uniqueDropoffPoints: any = [];
//   uniqueSeatTypesandIsAC: any = [];
//   selectBusOpt: any = [];
//   searchTerm: string = "";
//   filterbusprice: any;
//   busfare: any;
//   IsAC: any;
//   seating: any;
//   depratureTimeBetween: any;
//   ArrivalTimeBetween: any;
//   uniquedeparature: any = [];
//   uniqueLatedeparature: any = [];
//   toCityList: any;
//   fromCityList: any = [];
//   toCity: any;
//   combinedList: any = [];
//   droppingall: any = [];
//   checkeAmenties: any = [];
//   clickTrigger: any = false;
//   journeyDate: any = "";

//   otherDate: any;

//   DeptSelections: any = {
//     Morning: false,
//     Afternoon: false,
//     Evening: false,
//     Night: false,
//   };

//   ArrivalTime: any = {
//     Morning: false,
//     Afternoon: false,
//     Evening: false,
//     Night: false,
//   };

//   selectedDept: string[] = [];
//   fromNewCityId: any = "";
//   fromOldCityId: any = "";
//   toNewCityId: any = "";
//   toOldCityId: any = "";

//   NEW_API_INDEX: any = {
//     id: 0,
//     number: 1,
//     name: 2,
//     operator_service_name: 3,
//     origin_id: 4,
//     destination_id: 5,
//     bus_type: 8,
//     dep_time: 9,
//     arr_time: 10,
//     duration: 11,
//     available_seats: 12,
//     total_seats: 13,
//     fare_str: 15,
//     amenities: 21,
//     boarding_stages: 22,
//     dropoff_stages: 23,
//     cancellation_policies: 25,
//     travel_date: 34,
//     is_ac_bus: 33,
//   };
//   isLoadingBuses: boolean = false;
//   isSearchCompleted: boolean = false;
//   activeFilter: string = "";
//   isLoading: boolean = false;
//   isRoutesModalOpen: boolean = false;
//   selectedBusForRoutes: any = null;

//   constructor(
//     private route: ActivatedRoute,
//     public api: ApiService,
//     public router: Router,
//     public location: Location,
//     public platform: Platform,
//     private routerOutlet: IonRouterOutlet,
//     private http: HttpClient,
//     private alertCtrl: AlertController,
//   ) {}

//   openRoutesModal(bus: any, event: Event) {
//     event.stopPropagation();
//     this.selectedBusForRoutes = bus;
//     this.isRoutesModalOpen = true;
//   }

//   ngOnInit() {
//     this.busList = [];
//     this.route.queryParams.subscribe((params) => {
//       let tempFrom = params["from"];
//       // this.fromState = params['fromState'];
//       // this.from = tempFrom.split("-")[0];
//       // this.fromId = tempFrom.split("-")[1];

//       // let tempTo = params['to'];
//       // this.toState = params['toState'];
//       // this.to = tempTo.split("-")[0];
//       // this.toId = tempTo.split("-")[1];

//       this.from = params["fromCity"];
//       this.fromState = params["fromState"];
//       this.fromNewCityId = params["fromNewCityId"];
//       this.fromOldCityId = params["fromOldCityId"];

//       // TO
//       this.to = params["toCity"];
//       this.toState = params["toState"];
//       this.toNewCityId = params["toNewCityId"];
//       this.toOldCityId = params["toOldCityId"];

//       this.date = params["date"];
//       this.getData();
//     });
//   }

//   ionViewDidEnter() {
//     this.platform.backButton.subscribeWithPriority(10, () => {
//       this.router.navigate(["/home"]);
//     });
//   }

//   async showOperatorDetails(item: any, event: Event) {
//     event.stopPropagation();
//     let mobile =
//       item.ContactNo ||
//       item.MobileNo ||
//       item.OperatorContact ||
//       "+91 9999999999";
//     const alert = await this.alertCtrl.create({
//       header: "Operator Details",
//       subHeader: item.CompanyName,
//       message: `Mobile Number: <b>${mobile}</b>`,
//       buttons: ["OK"],
//       mode: "ios",
//     });
//     await alert.present();
//   }

//   // exchangeCity() {
//   //   [this.from, this.to] = [this.to, this.from];
//   //   [this.fromId, this.toId] = [this.toId, this.fromId];
//   //   [this.fromState, this.toState] = [this.toState, this.fromState];
//   //   this.getData();
//   // }

//   exchangeCity() {
//     // City names
//     [this.from, this.to] = [this.to, this.from];

//     // States
//     [this.fromState, this.toState] = [this.toState, this.fromState];

//     // NEW API city IDs
//     [this.fromNewCityId, this.toNewCityId] = [
//       this.toNewCityId,
//       this.fromNewCityId,
//     ];

//     // OLD API city IDs
//     [this.fromOldCityId, this.toOldCityId] = [
//       this.toOldCityId,
//       this.fromOldCityId,
//     ];

//     // Optional legacy (if still used anywhere)
//     [this.fromId, this.toId] = [this.toId, this.fromId];

//     this.getData();
//   }

//   selectOtherEvent(event: any) {
//     this.otherDate = event.target.value;
//     this.clickTrigger = false;
//     this.date = "";
//     let journeyDate = moment(this.otherDate).tz("Asia/Kolkata");
//     journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
//     this.date = journeyDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
//     this.clickTrigger = false;
//     this.getData();
//   }

//   // selectOther() {
//   //   this.journeyDate = this.otherDate;
//   //   this.clickTrigger = false;
//   //   this.date = '';
//   //   let journeyDate = moment(this.journeyDate).tz('Asia/Kolkata');
//   //   journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//   //   this.date = journeyDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
//   //   this.clickTrigger = false;
//   //   this.getData();
//   // }

//   clearDateSelection() {
//     this.journeyDate = "";
//     this.otherDate = "";
//   }

//   ngOnDestroy() {
//     if (this.queryParamsSubscription) {
//       this.queryParamsSubscription.unsubscribe();
//     }
//   }

//   // prev() {
//   //   let date = moment(new Date(this.date)).tz('Asia/Kolkata');
//   //   date.subtract(1, 'd');
//   //   date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//   //   this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
//   //   this.getData();
//   //   let from = this.from + "-" + this.fromId;
//   //   let to = this.to + "-" + this.toId;
//   //   this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: this.date } });
//   // }

//   prev() {
//     let date = moment(this.date).tz("Asia/Kolkata");
//     date.subtract(1, "day");
//     date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

//     this.date = date.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
//     this.getData();

//     this.router.navigate(["/bus-search"], {
//       queryParams: {
//         fromCity: this.from,
//         fromState: this.fromState,
//         fromNewCityId: this.fromNewCityId,
//         fromOldCityId: this.fromOldCityId,

//         toCity: this.to,
//         toState: this.toState,
//         toNewCityId: this.toNewCityId,
//         toOldCityId: this.toOldCityId,

//         date: this.date,
//       },
//       replaceUrl: true,
//     });
//   }

//   next() {
//     let date = moment(this.date).tz("Asia/Kolkata");
//     date.add(1, "day");
//     date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

//     this.date = date.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
//     this.getData();

//     this.router.navigate(["/bus-search"], {
//       queryParams: {
//         fromCity: this.from,
//         fromState: this.fromState,
//         fromNewCityId: this.fromNewCityId,
//         fromOldCityId: this.fromOldCityId,

//         toCity: this.to,
//         toState: this.toState,
//         toNewCityId: this.toNewCityId,
//         toOldCityId: this.toOldCityId,

//         date: this.date,
//       },
//       replaceUrl: true,
//     });
//   }

//   // next() {
//   //   let date = moment(new Date(this.date)).tz('Asia/Kolkata');
//   //   date.add(1, 'd');
//   //   date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//   //   this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
//   //   this.getData();
//   //   let from = this.from + "-" + this.fromId;
//   //   let to = this.to + "-" + this.toId;
//   //   this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: this.date } });
//   // }

//   filterBusOperators(event: any) {
//     const searchTerm = event.target.value?.toLowerCase() || "";
//     this.filteredBusList = this.busList.filter((item: any) =>
//       item.CompanyName.toLowerCase().includes(searchTerm),
//     );
//   }

//   getData() {
//     this.AllAmenities = [];
//     this.busList = [];
//     this.busAvailable = 0;
//     console.log(this.date);
//     // this.api.serverRequest("GET", environment.busApi + "Search?fromCityId=" + this.fromId + "&toCityId=" + this.toId + "&journeyDate=" + this.date, "").subscribe(res => {
//     //   let data = (JSON.parse(res.body)).data;
//     //   this.AllAmenities = data?.AllAmenities;
//     //   this.busList = data?.Buses;
//     //   this.OriginalbusList = data?.Buses;
//     //   console.log(this.busList);
//     //   this.busAvailable = data.Buses.length;
//     //   this.dropping = this.busList[0].Dropoffs;
//     //   // this.droppingall = this.busList[0].Dropoffs.DropoffName;
//     //   // console.log(this.droppingall);
//     //   this.boarding = this.busList[0].Pickups;
//     //   this.extractUniquePoints();
//     //   this.filteredBusList = this.filterUniqueCompanies(this.busList);
//     // });
//     this.searchWithBothApis();
//   }

//   searchWithBothApis() {
//     this.isLoadingBuses = true;
//     this.isSearchCompleted = false;

//     const journeyDate = moment(this.date)
//       .tz("Asia/Kolkata")
//       .format("YYYY-MM-DD");

//     // const newApiUrl =
//     //   `https://gds-stg.ticketsimply.co.in/gds/api/schedules/` +
//     //   `${this.fromNewCityId}/${this.toNewCityId}/${journeyDate}.json` +
//     //   `?api_key=TSYAJMAPI86883462`;

//     const oldApiUrl =
//       environment.busApi +
//       "Search?fromCityId=" +
//       this.fromOldCityId +
//       "&toCityId=" +
//       this.toOldCityId +
//       "&journeyDate=" +
//       this.date;

//     forkJoin({
//       newApi: this.api
//         .serverRequestGds("POST", "/gds", {
//           method: "GET",
//           endpoint: `schedules/${this.fromNewCityId}/${this.toNewCityId}/${journeyDate}.json`,
//           query: {
//             api_key: environment.newApikey,
//           },
//         })
//         .pipe(
//           catchError((err) => {
//             console.warn("NEW API FAILED (via backend)", err);
//             return of(null);
//           }),
//         ),

//       oldApi: this.api.serverRequest("GET", oldApiUrl, "").pipe(
//         catchError((err) => {
//           console.error("OLD API FAILED", err);
//           return of(null);
//         }),
//       ),
//     }).subscribe(({ newApi, oldApi }) => {
//       let newBusList: any[] = [];
//       let oldBusList: any[] = [];
//       console.log("new api1", newApi);

//       if (newApi?.data?.result?.length > 0) {
//         localStorage.setItem(
//           "stageNames",
//           JSON.stringify(newApi.data.stage_names || {}),
//         );
//         newBusList = this.mapNewApiResponseAndReturn(
//           newApi.data.result,
//           newApi.data.stage_names,
//         );

//         console.log("new api2", newBusList);
//       }
//       // ---------------- OLD API DATA ----------------
//       if (oldApi?.body) {
//         const data = JSON.parse(oldApi.body).data;
//         oldBusList = (data?.Buses || []).map((bus: any) => {
//           const sanitizedPickups = (bus.Pickups || []).map((p: any) => ({
//             ...p,
//             PickupName: sanitizeText(p.PickupName),
//             Address: sanitizeText(p.Address),
//             Contact: "",
//           }));
//           const sanitizedDropoffs = (bus.Dropoffs || []).map((d: any) => ({
//             ...d,
//             DropoffName: sanitizeText(d.DropoffName),
//             Address: sanitizeText(d.Address),
//             Contact: "",
//           }));
//           return {
//             ...bus,
//             Pickups: sanitizedPickups,
//             Dropoffs: sanitizedDropoffs,
//             source: "OLD_API",
//           };
//         });
//         this.AllAmenities = data?.AllAmenities || [];
//       }

//       // ---------------- MERGE ----------------
//       this.busList = [...newBusList, ...oldBusList];
//       // ---------------- MERGE & DEDUPLICATE ----------------
//       const mergedList = [...newBusList, ...oldBusList];
//       const uniqueBuses: any[] = [];
//       mergedList.forEach((bus) => {
//         const isDuplicate = uniqueBuses.some((existingBus) =>
//           this.areBusesDuplicate(existingBus, bus),
//         );
//         if (!isDuplicate) {
//           uniqueBuses.push(bus);
//         } else {
//           console.log("Duplicate bus skipped: ", bus.CompanyName, bus.DeptTime);
//         }
//       });
//       this.busList = uniqueBuses;

//       // Sort chronologically by departure time (Time Serial)
//       this.busList.sort((a: any, b: any) => {
//         const timeA = new Date(a.DeptTime).getTime();
//         const timeB = new Date(b.DeptTime).getTime();
//         if (isNaN(timeA) || isNaN(timeB)) {
//           return a.DeptTime.slice(11, 16).localeCompare(
//             b.DeptTime.slice(11, 16),
//           );
//         }
//         return timeA - timeB;
//       });

//       this.OriginalbusList = this.busList;
//       this.busAvailable = this.busList.length;

//       this.dropping = this.busList[0]?.Dropoffs;
//       this.boarding = this.busList[0]?.Pickups;

//       this.extractUniquePoints();
//       this.filteredBusList = this.filterUniqueCompanies(this.busList);

//       this.isLoadingBuses = false;
//       this.isSearchCompleted = true;
//     });
//   }

//   mapNewApiResponseAndReturn(result: any[], stageNames: any): any[] {
//     // skip header row
//     const rows = result.slice(1);

//     return rows.map((row) => {
//       const depTime = row[this.NEW_API_INDEX.dep_time]; // "17:30"
//       const arrTime = row[this.NEW_API_INDEX.arr_time]; // "06:55"
//       const travelDate = row[this.NEW_API_INDEX.travel_date]; // "2026-02-10"

//       let arrDate = travelDate;
//       if (arrTime < depTime) {
//         arrDate = moment(travelDate).add(1, "day").format("YYYY-MM-DD");
//       }

//       return {
//         RouteBusId: row[this.NEW_API_INDEX.id],

//         BusName:
//           row[this.NEW_API_INDEX.name] ||
//           row[this.NEW_API_INDEX.operator_service_name],

//         CompanyName:
//           row[this.NEW_API_INDEX.operator_service_name] ||
//           row[this.NEW_API_INDEX.name],

//         DeptTime: `${travelDate}T${depTime}`,
//         ArrTime: `${arrDate}T${arrTime}`,
//         Duration: row[this.NEW_API_INDEX.duration],

//         BusType: {
//           Seating: row[this.NEW_API_INDEX.bus_type],
//           IsAC: row[this.NEW_API_INDEX.is_ac_bus] ? "AC" : "NON_AC",
//         },
//         BusStatus: {
//           BaseFares: [this.extractBaseFare(row[this.NEW_API_INDEX.fare_str])],
//           Availability: row[this.NEW_API_INDEX.available_seats],
//         },
//         TotalSeats: row[this.NEW_API_INDEX.total_seats],

//         Pickups: this.parseStages(
//           row[this.NEW_API_INDEX.boarding_stages],
//           stageNames,
//         ),

//         Dropoffs: this.parseStages(
//           row[this.NEW_API_INDEX.dropoff_stages],
//           stageNames,
//         ),

//         Amenities:
//           typeof row[this.NEW_API_INDEX.amenities] === "string"
//             ? JSON.parse(row[this.NEW_API_INDEX.amenities])
//             : row[this.NEW_API_INDEX.amenities] || [],

//         TravelDate: travelDate,
//         CancellationPolicies: row[this.NEW_API_INDEX.cancellation_policies],
//         source: "NEW_API",
//       };
//     });
//   }

//   private extractBaseFare(fareStr: string): number {
//     if (!fareStr) return 0;

//     // Take first fare only
//     const first = fareStr.split(",")[0]; // DLB:4000.00
//     const amount = first.split(":")[1]; // 4000.00

//     return Number(parseFloat(amount));
//   }

//   parseStages(stageStr: string, stageNames: any) {
//     if (!stageStr || typeof stageStr !== "string") return [];

//     return stageStr
//       .split(",")
//       .filter((s) => s.includes("|"))
//       .map((s) => {
//         const [id, time] = s.split("|");
//         return {
//           stageId: id,
//           time,
//           name: sanitizeText(stageNames?.[id] || "Unknown"),
//         };
//       });
//   }

//   extractAmenitiesFromNewApi(buses: any[]) {
//     let amenities: any = [];
//     buses.forEach((bus) => {
//       if (bus.amenities) {
//         amenities.push(...bus.amenities);
//       }
//     });
//     return [...new Set(amenities)];
//   }
//   getFormattedTime(timeStr: any): string {
//     if (!timeStr) return "";
//     if (typeof timeStr !== "string") {
//       try {
//         const d = new Date(timeStr);
//         if (!isNaN(d.getTime())) {
//           const hh = String(d.getHours()).padStart(2, "0");
//           const mm = String(d.getMinutes()).padStart(2, "0");
//           return `${hh}:${mm}`;
//         }
//       } catch (e) {}
//       return "";
//     }
//     const match = timeStr.match(/(\d{2}):(\d{2})/);
//     if (match) {
//       return match[0];
//     }
//     return timeStr.slice(11, 16);
//   }

//   getDiffInMinutes(timeStrA: string, timeStrB: string): number {
//     const getMinutes = (t: string) => {
//       const parts = t.split(":");
//       if (parts.length < 2) return 0;
//       return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
//     };
//     return Math.abs(getMinutes(timeStrA) - getMinutes(timeStrB));
//   }

//   areBusesDuplicate(a: any, b: any): boolean {
//     const depA = this.getFormattedTime(a.DeptTime);
//     const depB = this.getFormattedTime(b.DeptTime);
//     if (!depA || !depB) return false;

//     // 1. Departure times must be within 15 minutes
//     if (this.getDiffInMinutes(depA, depB) > 15) return false;

//     // 2. Company Names must share at least one significant word
//     const cleanName = (name: string) => {
//       return (name || "")
//         .toLowerCase()
//         .replace(/[^a-z0-9\s]/g, " ")
//         .split(/\s+/)
//         .filter((w) => {
//           return (
//             w.length >= 3 &&
//             ![
//               "travel",
//               "travels",
//               "agency",
//               "cargo",
//               "tour",
//               "tours",
//               "online",
//               "express",
//               "transport",
//               "service",
//               "services",
//               "coaching",
//               "roadways",
//               "group",
//               "company",
//               "and",
//               "with",
//               "shree",
//               "shri",
//               "sree",
//               "new",
//               "best",
//             ].includes(w)
//           );
//         });
//     };

//     const wordsA = cleanName(a.CompanyName || a.BusName);
//     const wordsB = cleanName(b.CompanyName || b.BusName);

//     const hasSharedWord = wordsA.some((w) => wordsB.includes(w));
//     if (!hasSharedWord) return false;

//     // 3. Fare check with a relaxed margin of 250 Rs
//     const fareA = a.BusStatus?.BaseFares?.[0];
//     const fareB = b.BusStatus?.BaseFares?.[0];
//     if (
//       fareA !== undefined &&
//       fareB !== undefined &&
//       Math.abs(fareA - fareB) > 250
//     ) {
//       return false;
//     }

//     return true;
//   }

//   Seating(Seating: any) {
//     throw new Error("Method not implemented.");
//   }

//   extractUniquePoints() {
//     const pickupNames = this.busList.flatMap((bus: any) =>
//       bus.Pickups.map((p: any) => p.PickupName),
//     );
//     const dropoffNames = this.busList.flatMap((bus: any) =>
//       bus.Dropoffs.map((d: any) => d.DropoffName),
//     );
//     const seatTypes = this.busList.flatMap((bus: any) => bus.BusType.Seating);
//     const IsAC = this.busList.flatMap((bus: any) => bus.BusType.IsAC);
//     const deparature = this.busList.flatMap((bus: any) =>
//       bus.DeptTime.slice(11, 16),
//     );
//     const normalpickup = this.busList.flatMap((bus: any) => bus.RouteBusId);
//     console.log(normalpickup);

//     this.uniquePickupPoints = [...new Set(pickupNames)];
//     this.uniqueDropoffPoints = [...new Set(dropoffNames)];
//     this.uniqueSeatTypesandIsAC = [...new Set(seatTypes), ...new Set(IsAC)];
//     this.uniquedeparature = [...new Set(deparature)];
//   }

//   // selectBus(busId: any) {
//   //   this.router.navigate(['/bus-layout'], { queryParams: { from: this.from + "-" + this.fromId, to: this.to + "-" + this.toId, fromState: this.fromState, toState: this.toState, date: this.date, bus: busId } });
//   // }

//   selectBus(busId: any, source: string) {
//     // console.log(source)
//     this.router.navigate(["/bus-layout"], {
//       queryParams: {
//         fromCity: this.from,
//         fromState: this.fromState,
//         fromNewCityId: this.fromNewCityId,
//         fromOldCityId: this.fromOldCityId,

//         toCity: this.to,
//         toState: this.toState,
//         toNewCityId: this.toNewCityId,
//         toOldCityId: this.toOldCityId,

//         date: this.date,
//         bus: busId,
//         source: source,
//       },
//     });
//   }

//   hascheck(seating: any, bustype: any) {
//     console.log(seating);
//   }

//   public routerLinkVariable = "/home";

//   selectedItem: string = "Departure time from source";

//   selectItem(item: string) {
//     this.selectedItem = item;
//   }

//   filterUniqueCompanies(
//     arr: { CompanyName: string }[],
//   ): { CompanyName: string }[] {
//     return arr.filter(
//       (item, index, self) =>
//         index === self.findIndex((t) => t.CompanyName === item.CompanyName),
//     );
//   }

//   checkSeatType(event: any) {
//     const seatType = event.target.value;
//     const index = this.checkedSeatType.indexOf(seatType);

//     if (index === -1) {
//       this.checkedSeatType.push(seatType);
//     } else {
//       this.checkedSeatType.splice(index, 1);
//     }

//     this.filterBusLists();
//   }

//   filterBusLists() {
//     this.busList = this.OriginalbusList.filter((bus: any) => {
//       const matchesPickup =
//         !this.checkedPickup.length ||
//         bus.Pickups.some((p: any) => this.checkedPickup.includes(p.PickupName));
//       const matchesDropoff =
//         !this.checkedDroping.length ||
//         bus.Dropoffs.some((d: any) =>
//           this.checkedDroping.includes(d.DropoffName),
//         );
//       const matchesIsAC = this.checkedSeatType.includes(bus.BusType.IsAC);
//       return matchesPickup && matchesDropoff && matchesIsAC;
//     });
//   }

//   checkPickup(event: any) {
//     let index = this.checkedPickup.findIndex((res: any) => {
//       return res == event.target.value;
//     });
//     if (index == -1) {
//       this.checkedPickup.push(event.target.value);
//     } else {
//       this.checkedPickup.splice(index, 1);
//     }
//     const filteredBusList = this.OriginalbusList.filter((bus: any) => {
//       return (
//         bus.Pickups.some((pickup: any) =>
//           this.checkedPickup.includes(pickup.PickupName),
//         ) ||
//         bus.Dropoffs.some((pickup: any) =>
//           this.checkedDroping.includes(pickup.DropoffName),
//         ) ||
//         this.checkedSeatType.includes(bus.BusType.IsAC)
//       );
//     });
//     if (filteredBusList.length == 0) {
//       this.busList = this.busList;
//     } else {
//       this.busList = filteredBusList;
//     }
//   }

//   checkDropoff(event: any) {
//     let index = this.checkedDroping.findIndex((res: any) => {
//       return res == event.target.value;
//     });
//     if (index == -1) {
//       this.checkedDroping.push(event.target.value);
//     } else {
//       this.checkedDroping.splice(index, 1);
//     }
//     const filteredBusList = this.OriginalbusList.filter((bus: any) => {
//       return (
//         bus.Pickups.some((pickup: any) =>
//           this.checkedPickup.includes(pickup.PickupName),
//         ) ||
//         bus.Dropoffs.some((pickup: any) =>
//           this.checkedDroping.includes(pickup.DropoffName),
//         ) ||
//         this.checkedSeatType.includes(bus.BusType.IsAC)
//       );
//     });
//     if (filteredBusList.length == 0) {
//       this.busList = this.busList;
//     } else {
//       this.busList = filteredBusList;
//     }
//   }

//   checkBusOperator(event: any) {
//     const selectedOperator = event.target.value;
//     const selectedOperatorLower = selectedOperator.toLowerCase();

//     const index = this.selectBusOpt.findIndex(
//       (op: string) => op === selectedOperatorLower,
//     );

//     if (index === -1) {
//       this.selectBusOpt.push(selectedOperatorLower);
//     } else {
//       this.selectBusOpt.splice(index, 1);
//     }

//     console.log(this.selectBusOpt);

//     const filteredBusList = this.OriginalbusList.filter((bus: any) => {
//       return (
//         this.selectBusOpt.length === 0 ||
//         this.selectBusOpt.includes(bus.CompanyName.toLowerCase())
//       );
//     });

//     this.busList = filteredBusList;
//   }

//   checkAmenities(event: any) {
//     const amenityName = event.target.value;
//     const amenityIndex = this.AllAmenities.findIndex(
//       (res: any) => res === amenityName,
//     );

//     if (amenityIndex === -1) return;

//     const exists = this.checkeAmenties.includes(amenityName);
//     if (!exists) {
//       this.checkeAmenties.push(amenityName);
//     } else {
//       this.checkeAmenties = this.checkeAmenties.filter(
//         (item: any) => item !== amenityName,
//       );
//     }

//     const selectedAmenityIndexes = this.checkeAmenties.map((name: any) => {
//       return this.AllAmenities.indexOf(name);
//     });

//     console.log(selectedAmenityIndexes);
//     const filteredBusList = this.OriginalbusList.filter((bus: any) =>
//       bus.Amenities.some((amt: number) => selectedAmenityIndexes.includes(amt)),
//     );

//     if (filteredBusList.length == 0) {
//       this.busList = this.busList;
//     } else {
//       this.busList = filteredBusList;
//     }
//   }

//   busfarelowtohigh() {
//     this.OriginalbusList.sort((a: any, b: any) => {
//       return a.BusStatus.BaseFares[0] - b.BusStatus.BaseFares[0];
//     });
//     // console.log(this.busList);
//   }

//   earlydeparture() {
//     const targetTime = this.uniquedeparature;
//     this.busList = this.OriginalbusList.filter(
//       (bus: any) => bus.DeptTime.slice(11, 16) >= targetTime,
//     ).sort((a: any, b: any) =>
//       a.DeptTime.slice(11, 16).localeCompare(b.DeptTime),
//     );
//     // console.log(this.busList);
//   }

//   latedeprature() {
//     const targetTime = this.uniquedeparature;
//     this.busList = this.OriginalbusList.filter(
//       (bus: any) => bus.DeptTime.slice(11, 16) > targetTime,
//     ) // Filter buses with DeptTime later than targetTime
//       .sort((a: any, b: any) =>
//         b.DeptTime.slice(11, 16).localeCompare(a.DeptTime),
//       ); // Sort the filtered list by DeptTime in descending order
//     // console.log(this.busList);
//   }

//   applyTimeFilter(start: number, end: number, type: string) {
//     // If same button clicked again → reload original data
//     if (this.activeFilter === type) {
//       this.clearAll();
//       return;
//     }

//     this.activeFilter = type;
//     this.isLoading = true;

//     setTimeout(() => {
//       this.busList = this.OriginalbusList.filter((bus: any) => {
//         const hour = parseInt(bus.DeptTime.slice(11, 13));
//         return hour >= start && hour < end;
//       }).sort((a: any, b: any) => a.DeptTime.localeCompare(b.DeptTime));

//       this.isLoading = false;
//     }, 500); // small delay for loader effect
//   }

//   filterAMDeparture() {
//     this.applyTimeFilter(0, 12, "AM");
//   }

//   filterPMDeparture() {
//     this.applyTimeFilter(12, 24, "PM");
//   }

//   closeSearch() {
//     // $("#from-city-search").css("display","none");
//     // $("#to-city-search").css("display","none");
//   }
//   searchFromCity() {
//     $("#from-city-search").css("display", "block");
//   }

//   searchBusFromPoint(city: any) {
//     if (city.target.value.length >= 3) {
//       this.api
//         .getAllBuslist(
//           { City: { $regex: "^" + city.target.value, $options: "i" } },
//           1,
//           10,
//           "",
//         )
//         .subscribe((data) => {
//           this.fromCityList = data.data;
//         });
//     } else {
//       this.fromCityList = [];
//     }
//   }

//   SeatTypeandAC() {
//     for (let i = 0; i < this.busList.length; i++) {
//       this.IsAC = this.busList[i].BusType.IsAC;
//       console.log(this.IsAC);
//     }
//     if (this.IsAC !== "NON_AC") {
//       console.log("AC");
//     } else {
//       console.log("NONAC");
//     }

//     // for (let i = 0; i < this.busList.length; i++) {
//     //   this.seating = this.busList[i].BusType.Seating
//     //   console.log(this.seating);
//     // }
//   }

//   depraturetime() {
//     const selectedRanges: { start: number; end: number }[] = [];

//     if (this.DeptSelections.Morning) {
//       selectedRanges.push({ start: 6, end: 12 });
//     }
//     if (this.DeptSelections.Afternoon) {
//       selectedRanges.push({ start: 12, end: 18 });
//     }
//     if (this.DeptSelections.Evening) {
//       selectedRanges.push({ start: 18, end: 24 });
//     }
//     if (this.DeptSelections.Night) {
//       selectedRanges.push({ start: 0, end: 6 });
//     }

//     this.busList = this.OriginalbusList.filter((bus: any) => {
//       const hour = parseInt(bus.DeptTime.slice(11, 13), 10); // Extract hour from 'YYYY-MM-DDTHH:mm:ss'

//       return selectedRanges.some(
//         (range) => hour >= range.start && hour < range.end,
//       );
//     });
//     // For debugging
//   }

//   Arrivaltime() {
//     const selectedRanges: { start: number; end: number }[] = [];

//     if (this.DeptSelections.Morning) {
//       selectedRanges.push({ start: 6, end: 12 });
//     }
//     if (this.DeptSelections.Afternoon) {
//       selectedRanges.push({ start: 12, end: 18 });
//     }
//     if (this.DeptSelections.Evening) {
//       selectedRanges.push({ start: 18, end: 24 });
//     }
//     if (this.DeptSelections.Night) {
//       selectedRanges.push({ start: 0, end: 6 });
//     }

//     this.busList = this.OriginalbusList.filter((bus: any) => {
//       const hour = parseInt(bus.DeptTime.slice(11, 13), 10); // Extract hour from 'YYYY-MM-DDTHH:mm:ss'

//       return selectedRanges.some(
//         (range) => hour >= range.start && hour < range.end,
//       );
//     });
//   }

//   getValue() {
//     this.selectedDept = [];
//     for (const key in this.DeptSelections) {
//       if (this.DeptSelections[key]) {
//         this.selectedDept.push(`${key}`);
//       }
//     }
//   }

//   // search_name(){
//   //   let input=document.getElementById('searchbar')
//   //   console.log(input.target);

//   //   // input = input.toLowerCase();
//   //   // let li = document.getElementsByClassName('list')
//   //   // for(let i=0 ; i<li.length ; i++){
//   //   //     if (!li[i].innerHTML.toLowerCase().includes(input)) {
//   //   //         li[i].style.display = "none";
//   //   //       }
//   //   //       else {
//   //   //         li[i].style.display = "list-item";
//   //   //       }
//   //   //     }
//   //   }

//   searchName(): void {
//     const inputElement = document.getElementById(
//       "searchbar",
//     ) as HTMLInputElement;
//     const searchTerm = inputElement.value.toLowerCase();

//     const listItems = document.getElementsByClassName(
//       "droppinglist",
//     ) as HTMLCollectionOf<HTMLElement>;

//     for (let i = 0; i < listItems.length; i++) {
//       const listItem = listItems[i];
//       const listItemText = listItem.innerHTML.toLowerCase();

//       if (!listItemText.includes(searchTerm)) {
//         listItem.style.display = "none";
//       } else {
//         listItem.style.display = "list-item";
//       }
//     }
//   }

//   clearModel() {
//     this.modal.dismiss();
//   }
//   clearAll() {
//     this.busList = [];
//     this.busList = this.OriginalbusList;
//     location.reload();
//     this.modal.dismiss();
//   }
//   // applyFilters() {
//   //   this.busList = this.busList.filter((bus: any) => {
//   //     const matchesPickup = !this.checkedPickup.length || bus.Pickups.some((p: any) => this.checkedPickup.includes(p.PickupName));
//   //     const matchesDropoff = !this.checkedDroping.length || bus.Dropoffs.some((d: any) => this.checkedDroping.includes(d.DropoffName));
//   //     const matchesIsAC = this.checkedSeatType.includes(bus.BusType.IsAC);
//   //     return matchesPickup && matchesDropoff && matchesIsAC;

//   //   });

//   //   this.modal.dismiss();
//   // }
// }



import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import * as moment from 'moment-timezone';
import { of, Subscription } from 'rxjs';
import { log } from 'console';
import { set } from 'lodash';
import { ModalController, ToastController, IonRouterOutlet, LoadingController, Platform, IonModal, AlertController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  selector: 'app-bus-search',
  templateUrl: './bus-search.page.html',
  styleUrls: ['./bus-search.page.scss'],
})
export class BusSearchPage implements OnInit, OnDestroy {
  @ViewChild('modal', { static: true }) modal!: IonModal;
  from = "";
  fromState = "";
  fromId = "";
  to = "";
  toState = "";
  toId = "";
  date = "";
  busAvailable = 0;
  busList: any = [];
  OriginalbusList: any = [];
  filterBusList: any = [];
  filterbusmodel = false;
  isBusFeaturesClicked = false;
  AmenitiesClicked = false;
  // modelbusroutes= false;

  boarding: any = [];
  dropping: any = [];
  AllAmenities: any = [];
  checkedPickup: any = [];
  checkedDroping: any = [];
  checkedSeatType: any = [];

  filteredArray: any = [];
  originalArray: any = []
  private queryParamsSubscription!: Subscription;

  currentDate: any = moment().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  item: any;
  uniquePickupPoints: any = [];
  uniqueDropoffPoints: any = [];
  uniqueSeatTypesandIsAC: any = [];
  selectBusOpt: any = [];
  searchTerm: string = '';
  boardingSearchTerm: string = '';
  droppingSearchTerm: string = '';
  filterbusprice: any;
  busfare: any;
  IsAC: any;
  seating: any;
  depratureTimeBetween: any;
  ArrivalTimeBetween: any;
  uniquedeparature: any = [];
  uniqueLatedeparature: any = [];
  toCityList: any;
  fromCityList: any = [];
  toCity: any;
  combinedList: any = [];
  droppingall: any = [];
  checkeAmenties: any = [];
  clickTrigger: any = false;
  journeyDate: any = "";

  otherDate: any;


  DeptSelections: any = {
    Morning: false,
    Afternoon: false,
    Evening: false,
    Night: false
  };


  ArrivalTime: any = {
    Morning: false,
    Afternoon: false,
    Evening: false,
    Night: false
  };

  selectedDept: string[] = [];
  fromNewCityId: any = '';
  fromOldCityId: any = '';
  toNewCityId: any = '';
  toOldCityId: any = '';

  NEW_API_INDEX: any = {
    id: 0,
    number: 1,
    name: 2,
    operator_service_name: 3,
    origin_id: 4,
    destination_id: 5,
    bus_type: 8,
    dep_time: 9,
    arr_time: 10,
    duration: 11,
    available_seats: 12,
    total_seats: 13,
    fare_str: 15,
    amenities: 21,
    boarding_stages: 22,
    dropoff_stages: 23,
    cancellation_policies: 25,
    travel_date: 34,
    is_ac_bus: 33
  };
  isLoadingBuses: boolean = false;
  isSearchCompleted: boolean = false;
  activeFilter: string = '';
  isLoading: boolean = false;
  isRoutesModalOpen: boolean = false;
  selectedBusForRoutes: any = null;

  constructor(private route: ActivatedRoute, public api: ApiService, public router: Router, public location: Location, public platform: Platform, private routerOutlet: IonRouterOutlet, private http: HttpClient, private alertCtrl: AlertController) { }

  openRoutesModal(bus: any, event: Event) {
    event.stopPropagation();
    this.selectedBusForRoutes = bus;
    this.isRoutesModalOpen = true;
  }

  ngOnInit() {
    this.busList = [];
    this.route.queryParams
      .subscribe(params => {
        let tempFrom = params['from'];
        // this.fromState = params['fromState'];
        // this.from = tempFrom.split("-")[0];
        // this.fromId = tempFrom.split("-")[1];

        // let tempTo = params['to'];
        // this.toState = params['toState'];
        // this.to = tempTo.split("-")[0];
        // this.toId = tempTo.split("-")[1];

        this.from = params['fromCity'];
        this.fromState = params['fromState'];
        this.fromNewCityId = params['fromNewCityId'];
        this.fromOldCityId = params['fromOldCityId'];

        // TO
        this.to = params['toCity'];
        this.toState = params['toState'];
        this.toNewCityId = params['toNewCityId'];
        this.toOldCityId = params['toOldCityId'];

        this.date = params['date'];
        this.getData();
      }
      );

  }

  ionViewDidEnter() {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['/home']);
    });
  }

  async showOperatorDetails(item: any, event: Event) {
    event.stopPropagation();
    let mobile = item.ContactNo || item.MobileNo || item.OperatorContact || "+91 9999999999";
    const alert = await this.alertCtrl.create({
      header: 'Operator Details',
      subHeader: item.CompanyName,
      message: `Mobile Number: <b>${mobile}</b>`,
      buttons: ['OK'],
      mode: 'ios'
    });
    await alert.present();
  }

  // exchangeCity() {
  //   [this.from, this.to] = [this.to, this.from];
  //   [this.fromId, this.toId] = [this.toId, this.fromId];
  //   [this.fromState, this.toState] = [this.toState, this.fromState];
  //   this.getData();
  // }

  exchangeCity() {
    // City names
    [this.from, this.to] = [this.to, this.from];

    // States
    [this.fromState, this.toState] = [this.toState, this.fromState];

    // NEW API city IDs
    [this.fromNewCityId, this.toNewCityId] =
      [this.toNewCityId, this.fromNewCityId];

    // OLD API city IDs
    [this.fromOldCityId, this.toOldCityId] =
      [this.toOldCityId, this.fromOldCityId];

    // Optional legacy (if still used anywhere)
    [this.fromId, this.toId] = [this.toId, this.fromId];

    this.getData();
  }



  selectOtherEvent(event: any) {
    this.otherDate = event.target.value;
    this.clickTrigger = false;
    this.date = '';
    let journeyDate = moment(this.otherDate).tz('Asia/Kolkata');
    journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    this.date = journeyDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    this.clickTrigger = false;
    this.getData();
  }


  // selectOther() {
  //   this.journeyDate = this.otherDate;
  //   this.clickTrigger = false;
  //   this.date = '';
  //   let journeyDate = moment(this.journeyDate).tz('Asia/Kolkata');
  //   journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  //   this.date = journeyDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  //   this.clickTrigger = false;
  //   this.getData();
  // }

  clearDateSelection() {
    this.journeyDate = "";
    this.otherDate = "";
  }


  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  // prev() {
  //   let date = moment(new Date(this.date)).tz('Asia/Kolkata');
  //   date.subtract(1, 'd');
  //   date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  //   this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  //   this.getData();
  //   let from = this.from + "-" + this.fromId;
  //   let to = this.to + "-" + this.toId;
  //   this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: this.date } });
  // }

  prev() {
    let date = moment(this.date).tz('Asia/Kolkata');
    date.subtract(1, 'day');
    date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    this.getData();

    this.router.navigate(['/bus-search'], {
      queryParams: {
        fromCity: this.from,
        fromState: this.fromState,
        fromNewCityId: this.fromNewCityId,
        fromOldCityId: this.fromOldCityId,

        toCity: this.to,
        toState: this.toState,
        toNewCityId: this.toNewCityId,
        toOldCityId: this.toOldCityId,

        date: this.date
      },
      replaceUrl: true
    });
  }

  next() {
    let date = moment(this.date).tz('Asia/Kolkata');
    date.add(1, 'day');
    date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

    this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    this.getData();

    this.router.navigate(['/bus-search'], {
      queryParams: {
        fromCity: this.from,
        fromState: this.fromState,
        fromNewCityId: this.fromNewCityId,
        fromOldCityId: this.fromOldCityId,

        toCity: this.to,
        toState: this.toState,
        toNewCityId: this.toNewCityId,
        toOldCityId: this.toOldCityId,

        date: this.date
      },
      replaceUrl: true
    });
  }

  // next() {
  //   let date = moment(new Date(this.date)).tz('Asia/Kolkata');
  //   date.add(1, 'd');
  //   date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
  //   this.date = date.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  //   this.getData();
  //   let from = this.from + "-" + this.fromId;
  //   let to = this.to + "-" + this.toId;
  //   this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: this.date } });
  // }


  filterBusOperators(event: any) {
    this.operatorSearchTerm = event.target.value || '';
  }

  getData() {
    this.AllAmenities = [];
    this.busList = [];
    this.busAvailable = 0;
    console.log(this.date)
    // this.api.serverRequest("GET", environment.busApi + "Search?fromCityId=" + this.fromId + "&toCityId=" + this.toId + "&journeyDate=" + this.date, "").subscribe(res => {
    //   let data = (JSON.parse(res.body)).data;
    //   this.AllAmenities = data?.AllAmenities;
    //   this.busList = data?.Buses;
    //   this.OriginalbusList = data?.Buses;
    //   console.log(this.busList);
    //   this.busAvailable = data.Buses.length;
    //   this.dropping = this.busList[0].Dropoffs;
    //   // this.droppingall = this.busList[0].Dropoffs.DropoffName;
    //   // console.log(this.droppingall);
    //   this.boarding = this.busList[0].Pickups;
    //   this.extractUniquePoints();
    //   this.filteredBusList = this.filterUniqueCompanies(this.busList);
    // });
    this.searchWithBothApis();
  }

  searchWithBothApis() {
    this.isLoadingBuses = true;
    this.isSearchCompleted = false;

    const journeyDate = moment(this.date)
      .tz('Asia/Kolkata')
      .format('YYYY-MM-DD');

    const oldApiUrl =
      environment.busApi +
      "Search?fromCityId=" + this.fromOldCityId +
      "&toCityId=" + this.toOldCityId +
      "&journeyDate=" + this.date;

    let fromIds: any[] = [this.fromNewCityId];
    if (this.fromNewCityId == 24852 || this.fromNewCityId == 97 || this.fromNewCityId === '24852' || this.fromNewCityId === '97') {
      fromIds = [24852, 97];
    }
    
    let toIds: any[] = [this.toNewCityId];
    if (this.toNewCityId == 24852 || this.toNewCityId == 97 || this.toNewCityId === '24852' || this.toNewCityId === '97') {
      toIds = [24852, 97];
    }

    // Workaround for Seoni (Madhya Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 7114 || this.toOldCityId === '7114' || this.toNewCityId == 3923 || this.toNewCityId == 18556) {
      toIds = [3923, 18556];
    }

    // Workaround for Katni (Madhya Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 5568 || this.toOldCityId === '5568' || this.toNewCityId == 7320 || this.toNewCityId === '7320') {
      toIds = [7320];
    }

    // Workaround for Maihar (Madhya Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 5992 || this.toOldCityId === '5992' || this.toNewCityId == 7322 || this.toNewCityId === '7322') {
      toIds = [7322];
    }

    // Workaround for Rewa (Madhya Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 6936 || this.toOldCityId === '6936' || this.toNewCityId == 7323 || this.toNewCityId === '7323') {
      toIds = [7323];
    }

    // Workaround for Prayagraj / Allahabad since its newCityId is null in database cityMaster
    if (this.toOldCityId == 3937 || this.toOldCityId === '3937' || this.toNewCityId == 17161 || this.toNewCityId == 2781) {
      toIds = [17161, 2781];
    }

    // Workaround for Sultanpur (Uttar Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 7306 || this.toOldCityId === '7306' || this.toNewCityId == 1399 || this.toNewCityId == 18066) {
      toIds = [1399, 18066];
    }

    // Workaround for Ayodhya since its newCityId is null in database cityMaster
    if (this.toOldCityId == 4075 || this.toOldCityId === '4075' || this.toNewCityId == 2960 || this.toNewCityId === '2960') {
      toIds = [2960];
    }

    // Workaround for Basti (Uttar Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 4260 || this.toOldCityId === '4260' || this.toNewCityId == 3489 || this.toNewCityId === '3489') {
      toIds = [3489];
    }

    // Workaround for Khalilabad (Uttar Pradesh) since its newCityId is null in database cityMaster
    if (this.toOldCityId == 5622 || this.toOldCityId === '5622' || this.toNewCityId == 10209 || this.toNewCityId === '10209') {
      toIds = [10209];
    }

    // Workaround for Gorakhpur since its newCityId is null/incorrect in database cityMaster
    if (this.toOldCityId == 5074 || this.toOldCityId === '5074' || this.toNewCityId == 2286 || this.toNewCityId == 2957 || this.toNewCityId == 18354) {
      toIds = [2957, 18354];
    }


    const gdsRequests: any[] = [];
    for (const fId of fromIds) {
      for (const tId of toIds) {
        gdsRequests.push(
          this.api.serverRequestGds('POST', '/gds', {
            method: 'GET',
            endpoint: `schedules/${fId}/${tId}/${journeyDate}.json`,
            query: {
              api_key: environment.newApikey
            }
          }).pipe(
            catchError(err => {
              console.warn(`NEW API FAILED for schedules/${fId}/${tId}`, err);
              return of(null);
            })
          )
        );
      }
    }

    forkJoin({
      newApiResults: forkJoin(gdsRequests),
      oldApi: this.api.serverRequest("GET", oldApiUrl, "").pipe(
        catchError(err => {
          console.error('OLD API FAILED', err);
          return of(null);
        })
      )

    }).subscribe(({ newApiResults, oldApi }) => {
      console.log('DEBUG [Seoni Route Check] - newApiResults raw:', newApiResults);
      console.log('DEBUG [Seoni Route Check] - oldApi raw:', oldApi);

      let newBusList: any[] = [];
      let oldBusList: any[] = [];

      for (const newApi of newApiResults) {
        if (newApi?.data?.result?.length > 0) {
          localStorage.setItem('stageNames', JSON.stringify(newApi.data.stage_names || {}));
          const mapped = this.mapNewApiResponseAndReturn(
            newApi.data.result,
            newApi.data.stage_names
          );
          newBusList.push(...mapped);
        }
      }

      // Deduplicate newBusList by RouteBusId
      const uniqueNewBusMap = new Map<string, any>();
      for (const bus of newBusList) {
        if (bus.RouteBusId) {
          uniqueNewBusMap.set(bus.RouteBusId.toString(), bus);
        }
      }
      newBusList = Array.from(uniqueNewBusMap.values());
      // ---------------- OLD API DATA ----------------
      if (oldApi?.body) {
        const data = JSON.parse(oldApi.body).data;
        oldBusList = (data?.Buses || []).map((bus: any) => {
          const sanitizedPickups = (bus.Pickups || []).map((p: any) => ({
            ...p,
            PickupName: sanitizeText(p.PickupName),
            Address: sanitizeText(p.Address),
            Contact: ''
          }));
          const sanitizedDropoffs = (bus.Dropoffs || []).map((d: any) => ({
            ...d,
            DropoffName: sanitizeText(d.DropoffName),
            Address: sanitizeText(d.Address),
            Contact: ''
          }));
          return {
            ...bus,
            Pickups: sanitizedPickups,
            Dropoffs: sanitizedDropoffs,
            source: 'OLD_API'
          };
        });
        this.AllAmenities = data?.AllAmenities || [];
      }

      // ---------------- MERGE & DEDUPLICATE ----------------
      const mergedList = [...newBusList, ...oldBusList];
      
      const now = moment().tz('Asia/Kolkata');
      const todayStr = now.format('YYYY-MM-DD');
      const isToday = (journeyDate === todayStr);

      let filteredMergedList = mergedList;
      if (isToday) {
        filteredMergedList = mergedList.filter(bus => {
          const busDeptTime = moment.tz(bus.DeptTime, 'Asia/Kolkata');
          return busDeptTime.isValid() ? busDeptTime.isAfter(now) : true;
        });
      }

      const uniqueBuses: any[] = [];
      filteredMergedList.forEach(bus => {
        const isDuplicate = uniqueBuses.some(existingBus => this.areBusesDuplicate(existingBus, bus));
        if (!isDuplicate) {
          uniqueBuses.push(bus);
        } else {
          console.log("Duplicate bus skipped: ", bus.CompanyName, bus.DeptTime);
        }
      });
      this.busList = uniqueBuses;
      
      // Sort chronologically by departure time (Time Serial)
      this.busList.sort((a: any, b: any) => {
        const timeA = new Date(a.DeptTime).getTime();
        const timeB = new Date(b.DeptTime).getTime();
        if (isNaN(timeA) || isNaN(timeB)) {
          return a.DeptTime.slice(11, 16).localeCompare(b.DeptTime.slice(11, 16));
        }
        return timeA - timeB;
      });

      this.OriginalbusList = this.busList;
      this.busAvailable = this.busList.length;

      this.dropping = this.busList[0]?.Dropoffs;
      this.boarding = this.busList[0]?.Pickups;

      this.extractUniquePoints();

      this.isLoadingBuses = false;
      this.isSearchCompleted = true;
    });
  }



  mapNewApiResponseAndReturn(result: any[], stageNames: any): any[] {

    // skip header row
    const rows = result.slice(1);

    return rows.map(row => {

      const depTime = row[this.NEW_API_INDEX.dep_time];   // "17:30"
      const arrTime = row[this.NEW_API_INDEX.arr_time];   // "06:55"
      const travelDate = row[this.NEW_API_INDEX.travel_date]; // "2026-02-10"


      let arrDate = travelDate;
      if (arrTime < depTime) {
        arrDate = moment(travelDate).add(1, 'day').format('YYYY-MM-DD');
      }


      return {
        RouteBusId: row[this.NEW_API_INDEX.id],
        origin_id: row[this.NEW_API_INDEX.origin_id],
        destination_id: row[this.NEW_API_INDEX.destination_id],

        BusName:
          row[this.NEW_API_INDEX.name] ||
          row[this.NEW_API_INDEX.operator_service_name],

        CompanyName:
          row[this.NEW_API_INDEX.operator_service_name] ||
          row[this.NEW_API_INDEX.name],

        DeptTime: `${travelDate}T${depTime}`,
        ArrTime: `${arrDate}T${arrTime}`,
        Duration: row[this.NEW_API_INDEX.duration],

        BusType: {
          Seating: row[this.NEW_API_INDEX.bus_type],
          IsAC: row[this.NEW_API_INDEX.is_ac_bus] ? 'AC' : 'NON_AC'
        },
        BusStatus: {
          BaseFares: [
            this.extractBaseFare(row[this.NEW_API_INDEX.fare_str])
          ],
          Availability: row[this.NEW_API_INDEX.available_seats]
        },
        TotalSeats: row[this.NEW_API_INDEX.total_seats],

        Pickups: this.parseStages(
          row[this.NEW_API_INDEX.boarding_stages],
          stageNames
        ),

        Dropoffs: this.parseStages(
          row[this.NEW_API_INDEX.dropoff_stages],
          stageNames
        ),

        Amenities:
          typeof row[this.NEW_API_INDEX.amenities] === 'string'
            ? JSON.parse(row[this.NEW_API_INDEX.amenities])
            : row[this.NEW_API_INDEX.amenities] || [],

        TravelDate: travelDate,
        CancellationPolicies: row[this.NEW_API_INDEX.cancellation_policies],
        source: 'NEW_API'
      };
    });
  }


  private extractBaseFare(fareStr: string): number {
    if (!fareStr) return 0;

    // Take first fare only
    const first = fareStr.split(',')[0]; // DLB:4000.00
    const amount = first.split(':')[1];  // 4000.00

    return Number(parseFloat(amount));
  }


  parseStages(stageStr: string, stageNames: any) {
    if (!stageStr || typeof stageStr !== 'string') return [];

    return stageStr
      .split(',')
      .filter(s => s.includes('|'))
      .map(s => {
        const [id, time] = s.split('|');
        return {
          stageId: id,
          time,
          name: sanitizeText(stageNames?.[id] || 'Unknown')
        };
      });
  }



  extractAmenitiesFromNewApi(buses: any[]) {
    let amenities: any = [];
    buses.forEach(bus => {
      if (bus.amenities) {
        amenities.push(...bus.amenities);
      }
    });
    return [...new Set(amenities)];
  }

  getFormattedTime(timeStr: any): string {
    if (!timeStr) return '';
    const m = moment.tz(timeStr, 'Asia/Kolkata');
    if (m.isValid()) {
      return m.format('HH:mm');
    }
    if (typeof timeStr === 'string') {
      const match = timeStr.match(/(\d{2}):(\d{2})/);
      if (match) {
        return match[0];
      }
      return timeStr.slice(11, 16);
    }
    return '';
  }

  getDiffInMinutes(timeStrA: string, timeStrB: string): number {
    const getMinutes = (t: string) => {
      const parts = t.split(':');
      if (parts.length < 2) return 0;
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };
    return Math.abs(getMinutes(timeStrA) - getMinutes(timeStrB));
  }

  areBusesDuplicate(a: any, b: any): boolean {
    if (a.source === b.source) return false;
    const depA = this.getFormattedTime(a.DeptTime);
    const depB = this.getFormattedTime(b.DeptTime);
    if (!depA || !depB) return false;

    // 1. Departure times must be within 2 minutes
    if (this.getDiffInMinutes(depA, depB) > 2) return false;

    // 2. AC status must match
    const acA = (a.BusType?.IsAC || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    const acB = (b.BusType?.IsAC || '').replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (acA !== acB) return false;

    // 3. Seating type must match (Sleeper vs Seater)
    const seatA = (a.BusType?.Seating || '').toLowerCase();
    const seatB = (b.BusType?.Seating || '').toLowerCase();
    const isSleeperA = seatA.includes('sleeper');
    const isSleeperB = seatB.includes('sleeper');
    if (isSleeperA !== isSleeperB) return false;

    // 4. Company Names must share at least one significant word
    const cleanName = (name: string) => {
      return (name || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => {
          return w.length >= 3 && !['travel', 'travels', 'agency', 'cargo', 'tour', 'tours', 'online', 'express', 'transport', 'service', 'services', 'coaching', 'roadways', 'group', 'company', 'and', 'with', 'shree', 'shri', 'sree', 'new', 'best'].includes(w);
        });
    };

    const wordsA = cleanName(a.CompanyName || a.BusName);
    const wordsB = cleanName(b.CompanyName || b.BusName);

    const hasSharedWord = wordsA.some(w => wordsB.includes(w));
    if (!hasSharedWord) return false;

    return true;
  }


  Seating(Seating: any) {
    throw new Error('Method not implemented.');
  }



  extractUniquePoints() {
    const pickupNames = this.busList.flatMap((bus: any) => bus.Pickups.map((p: any) => p.PickupName));
    const dropoffNames = this.busList.flatMap((bus: any) => bus.Dropoffs.map((d: any) => d.DropoffName));
    const seatTypes = this.busList.flatMap((bus: any) => bus.BusType.Seating);
    const IsAC = this.busList.flatMap((bus: any) => bus.BusType.IsAC)
    const deparature = this.busList.flatMap((bus: any) => bus.DeptTime.slice(11, 16))
    const normalpickup = this.busList.flatMap((bus: any) => bus.RouteBusId)
    console.log(normalpickup);

    this.uniquePickupPoints = [...new Set(pickupNames)];
    this.uniqueDropoffPoints = [...new Set(dropoffNames)];
    this.uniqueSeatTypesandIsAC = [...new Set(seatTypes), ...new Set(IsAC)]
    this.uniquedeparature = [...new Set(deparature)]
  }

  operatorSearchTerm: string = '';

  get filteredBusList() {
    const uniqueBuses = this.filterUniqueCompanies(this.OriginalbusList || []);
    if (!this.operatorSearchTerm) {
      return uniqueBuses;
    }
    const term = this.operatorSearchTerm.toLowerCase().trim();
    return uniqueBuses.filter((item: any) =>
      item.CompanyName?.toLowerCase().includes(term)
    );
  }

  get filteredPickupPoints() {
    if (!this.boardingSearchTerm) {
      return this.uniquePickupPoints;
    }
    const term = this.boardingSearchTerm.toLowerCase();
    return this.uniquePickupPoints.filter((point: any) =>
      point?.toLowerCase().includes(term)
    );
  }

  get filteredDropoffPoints() {
    if (!this.droppingSearchTerm) {
      return this.uniqueDropoffPoints;
    }
    const term = this.droppingSearchTerm.toLowerCase();
    return this.uniqueDropoffPoints.filter((point: any) =>
      point?.toLowerCase().includes(term)
    );
  }



  // selectBus(busId: any) {
  //   this.router.navigate(['/bus-layout'], { queryParams: { from: this.from + "-" + this.fromId, to: this.to + "-" + this.toId, fromState: this.fromState, toState: this.toState, date: this.date, bus: busId } });
  // }

  selectBus(busId: any, source: string) {
    const selectedBus = this.busList.find((b: any) => b.RouteBusId === busId);
    this.router.navigate(['/bus-layout'], {
      queryParams: {
        fromCity: this.from,
        fromState: this.fromState,
        fromNewCityId: selectedBus?.origin_id || this.fromNewCityId,
        fromOldCityId: this.fromOldCityId,

        toCity: this.to,
        toState: this.toState,
        toNewCityId: selectedBus?.destination_id || this.toNewCityId,
        toOldCityId: this.toOldCityId,

        date: this.date,
        bus: busId,
        source: source,
      }
    });
  }


  hascheck(seating: any, bustype: any) {
    console.log(seating);
  }

  public routerLinkVariable = "/home";

  selectedItem: string = 'Departure time from source';

  selectItem(item: string) {
    this.selectedItem = item;
  }




  filterUniqueCompanies(arr: { CompanyName: string }[]): { CompanyName: string }[] {
    return arr.filter((item, index, self) =>
      index === self.findIndex((t) => t.CompanyName === item.CompanyName)
    );
  }



  checkSeatType(event: any) {
    const seatType = event.target.value;
    const isChecked = event.target.checked;
    const index = this.checkedSeatType.indexOf(seatType);

    if (isChecked) {
      if (index === -1) {
        this.checkedSeatType.push(seatType);
      }
    } else {
      if (index !== -1) {
        this.checkedSeatType.splice(index, 1);
      }
    }

    this.filterBusLists();
  }

  filterBusLists() {
    // 1. Departure ranges
    const selectedDeptRanges: { start: number; end: number }[] = [];
    if (this.DeptSelections.Morning) selectedDeptRanges.push({ start: 6, end: 12 });
    if (this.DeptSelections.Afternoon) selectedDeptRanges.push({ start: 12, end: 18 });
    if (this.DeptSelections.Evening) selectedDeptRanges.push({ start: 18, end: 24 });
    if (this.DeptSelections.Night) selectedDeptRanges.push({ start: 0, end: 6 });

    // 2. Arrival ranges
    const selectedArrRanges: { start: number; end: number }[] = [];
    if (this.ArrivalTime.Morning) selectedArrRanges.push({ start: 6, end: 12 });
    if (this.ArrivalTime.Afternoon) selectedArrRanges.push({ start: 12, end: 18 });
    if (this.ArrivalTime.Evening) selectedArrRanges.push({ start: 18, end: 24 });
    if (this.ArrivalTime.Night) selectedArrRanges.push({ start: 0, end: 6 });

    // 3. Amenity indexes
    const selectedAmenityIndexes = this.checkeAmenties.map((name: any) => this.AllAmenities.indexOf(name));

    this.busList = this.OriginalbusList.filter((bus: any) => {
      // Operator
      const matchesOperator = !this.selectBusOpt.length || this.selectBusOpt.includes(bus.CompanyName.toLowerCase().trim());

      // Pickup
      const matchesPickup = !this.checkedPickup.length || bus.Pickups.some((p: any) => this.checkedPickup.includes(p.PickupName));

      // Dropoff
      const matchesDropoff = !this.checkedDroping.length || bus.Dropoffs.some((d: any) => this.checkedDroping.includes(d.DropoffName));

      // Seat Type / AC
      const matchesSeatType = !this.checkedSeatType.length || 
        this.checkedSeatType.includes(bus.BusType.IsAC) || 
        this.checkedSeatType.includes(bus.BusType.Seating);

      // Amenities
      const matchesAmenities = !selectedAmenityIndexes.length || bus.Amenities.some((amt: any) => selectedAmenityIndexes.includes(amt));

      // Departure Time
      const matchesDeptTime = !selectedDeptRanges.length || (() => {
        const hour = parseInt(bus.DeptTime.slice(11, 13), 10);
        return selectedDeptRanges.some(range => hour >= range.start && hour < range.end);
      })();

      // Arrival Time
      const matchesArrTime = !selectedArrRanges.length || (() => {
        const hour = parseInt(bus.ArrTime.slice(11, 13), 10);
        return selectedArrRanges.some(range => hour >= range.start && hour < range.end);
      })();

      return matchesOperator && matchesPickup && matchesDropoff && matchesSeatType && matchesAmenities && matchesDeptTime && matchesArrTime;
    });

    this.busAvailable = this.busList.length;
  }

  checkPickup(event: any) {
    const pickupVal = event.target.value;
    const isChecked = event.target.checked;
    const index = this.checkedPickup.indexOf(pickupVal);
    if (isChecked) {
      if (index === -1) {
        this.checkedPickup.push(pickupVal);
      }
    } else {
      if (index !== -1) {
        this.checkedPickup.splice(index, 1);
      }
    }
    this.filterBusLists();
  }

  checkDropoff(event: any) {
    const dropoffVal = event.target.value;
    const isChecked = event.target.checked;
    const index = this.checkedDroping.indexOf(dropoffVal);
    if (isChecked) {
      if (index === -1) {
        this.checkedDroping.push(dropoffVal);
      }
    } else {
      if (index !== -1) {
        this.checkedDroping.splice(index, 1);
      }
    }
    this.filterBusLists();
  }

  checkBusOperator(event: any) {
    const selectedOperator = event.target.value;
    const selectedOperatorLower = selectedOperator.toLowerCase().trim();
    const isChecked = event.target.checked;

    const index = this.selectBusOpt.indexOf(selectedOperatorLower);

    if (isChecked) {
      if (index === -1) {
        this.selectBusOpt.push(selectedOperatorLower);
      }
    } else {
      if (index !== -1) {
        this.selectBusOpt.splice(index, 1);
      }
    }

    this.filterBusLists();
  }

  checkAmenities(event: any) {
    const amenityName = event.target.value;
    const isChecked = event.target.checked;
    const amenityIndex = this.AllAmenities.findIndex((res: any) => res === amenityName);

    if (amenityIndex === -1) return;

    const exists = this.checkeAmenties.includes(amenityName);
    if (isChecked) {
      if (!exists) {
        this.checkeAmenties.push(amenityName);
      }
    } else {
      if (exists) {
        this.checkeAmenties = this.checkeAmenties.filter((item: any) => item !== amenityName);
      }
    }

    this.filterBusLists();
  }

  busfarelowtohigh() {
    this.OriginalbusList.sort((a: any, b: any) => { return a.BusStatus.BaseFares[0] - b.BusStatus.BaseFares[0] })
    // console.log(this.busList);
  }

  earlydeparture() {
    const targetTime = this.uniquedeparature;
    this.busList = this.OriginalbusList
      .filter((bus: any) => bus.DeptTime.slice(11, 16) >= targetTime)
      .sort((a: any, b: any) => a.DeptTime.slice(11, 16).localeCompare(b.DeptTime));
    // console.log(this.busList);
  }

  latedeprature() {
    const targetTime = this.uniquedeparature;
    this.busList = this.OriginalbusList
      .filter((bus: any) => bus.DeptTime.slice(11, 16) > targetTime) // Filter buses with DeptTime later than targetTime
      .sort((a: any, b: any) => b.DeptTime.slice(11, 16).localeCompare(a.DeptTime)); // Sort the filtered list by DeptTime in descending order
    // console.log(this.busList);
  }



  applyTimeFilter(start: number, end: number, type: string) {

    // If same button clicked again → reload original data
    if (this.activeFilter === type) {
      this.clearAll();
      return;
    }
  
    this.activeFilter = type;
    this.isLoading = true;
  
    setTimeout(() => {
  
      this.busList = this.OriginalbusList
        .filter((bus: any) => {
          const hour = parseInt(bus.DeptTime.slice(11, 13));
          return hour >= start && hour < end;
        })
        .sort((a: any, b: any) =>
          a.DeptTime.localeCompare(b.DeptTime)
        );
  
      this.isLoading = false;
  
    }, 500); // small delay for loader effect
  }
  

  filterAMDeparture() {
    this.applyTimeFilter(0, 12, 'AM');
  }
  
  filterPMDeparture() {
    this.applyTimeFilter(12, 24, 'PM');
  }
  


  closeSearch() {
    // $("#from-city-search").css("display","none");
    // $("#to-city-search").css("display","none");
  }
  searchFromCity() {
    $("#from-city-search").css("display", "block");
  }

  searchBusFromPoint(city: any) {
    if (city.target.value.length >= 3) {
      this.api.getAllBuslist({ City: { $regex: '^' + city.target.value, $options: 'i' } }, 1, 10, '').subscribe(data => {
        this.fromCityList = data.data;
      })
    } else {
      this.fromCityList = [];
    }
  }


  SeatTypeandAC() {
    for (let i = 0; i < this.busList.length; i++) {
      this.IsAC = this.busList[i].BusType.IsAC
      console.log(this.IsAC);
    }
    if (this.IsAC !== "NON_AC") {
      console.log("AC");

    }
    else {
      console.log("NONAC");
    }


    // for (let i = 0; i < this.busList.length; i++) {
    //   this.seating = this.busList[i].BusType.Seating
    //   console.log(this.seating);
    // }
  }


  depraturetime() {
    this.filterBusLists();
  }

  Arrivaltime() {
    this.filterBusLists();
  }


  getValue() {
    this.selectedDept = [];
    for (const key in this.DeptSelections) {
      if (this.DeptSelections[key]) {
        this.selectedDept.push(`${key}`);
      }
    }
  }

  // search_name(){
  //   let input=document.getElementById('searchbar')
  //   console.log(input.target);

  //   // input = input.toLowerCase();
  //   // let li = document.getElementsByClassName('list')  
  //   // for(let i=0 ; i<li.length ; i++){
  //   //     if (!li[i].innerHTML.toLowerCase().includes(input)) {
  //   //         li[i].style.display = "none";
  //   //       }
  //   //       else {
  //   //         li[i].style.display = "list-item";
  //   //       }
  //   //     }
  //   }         




  clearModel() {
    this.modal.dismiss();
  }
  clearAll() {
    this.busList = [];
    this.busList = this.OriginalbusList;
    location.reload()
    this.modal.dismiss()
  }
  // applyFilters() {
  //   this.busList = this.busList.filter((bus: any) => {
  //     const matchesPickup = !this.checkedPickup.length || bus.Pickups.some((p: any) => this.checkedPickup.includes(p.PickupName));
  //     const matchesDropoff = !this.checkedDroping.length || bus.Dropoffs.some((d: any) => this.checkedDroping.includes(d.DropoffName));
  //     const matchesIsAC = this.checkedSeatType.includes(bus.BusType.IsAC);
  //     return matchesPickup && matchesDropoff && matchesIsAC;



  //   });


  //   this.modal.dismiss();
  // }
}
