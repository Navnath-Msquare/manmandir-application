import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/auth.models';
import { ApiService } from './api.service';
import { catchError, map } from 'rxjs/operators'
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })


/**
 * Auth-service Component
 */
export class AuthenticationService {

    
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(public http: HttpClient, public router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem("currentUser")!));
    this.currentUser = this.currentUserSubject.asObservable();
   }

   public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  checkUser(mobile : any) {
    const data = JSON.stringify({
      "mobile": mobile,
      "role": "user"
    });

    return this.http.post<any>(`${environment.baseURL}auth/checkusermobile`,data,{headers:{'Content-Type': 'application/json'}})
    .pipe(map(data => {
      localStorage.setItem('currentUser', JSON.stringify(data.data));
      this.currentUserSubject.next(data.data);
      this.currentUser = this.currentUserSubject.asObservable();
      return data.data;
    }));
  }

  sendOTP(mobile : any) {
    const data = JSON.stringify({
      "mobile": mobile
    });

    return this.http.post<any>(`${environment.baseURL}auth/sendotp`,data,{headers:{'Content-Type': 'application/json'}})
    .pipe(map(data => {
      return data;
    }));
  }

  register(data : any) {

    return this.http.post<any>(`${environment.baseURL}auth/register`,data,{headers:{'Content-Type': 'application/json'}})
    .pipe(map(data => {
      return data;
    }));
  }

  updateData(data:any){
    this.currentUserSubject.next(data);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null!);
    this.router.navigate(['/welcome']);
  }

  
}

