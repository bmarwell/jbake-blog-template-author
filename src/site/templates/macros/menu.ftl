<#--
  ~ Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
  ~ file except in compliance with the License. You may obtain a copy of the License at
  ~
  ~ http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software distributed under
  ~ the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  ~ KIND, either express or implied. See the License for the specific language governing
  ~ permissions and limitations under the License.
  -->
<#macro renderMenuItem menuItem={} currentUri="" isSubMenu=false >
  <#assign currentItemClass="">
  <#if (menuItem.link)?? && ("/" + currentUri == (menuItem.link!"")) >
    <#assign currentItemClass=" current-menu-item current_page_item">
  </#if>
  <#if (menuItem.link)?? && ((menuItem.link == "") || (menuItem.link == "/")) >
    <#assign currentItemClass= currentItemClass + "menu-item-home">
  </#if>
  <#-- check if this is the current page's ancestor -->
  <#if ((menuItem.items![])?size &gt; 0)><#list (menuItem.items) as childMenuItem>
    <#if "/" + currentUri == (childMenuItem.link!"")>
      <#assign currentItemClass = currentItemClass + " current-menu-ancestor" />
    </#if>
  </#list></#if>
  <li class="menu-item <#if (menuItem.items![])?size &gt; 0>menu-item-has-children</#if> ${currentItemClass}" >
  <a <#if (menuItem.link)??>href="${menuItem.link}"</#if>>${menuItem.name}</a>
  <#if (menuItem.items![])?size &gt; 0>
    <button class="toggle-dropdown" aria-expanded="false">
      <span class="screen-reader-text">open submenu</span>
    </button>
    <ul class="sub-menu">
      <#list (menuItem.items) as childMenuItem>
        <@renderMenuItem childMenuItem currentUri true />
      </#list>
    </ul>
  </#if>
  </li>
</#macro>

<#macro renderLanguages post>
  <#assign flags=data.get('lang.yaml').flags />
  <#if (post.alternate)?? && (post.alternate)?isHash><#list (post.alternate)>
  <section id="language-selector" class="widget widget_polylang">
    <h3 class="widget-title">Read in:</h3>
    <ul>
        <#items as lang, alternateUri>
          <#assign langLocal=lang?replace("_", "-")>
          <#assign langGlobal=lang?keepBeforeLast("-")?keepBeforeLast("_")>
          <#if (flags[langLocal])??>
            <#assign flag=flags[langLocal]>
          <#elseIf (flags[langGlobal])??>
            <#assign flag=flags[langGlobal]>
          <#else>
            <#assign flag=flags.default>
          </#if>
          <@readIn lang alternateUri flag />
        </#items>
    </ul>
  </section>
  </#list></#if>
</#macro>

<#macro readIn lang alternateUri flag>
  <li class="lang-item lang-item-${lang?replace("_", "-")} lang-item-first">
    <a lang="${lang?replace("_", "-")}"
       hreflang="${lang?replace("_", "-")}"
       href="${alternateUri}">
      <img src="${flag.img}"
           <#if (flag.alt)??>alt="${flag.alt}"</#if>
           width="16"
           height="11"
           style="width: 16px; height: 11px;"/>
      <#if (flag.alt)??><span style="margin-left:0.3em;">${flag.alt}</span></#if>
    </a>
  </li>
</#macro>

<#macro sitesearch>
  <section id="search-5" class="widget widget_search">
    <h3 class="widget-title">Site Search</h3>
    <div class='search-form-container'>
      <form role="search" method="get" class="search-form" action="https://duckduckgo.com/">
        <label class="screen-reader-text" for="search-field">Site Search</label>
        <input type="hidden" name="sites" value="${config.site_host?replace("https://", "")}"/>
        <input id="search-field" class="search-field" type="search" name="q" maxlength="300" placeholder="Search"/>
        <input type="submit" value="Search" class="search-submit" />
      </form>
    </div>
  </section>
</#macro>

<#macro license>
  <#assign license = data.get('license.yaml').license />
  <#if !(license)??>
    <#return>
  </#if>
  <section id="license" class="license widget">
    <h3 class="widget-title">License</h3>
    <div class="textwidget">
      <#if (license.image)??>
        <#if (license.link)??>
          <a
            href="${license.link.href}"
          <#if (license.link.rel)??>rel="${license.link.rel}"</#if>
          >
        </#if>
        <img style="border-width:0"
             src="${license.image.src}"
             <#if (license.image.alt)??>alt="${license.image.alt}"</#if>
             <#if (license.image.height)??>height="${license.image.height}"</#if>
             <#if (license.image.width)??>width="${license.image.width}"</#if>
        />
        <#if (license.link)??>
          </a>
        </#if>
      </#if>
      <#if (license.text)??>
      <br>${license.text}
      </#if>
    </div>
  </section>
</#macro>
