<?xml version="1.0" encoding="UTF-8"?>
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

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <#-- Homepage: highest priority, updated when new posts are published (~monthly) -->
    <url>
        <loc>${config.site_host}/</loc>
        <lastmod>${published_date?string("yyyy-MM-dd")}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>

    <#-- Archive page: just a list, lower priority than actual content -->
    <url>
        <loc>${config.site_host}/${config.archive_file}</loc>
        <lastmod>${published_date?string("yyyy-MM-dd")}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
    </url>

    <#-- Paginated index pages: updated monthly when new posts are published -->
    <#if (numberOfPages)?? && numberOfPages gt 1>
        <#list 2..numberOfPages as pageNum>
    <url>
        <loc>${config.site_host}/${pageNum}/</loc>
        <lastmod>${published_date?string("yyyy-MM-dd")}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
        </#list>
    </#if>

    <#-- All published content (posts and pages) -->
<#list published_content as content>
    <#-- Exclude robots.txt and feed files from sitemap -->
    <#if !content.uri?ends_with("robots.html") && !content.uri?ends_with("feed.xml")>
    <url>
        <loc>${config.site_host}/${content.uri}</loc>
        <lastmod>${content.date?string("yyyy-MM-dd")}</lastmod>
        <#-- Posts are the main content: high priority, rarely updated after publication -->
        <#if content.type == "post">
            <#-- Calculate age in months to adjust priority for older posts -->
            <#assign postDate = content.date?date>
            <#assign now = .now?date>
            <#assign daysDiff = (now?long - postDate?long) / 86400000>
            <#if daysDiff < 180>
        <changefreq>yearly</changefreq>
        <priority>0.9</priority>
            <#else>
        <changefreq>yearly</changefreq>
        <priority>0.8</priority>
            </#if>
        <#-- Pages: static content like about, talks, badges - important but not primary content -->
        <#else>
        <changefreq>yearly</changefreq>
        <priority>0.7</priority>
        </#if>
    </url>
    </#if>
</#list>
</urlset>
