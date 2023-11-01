async function FetchUrl(url, requestOptions, signIn=true, repeatable=true)
{
  async function RepeatableFetch(url, requestOptions, contentType='application/json')
  {
    if(signIn)
    {
      var signInData = await SignIn();
      requestOptions.credentials = 'include';
      requestOptions.headers = {
        'Authorization': 'Bearer '+signInData.accessToken,
        'Content-Type': contentType
      };
    }
    else
    {
      requestOptions.headers = {
        'Content-Type': contentType
      };
    }
    let response = await fetch(url, requestOptions);

    try {
      return {
        'json': await response.json(),
        'status': response.status,
        'ok': response.ok
      }
    }
    catch(error)
    {
      console.error(`An error occured parsing HTTP response: ${error}`);
      return {
        'json': null,
        'status': response.status,
        'ok': response.ok
      }
    }
  }

  var response = await RepeatableFetch(url, requestOptions);

  if(response.ok)
  {
    return response;
  }
  else
  {
    if(repeatable)
    {
      console.error(`Error with url ${url} - Retrying`)

      response = await RepeatableFetch(url, requestOptions);
      
      if(!response.ok)
      {
        console.error(`Error with url ${url} - Retry attempt failed, giving up`)
      }
    }
    else
    {
      console.error(`Error with url ${url} - ${error} - NOT Retrying`)
    }

    return response;
  }
}

async function AuthMe() {
  return await CallApi('/.auth/me', { method: 'GET' });
}

async function CallApi(url,method,signIn)
{
  try
  {
    return await FetchUrl(url,method,signIn)
  }
  catch(error)
  {
    console.error(error);
  }
}

async function EditProfile(userId,tenantName,tenantDomain, tenantId, tableSize, defaultUsage)
{
  const requestOptions = {
    method: 'PUT',
    body: JSON.stringify({ userId: userId, lastTenantName: tenantName, lastTenantDomainName: tenantDomain, lastTenantCustomerId: tenantId, defaultPageSize: tableSize, defaultUsageLocation: defaultUsage})
  };
  return await CallApi(`/api/EditUserProfile`, requestOptions)
}

async function ExchangeTokenUrlCode()
{
  return await CallApi(`/bootstrap/GetExchangeTokenUrlCode`, { method: 'GET' }, false);
}

async function GetTenants(allTenantSelector = false)
{
  return await CallApi(`/api/ListTenants?AllTenantSelector=${allTenantSelector}`, { method: 'GET' });
}

async function GraphTokenUrl()
{
  return await CallApi(`/bootstrap/GetGraphTokenUrl`, { method: 'GET' }, false);
}

async function GetHeartbeat()
{
  return await CallApi(`/api/Heartbeat`, { method: 'GET' });
}

async function TokenStatus()
{
  return await CallApi(`/bootstrap/TokenStatus`, { method: 'GET' }, false);
}