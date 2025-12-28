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
<#import "macros/lang.ftl" as lang />

<div class="post type-post status-publish format-standard <#if (content.featuredimage)?? >has-post-thumbnail </#if> entry">
  <@postmeta.featuredimage content false />

  <article itemscope itemtype="https://schema.org/BlogPosting">
    <header class='post-header'>
      <h1 class='post-title' itemprop="headline">${content.title}<@lang.langIcon content false/></h1>
      <div itemprop="author" itemscope itemtype="https://schema.org/Person">
        <meta itemprop="name" content="${content.author!'Benjamin Marwell'}" />
      </div>
      <meta itemprop="datePublished" content="${content.date?datetime?string.iso_s_u}" />
      <#if (content.updated)??><meta itemprop="dateModified" content="${content.updated?string}" /></#if>
      <@postmeta.postmeta content />
    </header>
    <div class="post-content" itemprop="articleBody">
        ${content.body}
    </div>

    <div class="social-media-icons shariff"
       <#if (config.shariff_services)??><#list (config.shariff_services)><@compress single_line=true>
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

    <#if config.site_giscus_enabled?boolean!false >
    <div id="giscus-comments-container" class="giscus-comments-container"></div>
    <script type="text/plain" data-category="github_comments" data-service="giscus" async>
    var giscusConfig = {
      repo: "${config.site_giscus_repo}",
      "repo-id": "${config.site_giscus_repo_id}",
      category: "${config.site_giscus_category}",
      "category-id": "${config.site_giscus_category_id}",
      mapping: "${config.site_giscus_mapping}",
      strict: "0",
      "reactions-enabled": "true",
      "emit-metadata": "0",
      "input-position": "top",
      theme: "${config.site_giscus_theme}",
      lang: "en",
      loading: "lazy"
    }
    const container = document.getElementById('giscus-comments-container');
    if (container && !container.querySelector('.giscus')) {
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';

      for (const attr in giscusConfig) {
        script.setAttribute(`data-${r"${attr}"}`, giscusConfig[attr]);
      }

      script.setAttribute("crossorigin", "anonymous");
      script.toggleAttribute("async", true)

      container.appendChild(script);
    }
    </script>
    </#if>

    <#-- TODO: Add categories -->
    <#--
    <div class="post-categories"><span>Published in</span><a
              href="https://blog.bmarwell.de/information-technology/software-vorgestellt/"
              title="View all posts in software showcase">software showcase</a></div>
    -->
    <div class="post-tags hide-for-print">
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

  <nav class="further-reading hide-for-print">
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

<@jsonld.jsonld content "BlogPosting" />

<#include "footer.ftl">
