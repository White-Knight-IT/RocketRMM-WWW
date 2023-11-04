/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '3d4395e4-51d7-4cd6-8e23-a1117b1f3489',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/6614781e-0208-4c7d-92d4-1e3686cdc73d/rocketrmm-api.access'],
    swagger: true,
    deviceTag: '24ea38'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};