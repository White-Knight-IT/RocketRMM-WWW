var expiresCount = 830;

window.addEventListener('popstate', function (event) {
  console.warn("Window Popstate Event");
	CallToAction(window.location.href);
});

async function Refresh()
{
  var tokenStatus = (await TokenStatus()).json;

  if(!tokenStatus.refreshToken || !tokenStatus.exchangeRefreshToken)
  {
    console.warn("Tokens are not setup, redirecting to complete bootstrap process..");
    LoadUrl('/setup/');
  }
  else
  {
    if(null==tokenGlobal)
    {
      await SignIn();
    }

    document.getElementById('tenantsDropdownButton').disabled=true;
    const [] = await Promise.allSettled([
      ProfileRefresh(), 
      TenantRefresh()
    ]);

    document.getElementById('tenantsDropdownButton').disabled=false;

    setInterval(Heartbeat, 120000);
  }
}

async function BootstrapRefresh()
{
  var graphUrl = (await GraphTokenUrl()).json;
  if(null != graphUrl.url && graphUrl.url != 'undefined')
  {
    document.getElementById("tokenLink").href=graphUrl.url;
  }
  BootstrapTokenCheck();
  setInterval(BootstrapTokenCheck, 1337);
}

async function PrimeToolTips()
{
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })
}

async function BootstrapTokenCheck()
{
  var tokenStatus = (await TokenStatus()).json;
  console.info(`Checking token status: ${tokenStatus}`);

  if (tokenStatus.refreshToken) {
    if(document.getElementById("grtIcon").classList.contains("bi-slash-square"))
    {
      document.getElementById("grtIcon").classList.remove("bi-slash-square");
      document.getElementById("grtIcon").classList.add("bi-check-square");
      document.getElementById("grtContainer").classList.remove("bg-secondary");
      document.getElementById("grtContainer").classList.add("bg-success");
      document.getElementById("instructions").innerHTML='<div class="spinner-border text-warning" role="status"><span class="visually-hidden">Loading...</span></div>';
      var device = (await ExchangeTokenUrlCode()).json;
      if(null != device.url && device.url != 'undefined')
      {
        document.getElementById("instructions").innerHTML=`Sign in <a id="tokenLink" target="_blank" href="${device.url}" class="a-general-dark">HERE</a> as your Global Admin using code <span id="deviceCode" class="alt-text-dark" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-toggle="tooltip" data-bs-trigger="hover click" title="Copied to clipboard!" onmouseover="navigator.clipboard.writeText(this.innerText)" onclick="navigator.clipboard.writeText(this.innerText)">${device.code}</span></h5>`;
        PrimeToolTips();
        expiresCount= device.expires-30;
        setInterval(ExpireCount, 1000);
      }
    }
  }

  if (tokenStatus.exchangeRefreshToken) {
    document.getElementById("ertIcon").classList.remove("bi-slash-square");
    document.getElementById("ertIcon").classList.add("bi-check-square");
    document.getElementById("ertContainer").classList.remove("bg-secondary");
    document.getElementById("ertContainer").classList.add("bg-success");
    document.getElementById("ertIcon").classList.remove("bi-x-square");
    document.getElementById("ertContainer").classList.remove("bg-danger");
  }

  if(tokenStatus.refreshToken && tokenStatus.exchangeRefreshToken)
  {
    document.getElementById("instructions").innerText="Completed";
    document.getElementById("instructions").classList.add("text-success");
    window.location="/";
  }
}

async function ExpireCount()
{
  expiresCount=expiresCount-1;
  console.warn(`Device Code expires in: ${expiresCount}`);

  if (expiresCount<=120)
  {
    document.getElementById("expireCard").classList.remove("d-none");
    if(expiresCount>0)
    {
      document.getElementById("expireCount").innerText=expiresCount;
    }
    else
    {
      document.getElementById("expireCount").innerText="Expired";
      document.getElementById("expireCount").classList.remove("ms-2");
      document.getElementById("expireHeading").innerHTML=document.getElementById("expireCount").outerHTML;
      document.getElementById("instructionsCard").classList.add("d-none");
      document.getElementById("ertIcon").classList.remove("bi-slash-square");
      document.getElementById("ertIcon").classList.add("bi-x-square");
      document.getElementById("ertContainer").classList.remove("bg-secondary");
      document.getElementById("ertContainer").classList.add("bg-danger");
    }
  }
}

