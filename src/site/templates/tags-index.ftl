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

<div id="page type-page status-publish entry">
  <article>
    <header class='post-header'>
      <h1 class='post-title'>Tags</h1>
    </header>

    <div class="post-content">
      <ul class="posts">
        <#list tags?sort_by("name") as tag>
          <h2><a href="${content.rootpath}${tag.uri}">${tag.name}</a> ${tag.tagged_posts?size}</h2>
        </#list>
      </ul>
    </div>
  </article>

</div>

<#include "footer.ftl">
