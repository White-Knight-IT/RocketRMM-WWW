/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '06df2af7-2672-4509-b185-5b5a13108f82',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/0f47fcb9-5070-40ac-813a-ee655b59cb0f/rocketrmm-api.access'],
    swagger: true,
    deviceTag: '327796'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};