/* Don't put secret configuration settings in this file, this is rendered
by the client. */

const config = {
  auth: {
    clientId: '98ad4731-918c-4dd0-b91f-beafb7761b40',
    authority: 'https://login.microsoftonline.com/organizations/',
    redirectUri: 'https://localhost',
    postLogoutRedirectUri: 'https://localhost/signedout'
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  api: {
    scopes: ['https://whiteknightit.com.au/1c9ceae4-e930-41e0-a851-f99c3f6271b3/ffpp-api.access'],
    swagger: true,
    deviceTag: '788a68'
  },
  ui: {
    frontEndUrl: 'https://localhost',
    swaggerUi: true
  }
};