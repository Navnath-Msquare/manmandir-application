import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { StatusComponent } from './status/status.component';
import { PassengerDetailsComponent } from './passenger-details/passenger-details.component';
import { BookingSummaryComponent } from './booking-summary/booking-summary.component';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'splash',
    loadChildren: () => import('./splash/splash.module').then(m => m.SplashPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'bus-search',
    loadChildren: () => import('./bus-search/bus-search.module').then(m => m.BusSearchPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'bus-layout',
    loadChildren: () => import('./bus-layout/bus-layout.module').then(m => m.BusLayoutPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'passenger-details',
   component:PassengerDetailsComponent
  },
  {
    path:'booking-summary',
    component:BookingSummaryComponent
  },

  {
    path: 'guest-details',
    loadChildren: () => import('./guest-details/guest-details.module').then(m => m.GuestDetailsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ticket-details',
    loadChildren: () => import('./ticket-details/ticket-details.module').then(m => m.TicketDetailsModule),
    canActivate: [AuthGuard]
  },
  { path: "status", component: StatusComponent },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
