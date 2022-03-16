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

<h1 class="screen-reader-text">${config.site_title}</h1>

<div id="loop-container" class="loop-container">
<#list posts as post>
  <#if (post.status == "published"  && post?index >= (currentPageNumber-1) * config.index_posts_per_page?eval && post?index < currentPageNumber * config.index_posts_per_page?eval)>
    <div class="post type-post status-publish format-standard <#if (post.featuredimage)?? >has-post-thumbnail </#if>hentry entry"
      <#if (post.lang)??>lang="${post.lang}"</#if> >

      <@postmeta.featuredimage post />

      <article <#if (post.lang)??>lang="${post.lang}"</#if>>
        <div class='post-header'>
          <h2 class='post-title'>
            <a href="<#if (content.rootpath)??>${content.rootpath}<#else></#if>${post.uri}">${post.title}</a>
          </h2>
          <@postmeta.postmeta post />
        </div>
        <div class="post-content">
          <p <#if (post.lang)??>lang="${post.lang}"</#if>>
            ${post.body?keep_after("<p>")?keep_before("</p>")}
          </p>
          <div class="more-link-wrapper">
            <a
              class="more-link"
              href="<#if (content.rootpath)??>${content.rootpath}<#else></#if>${post.uri}">
              Continue reading 🠖
              <span class="screen-reader-text">${post.title}</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  </#if>
</#list>
</div>

<nav class="navigation pagination" role="navigation" aria-label="Posts">
  <h2 class="screen-reader-text">Post navigation</h2>
  <div class="nav-links">
      <#-- first page (don't show on page 1 or 2 b/c of self and previous). -->
      <#if (currentPageNumber > 2)>
        <a class="page-numbers" rel="first" href="<#if (content.rootpath)??>${content.rootpath}</#if>">1</a>
      </#if>
      <#-- second page -->
      <#if (currentPageNumber > 3)>
        <a class="page-numbers" href="<#if (content.rootpath)??>${content.rootpath}</#if>2">2</a>
      </#if>
      <#-- show ellipsis -->
      <#if (currentPageNumber > 3) && ((currentPageNumber - 1) > 2)>
      <span>...</span>
      </#if>
      <#-- previous -->
      <#if (currentPageNumber > 1)>
        <a class="page-numbers" rel="prev" href="<#if (content.rootpath)??>${content.rootpath}</#if>${(currentPageNumber==2)?then('', currentPageNumber-1)}">${currentPageNumber - 1}</a>
      </#if>
      <#-- self -->
        [<a class="page-numbers" rel="self" href="<#if (content.rootpath)??>${content.rootpath}</#if>${currentPageNumber}">${currentPageNumber}</a>]
      <#-- next -->
      <#if (currentPageNumber < numberOfPages)>
        <a class="page-numbers" rel="next" href="<#if (content.rootpath)??>${content.rootpath}</#if>${currentPageNumber + 1}">${currentPageNumber + 1}</a>
      </#if>
      <#-- show ellipsis -->
      <#if (currentPageNumber < numberOfPages - 3)>
        <span>...</span>
      </#if>
      <#-- before last -->
      <#if (currentPageNumber < (numberOfPages-2))>
        <a class="page-numbers" href="<#if (content.rootpath)??>${content.rootpath}</#if>${numberOfPages-1}">${numberOfPages-1}</a>
      </#if>
      <#-- last -->
      <#if (currentPageNumber < (numberOfPages-1))>
        <a class="page-numbers" rel="last" href="<#if (content.rootpath)??>${content.rootpath}</#if>${numberOfPages}">${numberOfPages}</a>
      </#if>
    <a class="page-numbers" href="${content.rootpath}${config.archive_file}">Archive</a>
  </div>
</nav>

<!-- before footer -->
<#include "footer.ftl">
