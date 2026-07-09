// import { Component, OnInit, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';
// import { IonSlides, ModalController, ToastController, Platform, IonRouterOutlet } from '@ionic/angular';
// import * as $ from 'jquery';
// import { ApiService } from '../core/services/api.service';
// import { AuthenticationService } from '../core/services/authentication.service';
// import { ProfileUpdateComponent } from '../core/shared/profile-update/profile-update.component';
// import { environment } from 'src/environments/environment';
// import { log } from 'console';
// import * as moment from 'moment-timezone';
// import { App } from '@capacitor/app';
// import { Location } from '@angular/common';

// @Component({
//   selector: 'app-home',
//   templateUrl: 'home.page.html',
//   styleUrls: ['home.page.scss']
// })
// export class HomePage implements OnInit {

//   fromCity = "";
//   fromState = "";
//   fromCityId = "";


//   toCity = "";
//   toState = "";
//   toCityId = "";

//   journeyDate: any = "";

//   otherDate: any;

//   fromCityList: any = [];
//   toCityList: any = [];

//   banners: any = [];
//   data: any;

//   slideOpts = {
//     initialSlide: 0,
//     speed: 400
//   };

//   clickTrigger: any = false;
//   destinationModal: any = false;
//   sourceModal: any = false;

//   slidesOptions = {
//     slidesPerView: 2.5,
//     spaceBetween: 0,
//     autoplay: 0,
//     loop: false
//   }
//   @ViewChild("mySlider") slides!: IonSlides;

//   recentSearches: any = [];

//   journeyData: any = [];
//   baseURL = environment.baseURL;
//   backButtonSubscription: any;
//   fromOldCityId: any = "";
//   toOldCityId: any = "";


//   constructor(public api: ApiService, public auth: AuthenticationService, public router: Router, public toastController: ToastController, public modalController: ModalController, public platform: Platform, private routerOutlet: IonRouterOutlet, private location: Location) {
//     // this.platform.backButton.subscribeWithPriority(-1, () => {
//     //   if (!this.routerOutlet.canGoBack()) {
//     //     App.exitApp();
//     //   }
//     // });
//   }

//   ngOnInit() {
//     let recentSearch = localStorage.getItem('recentSearch');
//     const rawData = recentSearch ? JSON.parse(recentSearch) : [];
//     this.recentSearches = rawData
//       .filter((c: any) => c.city || c.City)
//       .map((c: any) => ({
//         City: c.City || c.city,
//         State: c.State || c.state || '',
//         newCityId: c.newCityId,
//         oldCityId: c.oldCityId
//       }));

//     console.log(this.recentSearches)
//     // Save back cleaned data
//     localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));

//     if (!this.auth.currentUserValue.name) {
//       this.openModal();
//     } else {
//       // this.modalController.dismiss()
//     }
//     this.api.getAllBanner({ role: "User" }, 1, 10, "").subscribe((data: any) => {
//       this.banners = data.data;
//     })

//     this.fetchBookingData();


//   }


//   fetchBookingData() {
//     this.api.getBookings({ status: { $ne: "Pending" }, user: this.auth.currentUserValue._id, ArrivalDateTime: { $gte: moment().tz('Asia/Kolkata') } }, 1, 50, "").subscribe(res => {
//       console.info(res);
//       this.journeyData = res.data;
//     }, error => {
//       console.error(error);
//     })
//   }


//   ionViewDidEnter() {
//     this.slides.startAutoplay();

//     if (this.backButtonSubscription) {
//       this.backButtonSubscription.unsubscribe();
//     }


//     this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
//       if (this.router.url === '/home') {
//         App.exitApp(); // Exit the app if on home
//       } else {
//         this.location.back(); // Otherwise, navigate back
//       }
//     });
//   }

//   ionViewWillLeave() {
//     this.slides.stopAutoplay();
//     if (this.backButtonSubscription) {
//       this.backButtonSubscription.unsubscribe();
//     }
//   }


//   searchBusFromCity(city: any) {
//     if (city.target.value.length >= 1) {

//       let search: any = { City: { $regex: '^' + city.target.value, $options: 'i' } };

//       if (city.target.value.toLowerCase() === 'goa') {
//         search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }
//       else if (city.target.value.toLowerCase() === 'chennai') {
//         search = { City: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }
//       else if (city.target.value.toLowerCase() === 'chandigarh') {
//         search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }

