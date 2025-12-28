<?xml version="1.0" encoding="utf-8"?>
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
<feed xmlns="https://www.w3.org/2005/Atom">
  <title>${config.site_title}</title>
  <subtitle>${config.site_tagline}</subtitle>
  <link href="${config.site_host}"/>
  <link rel="self" href="${config.site_host}/${config.feed_file}" />
  <updated>${published_date?datetime?iso_utc}</updated>
  <#assign authors = data.get('authors.yaml').authors>
  <#--
    needed because data doesn't return a hash but an object.
    The names are likely to contain a space (for now).
  -->
  <#assign authornames = authors?keys?filter(key -> key.contains(" "))>

  <#list authornames as authorname>
  <author>
    <name>${authorname}</name>
    <#if (authors[authorname].email)??>
    <email>${authors[authorname].email}</email>
    </#if>
    <#if (authors[authorname].twitter)??>
    <uri>https://twitter.com/${authors[authorname].twitter}</uri>
    </#if>
  </author>
  </#list>
  <id>${config.site_host}</id>
  <generator uri="https://jbake.org/">JBake.org</generator>
  <icon>/images/favicon128.png</icon>
  <logo>/images/bens_it_kommentare.png</logo>

  <#setting datetime_format="yyyy-MM-dd HH:mm:ss">
  <#list published_posts[0..*12] as post>
    <entry <#if (post.lang)??>lang="${post.lang}"</#if> >
    <title>${post.title}</title>
    <link href="${config.site_host}/${post.uri}"/>
    <id>${config.site_host}/${post.uri}</id>
    <#if (post.date)??><published>${post.date?datetime?string.iso_s_u}</published></#if>
    <#if (post.updated)??><updated>${post.updated?datetime?string.iso_s_u}</updated></#if>
    <#if (post.description??)>
    <summary>${post.description}</summary>
    </#if>
    <#if (post.author??)>
    <author>
      <name>${post.author}</name>
    </author>
    </#if>
    <#--
      Content strategy: Show excerpt only (configurable via feed.excerpt.only)
      Reason: Prevents spammy crawlers from republishing full content before
      Google indexes the original, which could flag the original as duplicate.

      Note: Properties in jbake.properties with dots are accessed with underscores
      in templates: feed.excerpt.only -> config.feed_excerpt_only
    -->
    <#if (config.feed_excerpt_only)?? && (config.feed_excerpt_only == "true")>
    <content type="html">
      <#escape x as x?xml>
      <#-- Extract first paragraph as excerpt, same logic as index.ftl -->
      <p>${post.body?keep_after("<p>")?keep_before("</p>")}</p>
      <p><a href="${config.site_host}/${post.uri}">Continue reading »</a></p>
      </#escape>
    </content>
    <#else>
    <content type="html">
      <#escape x as x?xml>
      ${post.body}
      </#escape>
    </content>
    </#if>
  </entry>

  </#list>

</feed>
