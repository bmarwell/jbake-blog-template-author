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

<div class="post type-post status-publish format-standard <#if (content.featuredimage)?? >has-post-thumbnail </#if> entry">
  <@postmeta.featuredimage content false />

  <article>
    <div class='post-header'>
      <h1 class='post-title'>${content.title}</h1>
      <@postmeta.postmeta content />
    </div>
    <div class="post-content">
        ${content.body}
    </div>

    <#-- TODO: Add categories -->
    <#--
    <div class="post-categories"><span>Published in</span><a
              href="https://blog.bmarwell.de/information-technology/software-vorgestellt/"
              title="View all posts in Software vorgestellt">Software vorgestellt</a></div>
    -->
    <div class="post-tags">
    <#if (content.tags)??><#list (content.tags) as content_tag>
      <ul>
        <li>
          <a href="<#if (content.rootpath)??>${content.rootpath}</#if>tags/${content_tag}.html">${content_tag}</a>
        </li>
      </ul>
    </#list></#if>
    </div>
  </article>

  <nav class="further-reading">
    <#if (content.previousContent)??>
    <div class="previous">
      <span>Previous post</span>
      <a href="<#if (content.rootpath)??>${content.rootpath}</#if>${content.previousContent.uri}" rel="prev">${content.previousContent.title}</a>
    </div>
    </#if>
    <#if (content.nextContent)??>
    <div class="next">
      <span>Next Post</span>
      <a href="<#if (content.rootpath)??>${content.rootpath}</#if>${content.nextContent.uri}" rel="next">${content.nextContent.title}</a>
    </div>
    </#if>
  </nav>

</div>

<#include "footer.ftl">
