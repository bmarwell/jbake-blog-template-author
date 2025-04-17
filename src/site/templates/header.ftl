<#ftl output_format="HTML" strip_whitespace="true"><!DOCTYPE html>
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
<#import "macros/post-meta.ftl" as postmeta>
<#import "macros/jsonld.ftl" as jsonld>
<#if (content.lang)??>
<html lang="${content.lang}">
<#else>
<html>
</#if>
  <head>
    <meta charset="utf-8"/>
    <meta name='robots' content='index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'/>

    <#if (content.lang)?? && (content.uri)??>
      <link rel="alternate" href="${config.site_host}/${content.uri}" hreflang="${content.lang}"/>
    </#if>
    <#if (content.alternate)??><#list content.alternate as langKey, langUri>
      <#if (langUri?starts_with("/"))>
    <link rel="alternate" href="${config.site_host}/${langUri}" hreflang="${langKey}"/>
      <#else>
    <link rel="alternate" href="${config.site_host}/${content.uri?keep_before_last("/")}/${langUri}" hreflang="${langKey}"/>
      </#if>
    </#list></#if>
    <#if (content.uri)??>
      <link rel="canonical" href="${config.site_host}/${content.uri}"/>
    </#if>

    <#if (content.title)?? && (content.title)?contains("|")>
    <#-- The page has a full custom title, render it directly: -->
      <#assign ftltitle="${content.title}" />
    <#elseif (content.title)??>
    <#-- standard title, append the project name appended for SEO: -->
      <#assign ftltitle="${content.title} | ${config.site_title}" />
    <#else>
    <#-- No title found in the page metadata, set the default: -->
      <#assign ftltitle="${config.site_title} &ndash; ${config.site_tagline}" />
    </#if>
    <title>${ftltitle?replace('<[^>]+>','','r')}</title>
    <meta property="og:site_name" content="${config.site_title}"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="template" content="Custom, based on Author 1.44"/>
    <#if (content.description)??>
    <meta name="description" content="${content.description}">
    <meta property="og:description" content="${content.description}">
    <#else>
    <#-- leave out og:description, so it will fill from the body. -->
    </#if>
    <#if (content.author)??>
    <meta name="author" content="${content.author}">
    </#if>
    <#if (content.tags)??>
    <meta name="keywords" content='${(content.tags)?join(",")}'>
    </#if>
    <meta name="generator" content="JBake">

    <meta property="og:title" content="${ftltitle?replace('<[^>]+>','','r')?esc}"/>
    <#switch (content.type)!"">
      <#case "post">
        <#if (content.date)??>
    <meta property="article:published_time" content="${content.date?datetime?string.iso_s_u}"/>
    <meta name="publish_date" property="og:publish_date" content="${content.date?datetime?string.iso_s_u}"/>
        </#if>
        <#if (content.author!"") != "">
          <#assign authors = data.get('authors.yaml').authors>
          <#if (authors[content.author?trim].twitter)??>
    <meta name="twitter:creator" content="${authors[content.author].twitter}" />
          </#if>
          <#if (authors[content.author?trim].facebook)??>
    <meta property="article:author" content="${authors[content.author].facebook}" />
          </#if>
          <#if (authors[content.author?trim].first_name)??>
    <meta property="profile:first_name" content="${authors[content.author].first_name}" />
          </#if>
          <#if (authors[content.author?trim].last_name)??>
    <meta property="profile:last_name" content="${authors[content.author].last_name}" />
          </#if>
        </#if>
      <#-- fall through -->
      <#case "page">
    <meta property="og:type" content="article"/>
    <#if (content.twittercard!"")?trim == "large">
    <meta name="twitter:card" content="summary_large_image" />
    <#else>
      <meta name="twitter:card" content="summary" />
    </#if>
    <#if (config.site_twitter)??><meta name="twitter:site" content="${config.site_twitter}" /></#if>
        <#if (content.date)??>
    <meta property="article:modification_time" content="${content.date?datetime?string.iso_s_u}"/>
        </#if>
        <#if (content.published_date)??>
    <meta property="article:published_time" content="${content.published_date?datetime?string.iso_s_u}"/>
    <meta name="publish_date" property="og:publish_date" content="${content.published_date?datetime?string.iso_s_u}"/>
        </#if>
        <#break>
      <#default>
    <meta property="og:type" content="website"/>
    </#switch>
    <#if (content.tags)??>
      <#list (content.tags) as tag>
    <meta property="article:tag" content='${tag}'/>
      </#list>
    </#if>
    <meta property="og:locale" content="en_US" />
    <#if (content.uri)??>
    <meta property="og:url" content='${config.site_host}/${content.uri}'/>
    <#else></#if>
    <#-- custom featured image if it exists or default featured image. -->
    <#if (content.featuredimage)?? >
      <#if (content.featuredimage)?starts_with("http")>
    <meta property="og:image" content="${content.featuredimage}"/>
    <meta property="twitter:image" content="${content.featuredimage}"/>
      <#elseif (content.featuredimage)?starts_with("/")>
        <#-- absolute path is not sufficient -- featured images must be an absolute URL. -->
    <meta property="og:image" content="${config.site_host}${content.featuredimage}"/>
    <meta property="twitter:image" content="${config.site_host}${content.featuredimage}"/>
      <#elseif (content.featuredimage)?contains("/")>
        <#assign imageprefix="${config.site_host}/${(content.uri?substring(0, content.uri?last_index_of('/')))}/" />
      <#else>
        <#-- relative URI starting with ./ or directly with the image name. -->
        <#assign imageprefix="${config.site_host}/${(content.uri?substring(0, content.uri?last_index_of('/')))}" />
    <meta property="og:image" content="${imageprefix}${content.featuredimage}"/>
    <meta property="twitter:image" content="${imageprefix}${content.featuredimage}"/>
      </#if>
      <#if (content.featuredimagewidth)??>
    <meta property="og:image:width" content="${content.featuredimagewidth}"/>
      </#if>
      <#if (content.featuredimageheight)??>
    <meta property="og:image:height" content="${content.featuredimageheight}"/>
      </#if>
    <#else>
      <#if (config.site_default_featured_image_file)??>
    <meta property="og:image" content='${content.rootpath!""}${config.site_default_featured_image_file}'/>
      </#if>
      <#if (config.site_default_featured_image_width)??>
        <meta property="og:image:width" content='${config.site_default_featured_image_width}'/>
      </#if>
      <#if (config.site_default_featured_image_height)??>
        <meta property="og:image:height" content='${config.site_default_featured_image_height}'/>
      </#if>
    </#if>

    <!-- Le styles -->
    <!-- Author theme adapted from wordpress' Author theme. -->
    <#assign cacheBuster = ((.now)?date?iso_utc)>
    <link rel="stylesheet" href="${content.rootpath!""}lib/@fontsource/lato/index.css?date=${cacheBuster}"/>
    <link rel="stylesheet" href="${content.rootpath!""}lib/@fontsource/lato/latin-ext.css?date=${cacheBuster}"/>
    <link rel="stylesheet" href="${content.rootpath!""}lib/@fontsource/rokkitt/index.css?date=${cacheBuster}"/>
    <link rel="stylesheet" href="${content.rootpath!""}lib/@fontsource/rokkitt/latin-ext.css?date=${cacheBuster}"/>

    <link rel="stylesheet" href="${content.rootpath!""}css/asciidoctor.min.css?date=${cacheBuster}" />
    <link rel="stylesheet" href="${content.rootpath!""}css/author.min.css?date=${cacheBuster}" id='parent-style-css' />
    <link rel="stylesheet" href="${content.rootpath!""}css/custom.min.css?date=${cacheBuster}" />

    <!-- Fav and touch icons -->
    <!--<link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">-->
    <link rel="shortcut icon" href="${content.rootpath!""}favicon.ico">

    <link rel="alternate" type="application/atom+xml" title="${config.site_title} &raquo; Feed" href="${config.site_host}/feed/"/>
  </head>
  <body class="<#if (content.type) == "post">single single-post single-format-standard singular singular-post</#if>">

  <a class="skip-content" href="#main">To main content</a>

  <div id="overflow-container" class="overflow-container">
    <div class="max-width">

    <!-- sidebar -->
    <#include "sidebar.ftl">

    <section id="main" class="main" role="main">
    <#-- TODO: add breadcrumbs -->
      <div id="loop-container" class="loop-container">
