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

    <script src="${content.rootpath!""}js/author.min.js" ></script>
    <script src="${content.rootpath!""}js/custom.min.js" ></script>
    <script src="https://platform.twitter.com/widgets.js" ></script>

    <script src="${content.rootpath!""}lib/highlight.js/highlight.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/bash.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/java.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/javascript.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/php.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/xml.min.js"></script>
    <script src="${content.rootpath!""}lib/highlight.js/languages/yaml.min.js"></script>
    <script src="${content.rootpath!""}lib/highlightjs-line-numbers.js/highlightjs-line-numbers.min.js"></script>

    <script>
      hljs.highlightAll();
      hljs.initLineNumbersOnLoad();
      twitterFunctions.convertTweets();
    </script>

    <!-- https://github.com/andreknieriem/simplelightbox -->
    <script src="https://cdn.jsdelivr.net/npm/simplelightbox@2.10.2/dist/simple-lightbox.min.js"
            integrity="sha256-komTawLRshxX6Zdrs7uHGtscp8AVbQ+Md34ITQ3gqD0="
            crossorigin="anonymous"></script>
    <script>
      new SimpleLightbox('div a', { /* options */ });
    </script>

  </body>
</html>
