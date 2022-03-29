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

<#macro langIconSpan lang spaceAfter=true>
  <#if (config.site_language_indicator?boolean!true)>
      <#compress><span class="lang-${lang} lang-icon-append"></span><#if spaceAfter>&nbsp;</#if></#compress>
  <#else></#if>
</#macro>

<#macro langIcon post spaceAfter=true>
  <#if !(config.site_language_indicator?boolean!true)>
    <#return>
  </#if>

  <#if (post.lang)??>
    <@langIconSpan "${post.lang}" spaceAfter />
  <#elseif !(post.lang)??>
    <@langIconSpan "unknown" spaceAfter />
  <#else>
  </#if>
</#macro>

<#macro tagDescriptionElement description lang>
  <#if (lang == "unknown")>
    <#assign langCode="">
  <#else>
    <#assign langCode="${lang}" />
  </#if>
  <@langIconSpan lang true /><span class="tag-description" lang="${langCode}">${description?trim}</span>
</#macro>

<#macro tagDescription keyword>
  <#if !(keyword.description)??>
    <#return />
  </#if>
  <#-- this macro supports two types of descriptions:
    - a single description of unknown language
    - an object (hash) of lang/description
  -->
  <#if (keyword.description?is_hash)>
    <#list keyword.description as langIso, description>
      <#if !(langIso?is_string) || (!(description!{})?is_string) ><#continue /></#if>
      <#if !(langIso?length == 5 && langIso?contains('-')) && !(langIso?length == 2)><#continue /></#if>
      <div><@tagDescriptionElement description langIso /></div>
    </#list>
  <#elseif (keyword.description?is_string)>
    <@tagDescriptionElement keyword.description?trim "unknown" />
  </#if>
</#macro>
