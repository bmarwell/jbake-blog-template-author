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

<div class="page type-page status-publish entry">

  <article>
    <div class='post-header'>
      <h1 class='post-title'>${content.title}</h1>
      <@postmeta.postmeta content />
    </div>

    <div class="post-content">
      ${content.body}
    </div>

    <div class="shariff"
      <#if ((content.shariff)?? && content.shariff == "true") && (config.shariff_services)??><#list (config.shariff_services)><@compress single_line=true>
        data-services="[
     <#items as service>
     &quot;${service}&quot;,
     </#items>
     ]"
      </@compress>
      </#list></#if>
      <#if (config.shariff_backend_url)??> data-backend-url="${config.shariff_backend_url}"</#if>
      <#if (content.lang)??>data-lang="${(content.lang)[0..*2]}"</#if>
    ></div>

    <div class="post-tags">
      <#if (content.tags)??><#list (content.tags)>
        <ul>
          <#items as content_tag>
            <li>
              <a href="<#if (content.rootpath)??>${content.rootpath}</#if>tags/${content_tag?url_path}.html">${content_tag}</a>
            </li>
          </#items>
        </ul>
      </#list></#if>
    </div>
  </article>

</div>

<@jsonld.jsonld content "Article" />

<#include "footer.ftl">
