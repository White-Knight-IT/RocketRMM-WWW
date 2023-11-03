/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '33148f83-ce76-454e-9228-f6b67df6f513',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/737e8a69-8b42-487c-acb0-0a19e887b9fb/rocketrmm-api.access'],
    swagger: true,
    deviceTag: '24ea38'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};