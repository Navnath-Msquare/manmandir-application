// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: 'http://localhost:4000/',
  //baseURL: 'https://api.zerofollowup.com/',
  // baseURL: 'https://api.karobooking.com/',
  // LIVE KEYS (COMMENTED OUT AS REQUESTED)
  // razorpayKey: 'rzp_live_kgwQM75Yree4AU',
  // razorpayKeySecret: 'CNYXoyj3o3E0IYWDHgP0FSDy',
  // newApi: 'https://gds.ticketsimply.com',
  // newApikey: 'TSHSPFAPI58368531',

  // TEST / STAGING CREDENTIALS
  razorpayKey: 'rzp_test_TQ55Cv9cUpz7z9',
  razorpayKeySecret: 'cFCivn0wzdQ2f1y7gyrF4x8n',
  busApi: 'https://partnerapi.iamgds.com/ota/',
  busTranApi: 'https://partnertranapi.iamgds.com/ota/',
  newApi: 'https://gds-stg.ticketsimply.co.in',
  newApikey: 'TSYAJMAPI86883462'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