//       this.api.getAllBuslist(search, 1, 50, '').subscribe(data => {
//         let filteredCities = [];

//         for (let i = 0; i < data.data.length; i++) {
//           if (data.data[i].CityId !== 13975 && data.data[i].CityId !== 13605) {
//             filteredCities.push(data.data[i]);
//           }
//         }
//         if (city.target.value.toLowerCase() === 'goa') {
//           const goaCity = { oldCityId: 6578, newCityId: 428, City: 'Goa', State: 'Goa' };
//           filteredCities = [goaCity, ...filteredCities];
//         }
//         // filteredCities = [goaCity, ...filteredCities];
//         this.fromCityList = filteredCities;
//       });
//     } else {
//       this.fromCityList = [];
//     }
//   }

//   // { $regex: '.*' + city.target.value + '.*', $options: 'i' }  all search
//   searchBusToCity(city: any) {
//     if (city.target.value.length >= 1) {
//       let search: any = { City: { $regex: '^' + city.target.value, $options: 'i' } };

//       if (city.target.value.toLowerCase() === 'goa') {
//         search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }

//       else if (city.target.value.toLowerCase() === 'chennai') {
//         search = { City: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }

//       else if (city.target.value.toLowerCase() === 'chandigarh') {
//         search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
//       }


//       this.api.getAllBuslist(search, 1, 50, '').subscribe(data => {
//         let filteredCities = [];
//         for (let i = 0; i < data.data.length; i++) {
//           if (data.data[i].CityId !== 13975 && data.data[i].CityId !== 13605) {
//             filteredCities.push(data.data[i]);
//           }
//         }
//         if (city.target.value.toLowerCase() === 'goa') {
//           const goaCity = { oldCityId: 6578, newCityId: 428, City: 'Goa', State: 'Goa' };
//           filteredCities = [goaCity, ...filteredCities];
//         }
//         this.toCityList = filteredCities;
//       })
//     } else {
//       this.toCityList = [];
//     }

//   }


//   searchFromCity() {
//     $("#from-city-search").css("display", "block");
//   }

//   searchToCity() {
//     $("#to-city-search").css("display", "block");
//   }

//   openSourceModal() {
//     this.sourceModal = true;
//     if (this.fromCityId) {
//       this.fromCity = "";
//       this.fromCityId = "";
//       this.fromState = "";
//     }
//   }

//   openDestinationModal() {
//     this.destinationModal = true;
//     if (this.toCityId) {
//       this.toCity = "";
//       this.toCityId = "";
//       this.toState = "";
//     }
//   }

//   clearFromCity() {
//     if (!this.fromCityId) {
//       this.fromCity = "";
//       this.fromState = "";
//       this.fromCityId = "";
//     }
//     this.sourceModal = false;
//   }

//   // selectFromCity(id: any, state: any, city: any) {
//   //   this.fromCity = "";
//   //   this.fromState = "";
//   //   this.fromCityId = "";
//   //   this.fromCity = city;
//   //   this.fromState = state;
//   //   this.fromCityId = id;
//   //   let cityData = { city: city, state: state, id: id };
//   //   if (!this.recentSearches.some((res: any) => { return res.id == id })) {
//   //     this.recentSearches.push(cityData);
//   //     localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
//   //   }
//   //   this.sourceModal = false;
//   //   $("#from-city-search").css("display", "none");
//   // }

//   selectFromCity(cityObj: any) {

//     if (this.toCityId && this.toCityId === cityObj.newCityId) {
//       // alert('This city is already selected as Destination');
//       this.presentToast("This city is already selected as Destination", "danger");
//       return;
//     }

//     this.fromCity = cityObj.City;
//     this.fromState = cityObj.State;

//     this.fromCityId = cityObj.newCityId;
//     this.fromOldCityId = cityObj.oldCityId;

//     const cityData = {
//       City: cityObj.City,
//       State: cityObj.State,
//       newCityId: cityObj.newCityId,
//       oldCityId: cityObj.oldCityId
//     };

//     console.log(cityObj)
//     if (!this.recentSearches.some((c: any) => c.newCityId === cityObj.newCityId)) {
//       this.recentSearches.push(cityData);
//       localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
//     }

//     this.sourceModal = false;
//   }




//   clearToCity() {
//     if (!this.toCityId) {
//       this.toCity = "";
//       this.toState = "";
//       this.toCityId = "";
//     }
//     this.destinationModal = false;
//   }

