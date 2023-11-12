/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: 'e73ed9aa-5926-4f24-992c-c9448d7e713a',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/de8e827a-7799-48a7-a23f-23c6de81cf75/rocketrmm-api.access'],
    swagger: true,
    deviceTag: '0bb2ad'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};