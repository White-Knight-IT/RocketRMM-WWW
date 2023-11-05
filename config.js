/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '6849cdd5-83c2-48e8-9477-1eb3a79ab0ea',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/17a1314a-e926-43b9-8b35-06bce2fb6c27/rocketrmm-api.access'],
    swagger: true,
    deviceTag: 'a27b3f'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};