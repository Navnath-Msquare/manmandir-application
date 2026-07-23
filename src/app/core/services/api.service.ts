import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  public _headers: any;

  constructor(public http: HttpClient, public auths: AuthenticationService) {
    this._headers = {
      'Content-Type': 'application/json'
    };
  }


  addMoney(userId: any, amount: any) {
    const data = JSON.stringify({
      "userId": userId,
      "amount": amount,
    });

    return this.http.post<any>(`${environment.baseURL}wallet/add-money`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }

  createWallet(data: any) {

    return this.http.post<any>(`${environment.baseURL}WalletTransaction`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }

  createPaymentOrder(amount: any, orderId: any) {
    const data = JSON.stringify({
      "amount": amount,
      "orderId": orderId,
    });

    return this.http.post<any>(`${environment.baseURL}comman/create-payment-order`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }


  // All Bookings
  getAllWalletTransactions(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}WalletTransaction/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }

  userWalletBalance(userId: any) {
    return this.http.get<any>(`${environment.baseURL}WalletTransaction/user-balance/` + userId, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }


  updateUser(data: any, userId: any) {
    return this.http.put<any>(`${environment.baseURL}auth/userUpdate/` + userId, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }


  serverRequest(method: any, url: any, data: any) {
    let sData = JSON.stringify({
      method: method,
      url: url,
      data: data
    });

    console.log("SDatata balaji ---> ", sData)

    return this.http.post<any>("https://api.karobooking.com/server/create-server-request", sData, { headers: { 'Content-Type': 'application/json' } })
      //return this.http.post<any>(`${environment.baseURL}server/create-server-request`, sData, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }

  searchBus(term: any) {
    return this.http.get<any>(`${environment.baseURL}BusList/get/` + term, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map(data => {
        return data;
      }));
  }

  // All Bookings
  getAllBuslist(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}cityMaster/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }

  // All User
  getAllUser(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}auth/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }

  /*********************************   Banner   ***********************************/

  // Create Banner
  createBanner(data: any) {

    return this.http.post<any>(`${environment.baseURL}banner/create`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }

  // Update Banner
  updateBanner(data: any, id: any) {

    return this.http.put<any>(`${environment.baseURL}banner/` + id, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }



  // All Banner
  getAllBanner(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}banner/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }

  // Single Banner
  getSingleBanner(id: any) {

    return this.http.get<any>(`${environment.baseURL}banner/` + id)
      .pipe(map((data, re) => {
        return data;
      }));
  }


  // Delete Banner
  deleteBanner(id: any) {

    return this.http.delete<any>(`${environment.baseURL}banner/` + id)
      .pipe(map((data, re) => {
        return data;
      }));
  }

  /*********************************   Coupon   ***********************************/

  // Create Coupon
  createCoupon(data: any) {

    return this.http.post<any>(`${environment.baseURL}coupon`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }

  // Update Coupon
  updateCoupon(data: any, id: any) {

    return this.http.put<any>(`${environment.baseURL}coupon/` + id, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }


  // All coupon
  getCoupon(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}coupon/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }



  // Delete Coupon
  deleteCoupon(id: any) {

    return this.http.delete<any>(`${environment.baseURL}coupon/` + id)
      .pipe(map((data, re) => {
        return data;
      }));
  }

  /*********************************   Bookings   ***********************************/

  // Create Bookings
  createBookings(data: any) {

    return this.http.post<any>(`${environment.baseURL}bookings`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }

  // Update Bookings
  updateBookings(data: any, id: any) {

    return this.http.put<any>(`${environment.baseURL}bookings/` + id, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data, re) => {
        return data;
      }));
  }


  // All Bookings
  getBookings(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}bookings/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }



  // Delete Bookings
  deleteBookings(id: any) {

    return this.http.delete<any>(`${environment.baseURL}bookings/` + id)
      .pipe(map((data, re) => {
        return data;
      }));
  }


  getSubscriptions(condition: any, page: number = 1, limit: number = 25, searchTerm: any) {
    return this.http.post<any>(`${environment.baseURL}/subscription/get?page=` + page + '&limit=' + limit + '&searchTerm=' + searchTerm, JSON.stringify(condition), { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }

  updateSubscriptions(data: any, id: any) {
    return this.http.put<any>(`${environment.baseURL}/subscription/` + id, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }
  createSubscriptions(data: any) {
    return this.http.post<any>(`${environment.baseURL}/subscription`, data, { headers: { 'Content-Type': 'application/json' } })
      .pipe(map((data: any) => {
        return data;
      }));
  }



  serverRequestGds(method: any, url: any, data: any) {
    return this.http.post<any>(`${environment.baseURL}gds`, data, {
      headers: { 'Content-Type': 'application/json' }
    }).pipe(map((data: any) => data));
  }


}
