<#macro appbox appstore appId appName developerName developerUrl stars image price="Free" hasInAppPurchaes=false>
  <#switch appstore?strim>
    <#case "googleplay">
      <#assign qrCodeSrc = "https://chart.googleapis.com/chart?cht=qr&amp;chl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3D${appId}&amp;chs=200x200&amp;chld=L%7C0">
      <#assign storeAppUrl = "https://play.google.com/store/apps/details?id=${appId}">
      <#break>
    <#case "androidpit">
      <#break>
    <#default>
      <#stop>
  </#switch>
  <div class="simple colorful ${appstore?trim} wpappbox">
    <span class="fallback">App "${appId}" aus ${appstore}.</span>
    <#assign qrCodeId = "appbox-qrcode-${appstore}-${appId?replace(".", "")}">
    <div class="qrcode" id="${qrCodeId}">
      <img src="${qrCodeSrc}">
    </div>
    <div class="appicon">
      <a href="${storeAppUrl}" rel="nofollow">
        <img src="${image}" alt="${appName}">
      </a>
    </div>
    <div class="applinks">
      <div class="appbuttons">
        <a href="${storeAppUrl}" rel="nofollow">Download</a>
        <span onmouseover="document.getElementById('${qrCodeId}').style.display='block'"
              onmouseout="document.getElementById('${qrCodeId}').style.display='none'">QR-Code</span>
      </div>
    </div>
    <div class="appdetails">
      <div class="apptitle">
        <a href alt="${appName}">${appName}</a>
      </div>
      <div class="developer">
        <span class="label">Developer: </span><span class="value"><a rel="nofollow" href="${developerUrl}">${developerName}</a></span>
      </div>
      <div class="price">
        <span class="label">Price: </span><span class="value">${price}<#if (hasInAppPurchaes)><sup title="Has in-App purchaes">+</sup></#if></span>
        <div class="rating"><div title="${stars} of 5 stars" class="stars${stars?replace(".", "")} stars-colorful rating-stars"></div></div>
      </div>
    </div>
  </div>
</#macro>