//   // selectToCity(id: any, state: any, city: any) {
//   //   this.toCity = "";
//   //   this.toCityId = "";
//   //   this.toState = "";
//   //   this.toCity = city;
//   //   this.toState = state;
//   //   this.toCityId = id;
//   //   let cityData = { city: city, state: state, id: id };
//   //   if (!this.recentSearches.some((res: any) => { return res.id == id })) {
//   //     this.recentSearches.push(cityData);
//   //     localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
//   //   }
//   //   this.destinationModal = false;
//   //   $("#to-city-search").css("display", "none");
//   // }
//   selectToCity(cityObj: any) {

//     if (this.fromCityId && this.fromCityId === cityObj.newCityId) {
//       this.presentToast("This city is already selected as Source", "danger");
//       return;
//     }

//     this.toCity = cityObj.City;
//     this.toState = cityObj.State;

//     this.toCityId = cityObj.newCityId;
//     this.toOldCityId = cityObj.oldCityId;


//     const cityData = {
//       City: cityObj.City,
//       State: cityObj.State,
//       newCityId: cityObj.newCityId,
//       oldCityId: cityObj.oldCityId
//     };

//     if (!this.recentSearches.some((c: any) => c.newCityId === cityObj.newCityId)) {
//       this.recentSearches.push(cityData);
//       localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
//     }

//     this.destinationModal = false;
//     console.log(cityObj)
//   }


//   exchangeCity() {
//     // [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
//     // [this.fromCityId, this.toCityId] = [this.toCityId, this.fromCityId];

//     // City names
//     [this.fromCity, this.toCity] = [this.toCity, this.fromCity];

//     // New API City IDs
//     [this.fromCityId, this.toCityId] = [this.toCityId, this.fromCityId];

//     // Old API City IDs
//     [this.fromOldCityId, this.toOldCityId] = [this.toOldCityId, this.fromOldCityId];
//   }

//   closeSearch() {
//     // $("#from-city-search").css("display","none");
//     // $("#to-city-search").css("display","none");
//   }

//   selectToday() {
//     $("#todayChip").removeClass("px-6");
//     $("#todayChip").addClass("px-3");
//     console.log(moment().tz('Asia/Kolkata'))
//     this.journeyDate = moment().tz('Asia/Kolkata');

//     if (this.journeyData) {
//       this.findBuses();
//     }

//   }

//   selectTomorrow() {
//     $("#tomorrowChip").removeClass("px-6");
//     $("#tomorrowChip").addClass("px-3");
//     this.journeyDate = moment().tz('Asia/Kolkata');
//     this.journeyDate.add(1, 'd')

//     if (this.journeyData) {
//       this.findBuses();
//     }
//   }

//   selectOtherEvent(event: any) {
//     this.otherDate = event.target.value;
//     // console.log("Clicking..." , this.otherDate)
//     this.journeyDate = this.otherDate;
//     this.clickTrigger = false;
//   }

//   selectOther() {
//     this.journeyDate = this.otherDate;
//     this.clickTrigger = false;
//   }

//   clearDateSelection() {
//     this.journeyDate = "";
//     this.otherDate = "";
//   }


//   findBuses() {

//     let journeyDate: any;
//     // let from = this.fromCity + "-" + this.fromCityId;
//     // let to = this.toCity + "-" + this.toCityId;

//     let from = {
//       city: this.fromCity,
//       newCityId: this.fromCityId,
//       oldCityId: this.fromOldCityId
//     };

//     let to = {
//       city: this.toCity,
//       newCityId: this.toCityId,
//       oldCityId: this.toOldCityId
//     };


//     if (this.fromCityId == "") {
//       this.presentToast("Please Select From City", "danger");
//       return;
//     }

//     if (this.toCityId == "") {
//       this.presentToast("Please Select To City", "danger");
//       return;
//     }

//     if (this.journeyDate == "") {
//       this.presentToast("Please Select Journey date", "danger");
//       return;
//     }


//     switch (this.journeyDate) {
//       case "today":
//         journeyDate = moment().tz('Asia/Kolkata');
//         journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//         break;
//       case "tomorrow":
//         journeyDate = moment().tz('Asia/Kolkata');
//         journeyDate.add(1, 'd')
//         journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//         break;
//       default:
//         journeyDate = moment(this.journeyDate).tz('Asia/Kolkata');
//         journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
//         break;
//     }

