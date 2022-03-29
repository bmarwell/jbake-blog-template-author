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

<#include "header.ftl">
<#-- need to name this not tags, because hash.tags will return nothing in jbake/freemarker. -->
<#assign keywords = data.get('keywords.yaml').keywords />
<#assign tagcontent = { "name": "${tag?trim}" } />
<#import "macros/lang.ftl" as lang />

<div id="page type-page status-publish entry">
  <article>
    <header class="post-header">
      <h1 class='post-title'>Tag: ${tag}</h1>
    </header>

    <div class="post-content">
      <#if (keywords[tag?trim])?? && (keywords[tag?trim].description)??>
        <#assign tagcontent = tagcontent + { "description": "${keywords[tag?trim].description?trim}" } />
      </#if>
      <@lang.tagDescription keywords[tag?trim]!{} />
      <!--<ul>-->
      <#list tag_posts as post>
        <#if (last_month)??>
          <#if post.date?string("MMMM yyyy") != last_month>
          </ul>
          <h2>${post.date?string("MMMM yyyy")}</h2>
          <ul>
          </#if>
        <#else>
          <h4>${post.date?string("MMMM yyyy")}</h4>
          <ul>
        </#if>
        <li>${post.date?string("yyyy-MM-dd")} - <@lang.langIcon post /><a href="${content.rootpath}${post.uri?url_path}">${post.title}</a></li>
        <#assign last_month = post.date?string("MMMM yyyy")>
      </#list>
      </ul>
    </div>
  </article>
</div>

<@jsonld.jsonld tagcontent "DefinedTerm" />

<#include "footer.ftl">