async function CreateDataTable(headers,jsonValues, id, parentElementId, heading, altHeading="", subheading="", replace = true, actionButtonHtml="")
{
  var tableTemplate = document.createElement('template');
  var tableTemplateLoading = document.createElement('template');
  var tableHtml=`<div id='${id}-parent' class='card text-bg-dark modal-bg-dark ps-3 pe-3 pt-2 pb-2 mb-3'><div class='d-flex ps-2 pe-0 card-header'><span class='col'>${heading}${altHeading}</span>${actionButtonHtml}</div><div id='${id}-addTable' class='card-body p-2'><h5 class='card-title'>${subheading}</h5></div><table id='${id}'><thead><tr>`;
  tableTemplateLoading.innerHTML=tableHtml.concat("<div class='d-flex row justify-content-center'><div class='spinner-border mb-4 highlight-alt-dark-fg' style='width: 3rem; height: 3rem;' role='status'><span class='visually-hidden'>Loading...</span></div></div></div>");

  async function InjectHtml(template, primeToolTips=false, loading=true)
  {
    if(replace)
    {
      document.getElementById(parentElementId).innerHTML=template.content.firstChild.outerHTML;
    }
    else if(loading)
    {
      document.getElementById(parentElementId).appendChild(template.content.firstChild);
    }
    else
    {
      document.getElementById(`${id}-parent`).outerHTML=template.content.firstChild.outerHTML;
    }

    if(primeToolTips)
    {
      await PrimeToolTips();
    }
  }

  async function FillTable()
  {
    var worker_fn = function (e) {
      jsonValues = e.data.j;
      tableHtml = e.data.t;
      headers = e.data.h;
      tableHtml = tableHtml.concat(headers.map(header => `<th>${header}</th>`).join(''),'</tr></thead><tbody>');
    for(var i=0; i<10000; i++)
    {
      console.info(i);
    jsonValues.forEach(obj => {
      tableHtml=tableHtml.concat('<tr>');
      Object.entries(obj).forEach(([key,value]) => {
        tableHtml=tableHtml.concat(`<td class='font-size-14' data-key='${key}' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-toggle='tooltip' data-bs-trigger='hover'>${value}</td>`);
      });
      tableHtml=tableHtml.concat('</tr>');
    });
    jsonValues.forEach(obj => {
      tableHtml=tableHtml.concat('<tr>');
      Object.entries(obj).forEach(([key,value]) => {
        tableHtml=tableHtml.concat(`<td class='font-size-14' data-key='${key}' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-toggle='tooltip' data-bs-trigger='hover'>${value}</td>`);
      });
      tableHtml=tableHtml.concat('</tr>');
    });
    jsonValues.forEach(obj => {
      tableHtml=tableHtml.concat('<tr>');
      Object.entries(obj).forEach(([key,value]) => {
        tableHtml=tableHtml.concat(`<td class='font-size-14' data-key='${key}' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-toggle='tooltip' data-bs-trigger='hover'>${value}</td>`);
      });
      tableHtml=tableHtml.concat('</tr>');
    });
    jsonValues.forEach(obj => {
      tableHtml=tableHtml.concat('<tr>');
      Object.entries(obj).forEach(([key,value]) => {
        tableHtml=tableHtml.concat(`<td class='font-size-14' data-key='${key}' data-bs-toggle='tooltip' data-bs-placement='bottom' data-bs-toggle='tooltip' data-bs-trigger='hover'>${value}</td>`);
      });
      tableHtml=tableHtml.concat('</tr>');
    });
    }
    postMessage(JSON.parse(`{"result":${JSON.stringify(tableHtml)}}`));
    console.warn("Web Worker Finished");
    }

    var blob = new Blob(["onmessage ="+worker_fn.toString()], { type: "text/javascript" });

    var worker = new Worker(window.URL.createObjectURL(blob));

    worker.onmessage = async function(e) 
    {
      tableHtml=e.data.result;
      tableHtml=tableHtml.concat('</tbody></table></div>');
      tableTemplate.innerHTML=tableHtml;

      /*await InjectHtml(tableTemplate,true, false);
      let myTable = new JSTable(document.getElementById(id), {
        sortable: true,
        searchable: true,
        perPage: ProfileTableSize()
      });*/
    };
    worker.postMessage({t: tableHtml,
    j: jsonValues,
    h: headers});
  }

  await InjectHtml(tableTemplateLoading);
  await FillTable();
}

