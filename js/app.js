var expiresCount = 830;

window.addEventListener('popstate', function (event) {
  console.warn("Window Popstate Event");
	CallToAction(window.location.href);
});

async function Refresh()
{
  var tokenStatus = (await TokenStatus()).json;

  if(!tokenStatus.refreshToken)
  {
    console.warn("Token not setup, redirecting to complete bootstrap process..");
    LoadUrl('/setup/');
  }
  else
  {
    if(null==tokenGlobal)
    {
      await SignIn();
    }

    const [] = await Promise.allSettled([
      ProfileRefresh(), 
    ]);

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

  if(tokenStatus.refreshToken)
  {
    document.getElementById("instructions").innerText="Completed";
    document.getElementById("instructions").classList.add("text-success");
    window.location="/";
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

async function ProfileRefresh()
{
  document.getElementById('profileDropdownButton').disabled=true;
  const profile = await AuthMe();
  if(profile.status == 403)
  {
    console.error("### USER IS FORBIDDEN (403), PLEASE ENSURE CORRECT ROLE ASSIGNED TO USER IN APP ON AZURE AD ###");
    LoadUrl('/403/');
  }
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
  document.getElementById("profileDropdown").dataset.userid=profile.json.clientPrincipal.userId;
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
  EditUserProfile();
  //e.stopPropagation();
}

function EditUserProfile()
{
  try
  {
    EditProfile(document.getElementById("profileDropdown").dataset.userid);
  }
  catch(error)
  {
    console.error(`EditUserProfile error: ${error}`);
  }
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
        break;
    default:
  }
}
