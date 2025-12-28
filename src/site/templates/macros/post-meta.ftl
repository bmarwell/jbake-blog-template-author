<#ftl output_format="HTML" strip_whitespace="true">
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
    <#-- Determine the base image path and extension -->
    <#local imgPath="">
    <#if (post.featuredimage)?starts_with("/")>
      <#local imgPath = post.featuredimage>
    <#elseif !(post.featuredimage)?contains("/")>
      <#local imgPath = post.uri?keep_before_last("/") + "/" + post.featuredimage>
    <#else>
      <#local imgPath = post.featuredimage>
    </#if>

    <#local baseImgPath = imgPath?keep_before_last(".")>
    <#local imgExt = imgPath?keep_after_last(".")>
    <#local isLargeImage = (post.featuredimagewidth)?? && ((post.featuredimagewidth)?number >= 800)>

    <div class="featured-image">
      <#if (link)>
      <a href="${content.rootpath!""}${post.uri}" tabindex="-1">${post.title}
      </#if>
      <#-- Use picture tag with responsive sources for large images -->
      <#if isLargeImage>
        <picture>
          <#-- WebP sources with responsive sizes -->
          <#-- Only include size variants that are smaller than the original -->
          <source
            type="image/webp"
            srcset="${content.rootpath!""}${baseImgPath}-400w.webp 400w<#if (post.featuredimagewidth)?number gt 800>,
                    ${content.rootpath!""}${baseImgPath}-800w.webp 800w</#if><#if (post.featuredimagewidth)?number gt 1200>,
                    ${content.rootpath!""}${baseImgPath}-1200w.webp 1200w</#if>,
                    ${content.rootpath!""}${baseImgPath}.webp ${post.featuredimagewidth}w"
            sizes="(max-width: 549px) 100vw, (max-width: 949px) 50vw, 412px"
          />
          <#-- Original format sources with responsive sizes -->
          <source
            type="image/${(imgExt == 'jpg')?then('jpeg', imgExt)}"
            srcset="${content.rootpath!""}${baseImgPath}-400w.${imgExt} 400w<#if (post.featuredimagewidth)?number gt 800>,
                    ${content.rootpath!""}${baseImgPath}-800w.${imgExt} 800w</#if><#if (post.featuredimagewidth)?number gt 1200>,
                    ${content.rootpath!""}${baseImgPath}-1200w.${imgExt} 1200w</#if>,
                    ${content.rootpath!""}${imgPath} ${post.featuredimagewidth}w"
            sizes="(max-width: 549px) 100vw, (max-width: 949px) 50vw, 412px"
          />
          <#-- Fallback img for older browsers -->
          <img
            src="${content.rootpath!""}${baseImgPath}-800w.${imgExt}"
            <#if (post.featuredimagewidth)?? >width="${post.featuredimagewidth}"</#if>
            <#if (post.featuredimageheight)?? >height="${post.featuredimageheight}"</#if>
            class="attachment-full size-full wp-post-image"
            <#if (post.featuredimagealt)?? >alt="${post.featuredimagealt}"<#else>alt="Featured image of ${post.title?esc}"</#if>
            loading="lazy"
            decoding="async"
          />
        </picture>
      <#else>
        <#-- Small images: simple img tag with WebP fallback in picture -->
        <picture>
          <source type="image/webp" srcset="${content.rootpath!""}${imgPath?keep_before_last(".")}.webp">
          <img
            <#if (post.featuredimagewidth)?? >width="${post.featuredimagewidth}"</#if>
            <#if (post.featuredimageheight)?? >height="${post.featuredimageheight}"</#if>
            src="${content.rootpath!""}${imgPath}"
            class="attachment-full size-full wp-post-image"
            <#if (post.featuredimagealt)?? >alt="${post.featuredimagealt}"<#else>alt="Featured image of ${post.title?esc}"</#if>
            loading="lazy"
            decoding="async"
          />
        </picture>
      </#if>
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

<#-- set crawl visilibility for search engines -->
<#macro robotsmeta type>
    <#if type == "archive" || type == "tag" || type == "tags">
    <meta name='robots' content="noindex,follow" />
    <#else>
    <meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'/>
    </#if>
</#macro>
