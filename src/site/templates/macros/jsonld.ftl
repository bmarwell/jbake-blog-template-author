<#macro jsonld content type>
  <#if (config.site_jsonld!true) == false><#return></#if>
  <#setting datetime_format="yyyy-MM-dd HH:mm:ss">
  <#assign authorsJsonLd = data.get('authors.yaml').authors>
  <#assign jsonld = { "@context": "https://schema.org" } />

  <#assign jsonld = jsonld + { "@type": "${type}" } />

  <#if (content.uri)??>
    <#assign jsonld = jsonld + { "url": "${config.site_host}${content.uri}" } />
  </#if>
  <#-- not for "DefinedTerm -->
  <#if (content.title)??>
    <#assign jsonld = jsonld + { "headline": "${content.title?trim}" } />
  </#if>
  <#if (content.name)??>
    <#assign jsonld = jsonld + { "name": "${content.name?trim}" } />
  </#if>
  <#if (content.featuredimage)??>
    <#if (content.featuredimage)?starts_with("http")>
      <#assign featuredImageAbsolutePath = content.featuredimage?trim >
    <#elseif (content.featuredimage)?starts_with("/")>
      <#-- absolute path is not sufficient -- featured images must be an absolute URL. -->
      <#assign featuredImageAbsolutePath = config.site_host + content.featuredimage/>
    <#elseif (content.featuredimage)?contains("/")>
      <#assign featuredImageAbsolutePath = "${config.site_host}/${(content.uri?substring(0, content.uri?last_index_of('/')))}/${content.featuredimage}" />
    <#else>
      <#-- relative URI starting with ./ or ../ or directly with the image name. -->
      <#assign featuredImageAbsolutePath = "${config.site_host}/${(content.uri?substring(0, content.uri?last_index_of('/')))}/${content.featuredimage}" />
    </#if>
    <#assign jsonld = jsonld + { "image": "${featuredImageAbsolutePath?trim}" } />
  <#elseif (config.site_default_featured_image_file)??>
    <#assign jsonld = jsonld + { "image": "${config.site_default_featured_image_file?trim}" } />
  </#if>
  <#if (content.date)??>
    <#assign jsonld = jsonld + { "dateCreated": "${content.date?datetime?string.iso_s_u}", "datePublished": "${content.date?datetime?string.iso_s_u}", "copyrightYear": "${content.date?string('yyyy')}" } />
  </#if>
  <#if (content.updated)??>
    <#assign jsonld = jsonld + { "dateModified": "${content.updated?datetime?string.iso_s_u}" } />
  </#if>
  <#if (content.lang)??>
    <#assign jsonld = jsonld + { "inLanguage": "${content.lang?trim}" } />
  </#if>
  <#if (config.site_host)??>
    <#assign jsonld = jsonld + { "mainEntityOfPage": { "@type": "WebPage", "@id": "${config.site_host}/" } } />
  </#if>
  <#if (content.body)??>
    <#assign jsonld = jsonld + { "articleBody": "${content.body?replace('<[^>]+>','','r')?trim}" } />
  </#if>
  <#if (content.tags)??>
    <#assign jsonld = jsonld + { "keywords": content.tags } />
  </#if>
  <#if (content.author)??>
    <#assign personJsonLd = { "@type": "Person", "name": "${content.author?trim}" } />
    <#if (authorsJsonLd[content.author?trim])?? && (authorsJsonLd[content.author?trim]['url'])??>
      <#assign personJsonLd = personJsonLd + { "url": "${authorsJsonLd[content.author?trim]['url']}" } />
    </#if>
    <#assign jsonld = jsonld + { "author" : personJsonLd } />
    <#assign jsonld = jsonld + { "creator": personJsonLd } />
  </#if>
  <#assign publisherJsonLd = { "@type": "Organization", "url": "${config.site_host}/" } />
  <#if (config.site_title)??>
    <#assign publisherJsonLd = publisherJsonLd + { "name": "${config.site_title?trim}" } />
  </#if>
  <#if (config.site_default_featured_image_file)??>
    <#assign publisherLogoJsonLd = { "@type": "ImageObject", "url": "${content.rootpath!''}${config.site_default_featured_image_file}" } />

    <#if (config.site_default_featured_image_width)??>
      <#assign publisherLogoJsonLd = publisherLogoJsonLd + { "width": "${config.site_default_featured_image_width}" } />
    </#if>
    <#if (config.site_default_featured_image_height)??>
      <#assign publisherLogoJsonLd = publisherLogoJsonLd + { "height": "${config.site_default_featured_image_height}" } />
    </#if>
    <#assign publisherJsonLd = publisherJsonLd + { "logo": publisherLogoJsonLd } />
  </#if>
  <#if (type != "DefinedTerm") && (type != "DefinedTermSet")>
    <#assign jsonld = jsonld + { "publisher": publisherJsonLd } />
  </#if>
  <#--
   {
    "@context": "https://schema.org",
    "image": "https://benborgers.com/assets/json-ld.png",
    "description": "Adding data to your developer blog in the JSON-LD format, like the title, description, share image, author, and date published, can make it easier for Google to parse and index your articles.",
    "alternativeHeadline": "An indepth article on why I love cats",
    "isFamilyFriendly": "true",
    "copyrightHolder": "",
    "genre":["SEO","JSON-LD"],
    "articleSection": "Uncategorized posts",
  -->
  <script type="application/ld+json"><@objectToJson jsonld /></script>
</#macro>

<#macro objectToJson object>
    <@compress single_line=true>
        <#if object?is_hash || object?is_hash_ex>
            <#assign first="true">
          {
            <#list object?keys as key>
                <#if first="false">,</#if>
                <#assign foo = key />
                <#assign value><@objectToJson object=object[key]!"" /></#assign>
              "${key}": ${value?trim}
                <#assign first="false">
            </#list>
          }
        <#elseif object?is_enumerable>
            <#assign first="true">
          [
            <#list object as item>
                <#if first="false">,</#if>
                <#assign value><@objectToJson object=item /></#assign>
                ${value?trim}
                <#assign first="false">
            </#list>
          ]
        <#else>
          "${object?trim?json_string}"
        </#if>
    </@compress>
</#macro>