async function TenantRefresh()
{
  document.getElementById('tenantData').innerHTML='';
  const tenantJson = (await GetTenants(true)).json;
  var dropItems="";
  for (var i = 0; i < tenantJson.length; i++){
    dropItems+=`<li><a id='allTenants' style='border-top: none' class="onclick-highlight panel-section-dark dropdown-item" data-tenant="${tenantJson[i].defaultDomainName}" data-customerid="${tenantJson[i].customerId}" onclick="SelectOption('tenantFilter',this.innerText,this.dataset.tenant, this.dataset.customerid, true)">${tenantJson[i].displayName}</a></li>`; 
  }
  document.getElementById('tenantData').innerHTML=dropItems;
}

async function IsAllTenants()
{
  while(!document.getElementById('allTenants'))
  {
    await new Promise(r => setTimeout(r, 100));
  }
  return document.getElementById('tenantFilter').dataset.customerid == 'AllTenants';
}

async function SelectedTenantDisplayName()
{
  while(!document.getElementById('allTenants'))
  {
    await new Promise(r => setTimeout(r, 100));
  }
  return document.getElementById('tenantFilter').innerText;
}

async function SelectedTenantDefaultDomain()
{
  while(!document.getElementById('allTenants'))
  {
    await new Promise(r => setTimeout(r, 100));
  }
  return document.getElementById('tenantFilter').dataset.tenant;
}

async function SelectedTenantCustomerId()
{
  while(!document.getElementById('allTenants'))
  {
    await new Promise(r => setTimeout(r, 100));
  }
  return document.getElementById('tenantFilter').dataset.customerid;
}

function ProfileTableSize()
{
  return parseInt(document.getElementById("profileDropdown").dataset.tablesize.replace('table',''));
}

async function ProfileRefresh()
{
  document.getElementById('profileDropdownButton').disabled=true;
  const profile = await AuthMe();
  if(profile.status == 403)
  {
    console.error("### USER IS FORBIDDEN (403), PLEASE ENSURE CORRECT ROLE ASSIGNED TO USER IN APP ON AZURE AD ###");
    LoadUrl('/403/');
  }
  SelectOption('tenantFilter', profile.json.clientPrincipal.lastTenantName,profile.json.clientPrincipal.lastTenantDomainName,profile.json.clientPrincipal.lastTenantCustomerId);
  document.getElementById(`table${profile.json.clientPrincipal.defaultPageSize.toString()}`).classList.add('toggle-button-active');
  document.getElementById('profileDropdownButton').disabled=false;
  if (profile.json.clientPrincipal.photoData != '')
  {
    document.getElementById("profileDropdownButton").style=`background-size:100%;background-image:url(data:image/jpg;base64,${profile.json.clientPrincipal.photoData})`;
  }
  else
  {
    try
    {
      document.getElementById("profileDropdownButton").style.backgroundImage=`url(${GenerateAvatar(profile.json.clientPrincipal.name.split(' ')[0].charAt(0)+profile.json.clientPrincipal.name.split(' ')[1].charAt(0),'#000000','#ffc107')})`;
    }
    catch
    {
      document.getElementById("profileDropdownButton").style.backgroundImage=`url(${GenerateAvatar(profile.json.clientPrincipal.name.charAt(0),'#000000','#ffc107')})`;
    }
    document.getElementById("profileDropdownButton").style.backgroundSize='100%';
  }
  document.getElementById("profileName").innerText=profile.json.clientPrincipal.name;
  document.getElementById("profileEmail").innerText=profile.json.clientPrincipal.userDetails;
  document.getElementById("profileRole").innerText=profile.json.clientPrincipal.userRoles[0].charAt(0).toUpperCase()+profile.json.clientPrincipal.userRoles[0].slice(1);
  document.getElementById("profileDropdown").dataset.tablesize='table'+profile.json.clientPrincipal.defaultPageSize.toString();
  document.getElementById("profileDropdown").dataset.userid=profile.json.clientPrincipal.userId;
  document.getElementById("profileDropdown").dataset.defaultUsage=profile.json.clientPrincipal.defaultUsageLocation;
}

function GenerateAvatar(text, foregroundColor, backgroundColor) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = 200;
  canvas.height = 200;

  // Draw background
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text
  context.font = "bold 100px Arial";
  context.fillStyle = foregroundColor;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 1.9);

  return canvas.toDataURL("image/png");
}