//     const formattedDate = journeyDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
//     // this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: formattedDate }, replaceUrl: true });
//     this.router.navigate(['/bus-search'], {
//       queryParams: {
//         fromCity: this.fromCity,
//         fromNewCityId: this.fromCityId,
//         fromOldCityId: this.fromOldCityId,

//         toCity: this.toCity,
//         toNewCityId: this.toCityId,
//         toOldCityId: this.toOldCityId,

//         date: formattedDate
//       },
//       replaceUrl: true
//     });

//   }

//   async presentToast(message: string, color: string) {
//     const toast = await this.toastController.create({
//       message: message,
//       color: color,
//       duration: 1500,
//       position: "bottom"
//     });

//     await toast.present();
//   }


//   async openModal() {
//     const modal = await this.modalController.create({
//       component: ProfileUpdateComponent,
//       componentProps: { value: 123 },
//       initialBreakpoint: 0.79,
//       backdropDismiss: false,
//       mode: "ios",
//       cssClass: "profile-update"
//     });
//     return await modal.present();
//   }

// }


import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonSlides, ModalController, ToastController, Platform, IonRouterOutlet } from '@ionic/angular';
import * as $ from 'jquery';
import { ApiService } from '../core/services/api.service';
import { AuthenticationService } from '../core/services/authentication.service';
import { ProfileUpdateComponent } from '../core/shared/profile-update/profile-update.component';
import { environment } from 'src/environments/environment';
import { log } from 'console';
import * as moment from 'moment-timezone';
import { App } from '@capacitor/app';
import { Location } from '@angular/common';
 
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
 
  fromCity = "";
  fromState = "";
  fromCityId = "";
 
 
  toCity = "";
  toState = "";
  toCityId = "";
 
  journeyDate: any = "";
 
  otherDate: any;
 
  fromCityList: any = [];
  toCityList: any = [];
 
  banners: any = [];
  data: any;
 
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };
 
  clickTrigger: any = false;
  destinationModal: any = false;
  sourceModal: any = false;
 
  slidesOptions = {
    slidesPerView: 2.5,
    spaceBetween: 0,
    autoplay: 0,
    loop: false
  }
  @ViewChild("mySlider") slides!: IonSlides;
 
  recentSearches: any = [];
 
  journeyData: any = [];
  baseURL = environment.baseURL;
  backButtonSubscription: any;
  fromOldCityId: any = "";
  toOldCityId: any = "";
 
 
  constructor(public api: ApiService, public auth: AuthenticationService, public router: Router, public toastController: ToastController, public modalController: ModalController, public platform: Platform, private routerOutlet: IonRouterOutlet, private location: Location) {
    // this.platform.backButton.subscribeWithPriority(-1, () => {
    //   if (!this.routerOutlet.canGoBack()) {
    //     App.exitApp();
    //   }
    // });
  }
 
  ngOnInit() {
    let recentSearch = localStorage.getItem('recentSearch');
    const rawData = recentSearch ? JSON.parse(recentSearch) : [];
    this.recentSearches = rawData
      .filter((c: any) => c.city || c.City)
      .map((c: any) => {
        let city = c.City || c.city;
        let state = c.State || c.state || '';
        let newCityId = c.newCityId;
        let oldCityId = c.oldCityId;
        
        const cityLower = city.toLowerCase().trim();
        const stateLower = state.toLowerCase().trim();
        if ((cityLower === 'aurangabad' || cityLower.includes('sambhajinagar') || cityLower.includes('sambhaji')) && stateLower === 'maharashtra') {
          city = 'Chhatrapati Sambhajinagar (Aurangabad)';
          newCityId = 24852;
          oldCityId = 4068;
        }

        return {
          City: city,
          State: state,
          newCityId: newCityId,
          oldCityId: oldCityId
        };
      });

    const uniqueRecent: any[] = [];
    const seen = new Set();
    for (const item of this.recentSearches) {
      const key = `${item.City.toLowerCase()}_${item.State.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRecent.push(item);
      }
    }
    this.recentSearches = uniqueRecent;
 
    console.log(this.recentSearches)
    // Save back cleaned data
    localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
 
    if (!this.auth.currentUserValue.name) {
      this.openModal();
    } else {
      // this.modalController.dismiss()
    }
    this.api.getAllBanner({ role: "User" }, 1, 10, "").subscribe((data: any) => {
      this.banners = data.data;
    })
 
    this.fetchBookingData();
 
 
  }
 
 
  fetchBookingData() {
    this.api.getBookings({ status: { $ne: "Pending" }, user: this.auth.currentUserValue._id, ArrivalDateTime: { $gte: moment().tz('Asia/Kolkata') } }, 1, 50, "").subscribe(res => {
      console.info(res);
      this.journeyData = res.data;
    }, error => {
      console.error(error);
    })
  }
 
 
  ionViewDidEnter() {
    this.slides.startAutoplay();
 
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
 
 
    this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
      if (this.router.url === '/home') {
        App.exitApp(); // Exit the app if on home
      } else {
        this.location.back(); // Otherwise, navigate back
      }
    });
  }
 
  ionViewWillLeave() {
    this.slides.stopAutoplay();
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
  }
 
 
  preprocessCities(cities: any[], searchTerm: string): any[] {
    const val = (searchTerm || '').toLowerCase().trim();
    
    // 1. Filter out any raw Aurangabad (Maharashtra) or Chatrapati SambhajiNagar (Maharashtra)
    let list = (cities || []).filter((c: any) => {
      const cityLower = (c.City || '').toLowerCase().trim();
      const stateLower = (c.State || '').toLowerCase().trim();
      const isTarget = (cityLower === 'aurangabad' || cityLower.includes('sambhajinagar') || cityLower.includes('sambhaji')) && stateLower === 'maharashtra';
      return !isTarget;
    });

    // 2. Check if search term is relevant to Aurangabad or Sambhajinagar
    const matchesTarget = 
      val.includes('aurang') || 
      val.includes('sambh') || 
      val.includes('chhatra') || 
      val.includes('chatra');

    if (matchesTarget) {
      const mergedCity = {
        oldCityId: 4068,
        newCityId: 24852,
        City: 'Chhatrapati Sambhajinagar (Aurangabad)',
        State: 'Maharashtra'
      };
      
      // Prepend to list
      list = [mergedCity, ...list];
    }

    return list;
  }

  searchBusFromCity(city: any) {
    if (city.target.value.length >= 1) {

      let search: any = { City: { $regex: '^' + city.target.value, $options: 'i' } };

      if (city.target.value.toLowerCase() === 'goa') {
        search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }
      else if (city.target.value.toLowerCase() === 'chennai') {
        search = { City: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }
      else if (city.target.value.toLowerCase() === 'chandigarh') {
        search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }

      this.api.getAllBuslist(search, 1, 50, '').subscribe(data => {
        let filteredCities = data.data.filter((c: any) =>
          c.CityId !== 13975 && c.CityId !== 13605
        );
        if (city.target.value.toLowerCase() === 'goa') {
          const goaCity = { oldCityId: 6578, newCityId: 428, City: 'Goa', State: 'Goa' };
          filteredCities = [goaCity, ...filteredCities];
        }
        
        let preprocessed = this.preprocessCities(filteredCities, city.target.value);
        // FIX: merge duplicate city entries (same City+State) into one,
        // combining oldCityId & newCityId so both APIs always get valid IDs.
        this.fromCityList = this.mergeDuplicateCities(preprocessed);
      });
    } else {
      this.fromCityList = [];
    }
  }

  // { $regex: '.*' + city.target.value + '.*', $options: 'i' }  all search
  searchBusToCity(city: any) {
    if (city.target.value.length >= 1) {
      let search: any = { City: { $regex: '^' + city.target.value, $options: 'i' } };

      if (city.target.value.toLowerCase() === 'goa') {
        search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }

      else if (city.target.value.toLowerCase() === 'chennai') {
        search = { City: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }

      else if (city.target.value.toLowerCase() === 'chandigarh') {
        search = { State: { $regex: '.*' + city.target.value + '.*', $options: 'i' } };
      }


      this.api.getAllBuslist(search, 1, 50, '').subscribe(data => {
        let filteredCities = data.data.filter((c: any) =>
          c.CityId !== 13975 && c.CityId !== 13605
        );
        if (city.target.value.toLowerCase() === 'goa') {
          const goaCity = { oldCityId: 6578, newCityId: 428, City: 'Goa', State: 'Goa' };
          filteredCities = [goaCity, ...filteredCities];
        }
        
        let preprocessed = this.preprocessCities(filteredCities, city.target.value);
        // FIX: merge duplicate city entries (same City+State) into one,
        // combining oldCityId & newCityId so both APIs always get valid IDs.
        this.toCityList = this.mergeDuplicateCities(preprocessed);
      })
    } else {
      this.toCityList = [];
    }

  }
 
 
  searchFromCity() {
    $("#from-city-search").css("display", "block");
  }
 
  searchToCity() {
    $("#to-city-search").css("display", "block");
  }
 
  openSourceModal() {
    this.sourceModal = true;
    if (this.fromCityId) {
      this.fromCity = "";
      this.fromCityId = "";
      this.fromState = "";
    }
  }
 
  openDestinationModal() {
    this.destinationModal = true;
    if (this.toCityId) {
      this.toCity = "";
      this.toCityId = "";
      this.toState = "";
    }
  }
 
  clearFromCity() {
    if (!this.fromCityId) {
      this.fromCity = "";
      this.fromState = "";
      this.fromCityId = "";
    }
    this.sourceModal = false;
  }
 
  // selectFromCity(id: any, state: any, city: any) {
  //   this.fromCity = "";
  //   this.fromState = "";
  //   this.fromCityId = "";
  //   this.fromCity = city;
  //   this.fromState = state;
  //   this.fromCityId = id;
  //   let cityData = { city: city, state: state, id: id };
  //   if (!this.recentSearches.some((res: any) => { return res.id == id })) {
  //     this.recentSearches.push(cityData);
  //     localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
  //   }
  //   this.sourceModal = false;
  //   $("#from-city-search").css("display", "none");
  // }
 
  selectFromCity(cityObj: any) {
 
    if (this.toCityId && this.toCityId === cityObj.newCityId) {
      // alert('This city is already selected as Destination');
      this.presentToast("This city is already selected as Destination", "danger");
      return;
    }
 
    this.fromCity = cityObj.City;
    this.fromState = cityObj.State;
 
    this.fromCityId = cityObj.newCityId;
    this.fromOldCityId = cityObj.oldCityId;
 
    const cityData = {
      City: cityObj.City,
      State: cityObj.State,
      newCityId: cityObj.newCityId,
      oldCityId: cityObj.oldCityId
    };
 
    console.log(cityObj)
    if (!this.recentSearches.some((c: any) => c.newCityId === cityObj.newCityId)) {
      this.recentSearches.push(cityData);
      localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
    }
 
    this.sourceModal = false;
  }
 
 
 
 
  clearToCity() {
    if (!this.toCityId) {
      this.toCity = "";
      this.toState = "";
      this.toCityId = "";
    }
    this.destinationModal = false;
  }
 
  // selectToCity(id: any, state: any, city: any) {
  //   this.toCity = "";
  //   this.toCityId = "";
  //   this.toState = "";
  //   this.toCity = city;
  //   this.toState = state;
  //   this.toCityId = id;
  //   let cityData = { city: city, state: state, id: id };
  //   if (!this.recentSearches.some((res: any) => { return res.id == id })) {
  //     this.recentSearches.push(cityData);
  //     localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
  //   }
  //   this.destinationModal = false;
  //   $("#to-city-search").css("display", "none");
  // }
  selectToCity(cityObj: any) {
 
    if (this.fromCityId && this.fromCityId === cityObj.newCityId) {
      this.presentToast("This city is already selected as Source", "danger");
      return;
    }
 
    this.toCity = cityObj.City;
    this.toState = cityObj.State;
 
    this.toCityId = cityObj.newCityId;
    this.toOldCityId = cityObj.oldCityId;
 
 
    const cityData = {
      City: cityObj.City,
      State: cityObj.State,
      newCityId: cityObj.newCityId,
      oldCityId: cityObj.oldCityId
    };
 
    if (!this.recentSearches.some((c: any) => c.newCityId === cityObj.newCityId)) {
      this.recentSearches.push(cityData);
      localStorage.setItem('recentSearch', JSON.stringify(this.recentSearches));
    }
 
    this.destinationModal = false;
    console.log(cityObj)
  }
 
 
  exchangeCity() {
    // [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
    // [this.fromCityId, this.toCityId] = [this.toCityId, this.fromCityId];
 
    // City names
    [this.fromCity, this.toCity] = [this.toCity, this.fromCity];
 
    // New API City IDs
    [this.fromCityId, this.toCityId] = [this.toCityId, this.fromCityId];
 
    // Old API City IDs
    [this.fromOldCityId, this.toOldCityId] = [this.toOldCityId, this.fromOldCityId];
  }
 
  closeSearch() {
    // $("#from-city-search").css("display","none");
    // $("#to-city-search").css("display","none");
  }
 
  /**
   * FIX (duplicate city issue):
   * The DB has multiple records for the same city name+state (e.g. two
   * "Aurangabad, Maharashtra" rows — one with newCityId, one without).
   * When user picks the entry without newCityId, the NEW API call fails
   * silently and fewer buses appear in search results.
   *
   * This method groups cities by City+State and merges duplicates into
   * one entry, always keeping the best available oldCityId & newCityId.
   */
  mergeDuplicateCities(cities: any[]): any[] {
    const map = new Map<string, any>();
 
    for (const city of cities) {
      const key = `${(city.City || '').toLowerCase().trim()}__${(city.State || '').toLowerCase().trim()}`;
 
      if (!map.has(key)) {
        map.set(key, { ...city });
      } else {
        const existing = map.get(key);
        // Fill in any missing IDs from duplicate entries
        if (!existing.oldCityId && city.oldCityId) existing.oldCityId = city.oldCityId;
        if (!existing.newCityId && city.newCityId) existing.newCityId = city.newCityId;
      }
    }
 
    return Array.from(map.values());
  }
 
  selectToday() {
    $("#todayChip").removeClass("px-6");
    $("#todayChip").addClass("px-3");
    console.log(moment().tz('Asia/Kolkata'))
    this.journeyDate = moment().tz('Asia/Kolkata');
 
    if (this.journeyData) {
      this.findBuses();
    }
 
  }
 
  selectTomorrow() {
    $("#tomorrowChip").removeClass("px-6");
    $("#tomorrowChip").addClass("px-3");
    this.journeyDate = moment().tz('Asia/Kolkata');
    this.journeyDate.add(1, 'd')
 
    if (this.journeyData) {
      this.findBuses();
    }
  }
 
  selectOtherEvent(event: any) {
    this.otherDate = event.target.value;
    // console.log("Clicking..." , this.otherDate)
    this.journeyDate = this.otherDate;
    this.clickTrigger = false;
  }
 
  selectOther() {
    this.journeyDate = this.otherDate;
    this.clickTrigger = false;
  }
 
  clearDateSelection() {
    this.journeyDate = "";
    this.otherDate = "";
  }
 
 
  findBuses() {
 
    let journeyDate: any;
    // let from = this.fromCity + "-" + this.fromCityId;
    // let to = this.toCity + "-" + this.toCityId;
 
    let from = {
      city: this.fromCity,
      newCityId: this.fromCityId,
      oldCityId: this.fromOldCityId
    };
 
    let to = {
      city: this.toCity,
      newCityId: this.toCityId,
      oldCityId: this.toOldCityId
    };
 
 
    if (this.fromCityId == "") {
      this.presentToast("Please Select From City", "danger");
      return;
    }
 
    if (this.toCityId == "") {
      this.presentToast("Please Select To City", "danger");
      return;
    }
 
    if (this.journeyDate == "") {
      this.presentToast("Please Select Journey date", "danger");
      return;
    }
 
 
    switch (this.journeyDate) {
      case "today":
        journeyDate = moment().tz('Asia/Kolkata');
        journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        break;
      case "tomorrow":
        journeyDate = moment().tz('Asia/Kolkata');
        journeyDate.add(1, 'd')
        journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        break;
      default:
        journeyDate = moment(this.journeyDate).tz('Asia/Kolkata');
        journeyDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
        break;
    }
 
    const formattedDate = journeyDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
    // this.router.navigate(['/bus-search'], { queryParams: { from: from, fromState: this.fromState, toState: this.toState, to: to, date: formattedDate }, replaceUrl: true });
    this.router.navigate(['/bus-search'], {
      queryParams: {
        fromCity: this.fromCity,
        fromNewCityId: this.fromCityId,
        fromOldCityId: this.fromOldCityId,
 
        toCity: this.toCity,
        toNewCityId: this.toCityId,
        toOldCityId: this.toOldCityId,
 
        date: formattedDate
      },
      replaceUrl: true
    });
 
  }
 
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: 1500,
      position: "bottom"
    });
 
    await toast.present();
  }
 
 
  async openModal() {
    const modal = await this.modalController.create({
      component: ProfileUpdateComponent,
      componentProps: { value: 123 },
      initialBreakpoint: 0.79,
      backdropDismiss: false,
      mode: "ios",
      cssClass: "profile-update"
    });
    return await modal.present();
  }
 
 
}