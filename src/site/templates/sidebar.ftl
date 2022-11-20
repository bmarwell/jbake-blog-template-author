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

<div id="main-sidebar" class="main-sidebar" lang="en">
  <header class="site-header" id="site-header">
    <div id="title-container" class="title-container">
      <#if (config.site_gravatar_hash)??>
      <div id="site-avatar"
           class="site-avatar"
           style="background-image: url('https://secure.gravatar.com/avatar/${config.site_gravatar_hash}?s=96&#038;d=retro&#038;r=pg')">
      </div>
      </#if>
      <div class="container">
        <#if (content.title)?? && (content.uri)?? && (content.uri != "index.html")>
          <h3 id='site-title' class='site-title'>
            <a href="${content.rootpath!""}">${config.site_title}</a>
          </h3>
        <#else>
          <h1 id='site-title' class='site-title'>
            <a href="${content.rootpath!""}">${config.site_title}</a>
          </h1>
        </#if>
        <p class="tagline">${config.site_tagline}</p>
      </div>
    </div>
    <button id="toggle-navigation" class="toggle-navigation" aria-expanded="false">
      <span class="screen-reader-text">open main menu</span>
    </button>

    <#-- main menu -->
    <#assign socialmedia = data.get('socialmedia.yaml').socialmedia>
    <#if (socialmedia)??><#list socialmedia>
    <div class='social-media-icons'>
      <ul>
      <#items as socialmediaitem>
        <li>
          <a class="${socialmediaitem.css!socialmediaitem.name}" target="_blank"
             rel="me"
             href="${socialmediaitem.link}" title="${socialmediaitem.title}">
            <img src="${content.rootpath!""}images/bootstrap/${socialmediaitem.icon!socialmediaitem.id}.svg#${socialmediaitem.icon!socialmediaitem.id}"
                 alt="${socialmediaitem.title}"
                 height="24"
                 width="24"
                 class="bi icon social-media-icon social-media-icon-${socialmediaitem.icon!socialmediaitem.id}"
            />
            </svg>
            <span class="screen-reader-text">${socialmediaitem.name}</span>
          </a>
        </li>
      </#items>
        </ul>
    </div>
    </#list></#if>

    <#-- menu -->
    <#assign primarymenu = data.get('menu.yaml').primary>
    <#if (primarymenu)??><#list primarymenu>
    <#import "macros/menu.ftl" as menu>
    <div id="menu-primary" class="menu-container menu-primary" role="navigation">
      <nav class="menu">
        <ul id="menu-primary-items" class="menu-primary-items">
        <#items as menuitem>
          <@menu.renderMenuItem menuitem content.uri />
        </#items>
        </ul>
      </nav>
    </div>
    </#list></#if>
  </header>

  <aside class="sidebar sidebar-primary" id="sidebar-primary">
    <h3 class="screen-reader-text">Sidebar</h3>

    <@menu.renderLanguages content />

    <@menu.sitesearch />

    <@menu.license />

  </aside>
</div>