function ProfileButtonClick(e, value)
{
  [].slice.call(document.getElementById('pageSizeGroup').children).forEach(element => element.classList.remove('toggle-button-active'));
  document.getElementById("profileDropdown").dataset.tablesize=`table${value}`;
  document.getElementById(`table${value}`).classList.add('toggle-button-active');
  EditUserProfile();
  //e.stopPropagation();
}

function EditUserProfile()
{
  try
  {
    EditProfile(document.getElementById("profileDropdown").dataset.userid,document.getElementById('tenantFilter').innerText,document.getElementById('tenantFilter').dataset.tenant,document.getElementById('tenantFilter').dataset.customerid, ProfileTableSize(),document.getElementById('tenantFilter').dataset.defaultUsage);
  }
  catch(error)
  {
    console.error(`EditUserProfile error: ${error}`);
  }
}

function ProfileDropdownButtonClick()
{
  document.getElementById(document.getElementById("profileDropdown").dataset.tablesize).focus();
}

function DropdownButtonClick(dropdownId,searchInputId) {
    document.getElementById(searchInputId).value='';
    DropdownFilterFunction(dropdownId, searchInputId);
}

function SelectOption(dropdownButtonId, option='', defaultDomain='', custid='', updateProfile=false)
{
    document.getElementById(dropdownButtonId).innerText=option.replace('*All','All').replace('* All','All');
    document.getElementById(dropdownButtonId).dataset.tenant=defaultDomain;
    document.getElementById(dropdownButtonId).dataset.customerid=custid;

    if(updateProfile)
    {
      EditUserProfile();
    }

    CallToAction(window.location.href);
}
  
function DropdownFilterFunction(dropdownId, searchInputId) {
    var input, filter, ul, li, a, i;
    input = document.getElementById(searchInputId);
    filter = input.value.toUpperCase();
    div = document.getElementById(dropdownId);
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      txtValue = a[i].textContent || a[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
      } else {
        a[i].style.display = "none";
      }
    }
}

async function SidebarCollapse() {
  if(document.getElementById("sidebar").style.width != "250px")
  {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  }
  else
  {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
  }
}

async function Heartbeat()
{
  var heartbeat = (await GetHeartbeat()).json;
  console.info(`API Heartbeat: ${JSON.stringify(heartbeat)}`);

}

async function LoadUrl(url, title='FFPP')
{
  const nextTitle = title;
  const nextState = { additionalInformation: 'Updated the URL with JS' };
  window.history.pushState(nextState, nextTitle, url);
  CallToAction(url);
}

async function CallToAction(currentUrl)
{
  console.info(`CallToAction - ${currentUrl}`);

  switch(currentUrl.toLowerCase()) {
    case `/setup/`:
      console.info("Setup");
      window.location.replace(currentUrl);
      break;
    case `/403/`:
      window.location.assign(currentUrl);
      break;
    case `${config.ui.frontEndUrl}/staging/`:
        console.info("Staging");
        document.getElementById('injectableMain').innerHTML='';
        if(! await IsAllTenants())
        {
          var tenants = (await GetTenants(false)).json;
          var tenantId = await SelectedTenantCustomerId();
          var tenantDisplayname = await SelectedTenantDisplayName();
          var tenantDomain = await SelectedTenantDefaultDomain();
          CreateDataTable(['Display Name','Email','User Type','Enabled','AD Synced','Licenses'],tenants,tenantId,'injectableMain',tenantDisplayname,`<span style='margin-left: 0px' class='row dt-alt-heading'>${tenantDomain}</span>`,"<span class='highlight-dark-fg'>Users</span>",false,"<button style='max-width:120px' class='col defy-justify-right btn btn-secondary general-button shadow-none'><i class='bi bi-plus-circle highlight-dark-fg'></i>&nbsp;&nbsp;Add User</button>");
          CreateDataTable(['Display Name','Email','User Type','Enabled','AD Synced','Licenses'],tenants,tenantId+'2','injectableMain',tenantDisplayname,`<span style='margin-left: 0px' class='row dt-alt-heading'>${tenantDomain}</span>`,"<span class='highlight-dark-fg'>Users</span>",false,"<button style='max-width:120px' class='col defy-justify-right btn btn-secondary general-button shadow-none'><i class='bi bi-plus-circle highlight-dark-fg'></i>&nbsp;&nbsp;Add User</button>");
        }
        else
        {
  
        }
        break;
    default:
  }
}
