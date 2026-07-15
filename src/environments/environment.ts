// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
//baseURL: 'http://localhost:4000/',
  baseURL: 'https://api.zerofollowup.com/',
  // baseURL: 'https://api.karobooking.com/',
  //   razorpayKey: 'rzp_test_WNng1yL47JloKB',
  //  razorpayKeySecret: 'gN0Or2S0qTDYCwDmtznovjAE',

  // Razorpay test key and secret key
  razorpayKey: 'rzp_test_TDG1MR7TQnALrl',
  razorpayKeySecret: 'MF3Ui389lxw5K63Zkx0SQakX',
  busApi: 'https://partnerapi.iamgds.com/ota/',
  busTranApi: 'https://partnertranapi.iamgds.com/ota/',
  newApi: 'http://apistaging.ticketsimply.com',
  newApikey: 'TSHSPFAPI58368531'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
