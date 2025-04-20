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

          </div> <#-- loop-container -->

        </section><!-- main -->

        <footer class="site-footer">
          <div class="design-credit">
            <span>
              <a href="https://www.competethemes.com/author/" rel="nofollow">Author WordPress Theme</a> by Compete Themes.
            </span>
            &nbsp;||&nbsp;
            <span>
              Adaption of the Author Theme for JBake by <a href="https://github.com/bmarwell">Benjamin Marwell</a>.
            </span>
          </div>
        </footer>
      </div>
    </div>

    <#assign cacheBuster = ((.now)?date?iso_utc)>
    <!-- async css -->
    <#if config.site_matomo_enabled?boolean!false >
    <link rel="preload" href="${content.rootpath!""}lib/vanilla-cookieconsent/cookieconsent.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/vanilla-cookieconsent/cookieconsent.css?date=${cacheBuster}"></noscript>
    </#if>

    <link rel="preload" href="${content.rootpath!""}lib/fontawesome/css/solid.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/fontawesome/css/solid.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}lib/fontawesome/css/fontawesome.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/fontawesome/css/fontawesome.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}lib/fontawesome/css/brands.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/fontawesome/css/brands.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}lib/highlight.js/styles/default.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/highlight.js/styles/default.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}lib/simple-lightbox/simpleLightbox.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/simple-lightbox/simpleLightbox.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}lib/shariff-plus/shariff.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}lib/shariff-plus/shariff.min.css?date=${cacheBuster}"></noscript>

    <link rel="preload" href="${content.rootpath!""}css/appbox.min.css?date=${cacheBuster}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="${content.rootpath!""}css/appbox.min.css?date=${cacheBuster}"></noscript>

    <script src="${content.rootpath!""}js/author.min.js" ></script>
    <script src="${content.rootpath!""}lib/simple-lightbox/simpleLightbox.min.js?date=${cacheBuster}"></script>

    <script src="${content.rootpath!""}lib/shariff-plus/shariff.complete.js?date=${cacheBuster}"></script>

    <script src="${content.rootpath!""}lib/highlight.js/highlight.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/bash.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/ini.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/java.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/javascript.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/php.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/shell.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/xml.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/yaml.min.js?date=${cacheBuster}"></script>
    <script src="${content.rootpath!""}lib/highlightjs-line-numbers.js/highlightjs-line-numbers.min.js?date=${cacheBuster}"></script>

    <script>
      hljs.highlightAll();
      hljs.initLineNumbersOnLoad();
    </script>

    <script>
      new SimpleLightbox('div a', { /* options */ });
    </script>

    <#-- Matomo stats tracking -->
    <#if (config.site_matomo_enabled)?? && (config.site_matomo_enabled == "true") && (config.site_matomo_site_id)?? && (config.site_matomo_url)??>
    <!-- Matomo -->
    <script type="text/plain" data-category="analytics" data-service="Matomo">
      var _paq = window._paq = window._paq || [];
      /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="//${config.site_matomo_url}/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '${config.site_matomo_site_id}']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
      })();
    </script>
    <!-- End Matomo Code -->
    </#if>

    <#if config.site_matomo_enabled?boolean!false >
    <script src="${content.rootpath!""}lib/vanilla-cookieconsent/cookieconsent.umd.js"></script>
    <script type="module" src="${content.rootpath!""}js/cookieconsent-config.js"></script>
    </#if>

  </body>
</html>
