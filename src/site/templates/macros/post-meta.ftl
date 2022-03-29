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
<#setting locale="en_GB" />

<#function ordinalsuffix post>
<#switch post.date?string("d")>
    <#case "1">
        <#return "st">
        <#break>
    <#case "2">
        <#return "nd">
        <#break>
    <#case "3">
        <#return "rd">
        <#break>
    <#default>
        <#return "th">
</#switch>
</#function>

<#macro featuredimage post link=true>
  <#if (post.featuredimage)?? >
    <div class="featured-image">
      <#if (link)>
      <a href="${content.rootpath!""}${post.uri}" tabindex="-1">${post.title}
      </#if>
        <img
          <#if (post.featuredimagewidth)?? >width="${post.featuredimagewidth}"</#if>
          <#if (post.featuredimageheight)?? >height="${post.featuredimageheight}"</#if>
          <#if (post.featuredimage)?starts_with("/")>
            <#-- absolute URI. -->
            src="${post.featuredimage}"
          <#elseif !(post.featuredimage)?contains("/")>
            <#-- relative URL. Figure out the directory this blog post is in. -->
            src="${content.rootpath!""}${post.uri?keep_before_last("/")}/${post.featuredimage}"
          <#else>
            src="${content.rootpath!""}${post.featuredimage}"
          </#if>
          class="attachment-full size-full wp-post-image"
          <#if (post.featuredimagealt)?? >alt="${post.featuredimagealt}"<#else>alt="Featured image of ${post.title}"</#if>
        />
      <#if (link)></a></#if>
    </div>
  </#if>
</#macro>

<#macro postmeta post>
  <#assign authors=data.get('authors.yaml').authors />

  <#if (post.lang)?? && (post.lang)?starts_with("de")>
    Veröffentlicht <#if (post.author)??>von <a href="https://twitter.com/${authors[post.author].twitter}">${post.author}</a> </#if>
    am <time datetime="${post.date?datetime?string.iso_s_u}">${(post.date)?date?iso_utc}</time>
  <#else>
    Published <#if (post.author)??>by <a href="https://twitter.com/${authors[post.author].twitter}">${post.author}</a> </#if>
    on <time datetime="${post.date?datetime?string.iso_s_u}">${post.date?string("dd")}${ordinalsuffix(post)} of ${post.date?string("MMMM, yyyy")}</time>
  </#if>
</#macro>
