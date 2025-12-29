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

<#--
  Resolves a featured image path to an absolute URL.

  @param imagePath The featured image path (can be absolute URL, absolute path, or relative filename)
  @param contentUri The URI of the content containing the image
  @param siteHost The site host URL (e.g., "https://blog.bmarwell.de")
  @param includeHost Whether to include the host in the result (default: true)
  @return The resolved image path (absolute URL if includeHost=true, otherwise relative/absolute path)
-->
<#function resolveImagePath imagePath contentUri siteHost includeHost=true>
  <#-- Already an absolute URL (http/https) -->
  <#if imagePath?starts_with("http")>
    <#return imagePath>
  </#if>

  <#-- Absolute path starting with / -->
  <#if imagePath?starts_with("/")>
    <#if includeHost>
      <#return siteHost + imagePath>
    <#else>
      <#return imagePath>
    </#if>
  </#if>

  <#-- Relative path with directory -->
  <#if imagePath?contains("/")>
    <#if includeHost>
      <#return siteHost + "/" + contentUri?keep_before_last("/") + "/" + imagePath>
    <#else>
      <#return contentUri?keep_before_last("/") + "/" + imagePath>
    </#if>
  </#if>

  <#-- Just a filename in the same directory as content -->
  <#if includeHost>
    <#return siteHost + "/" + contentUri?keep_before_last("/") + "/" + imagePath>
  <#else>
    <#return contentUri?keep_before_last("/") + "/" + imagePath>
  </#if>
</#function>
