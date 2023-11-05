/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '0802db63-dc88-466a-82e4-5a1639537afe',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://rocketrmm1.wkit.com.au',
    postLogoutRedirectUri: 'https://rocketrmm1.wkit.com.au/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/ab4a2130-1d47-4612-99fc-81ff07189b0c/rocketrmm-api.access'],
    swagger: true,
    deviceTag: '48d4d0'
  },
  ui: {
    frontEndUrl: 'https://rocketrmm1.wkit.com.au',
    swaggerUi: true
  }
};