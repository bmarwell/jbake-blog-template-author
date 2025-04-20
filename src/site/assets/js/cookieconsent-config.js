/*
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

CookieConsent.run({

  categories: {
    necessary: {
      enabled: true,  // this category is enabled by default
      readOnly: true  // this category cannot be disabled
    },
    analytics: {
      autoClear: {
        cookies: [
          {
            name: /^_pk/,   // regex: match all cookies starting with '_pk' (Piwik aka matomo)
          },
        ]
      },
    },
    github_comments: {

    }
  },

  language: {
    default: 'en',
    autoclear_cookies: true,
    translations: {
      en: {
        consentModal: {
          title: 'We use cookies',
          description: 'This blog uses cookies for analytics purposes (Matomo). By continuing to use this site, you agree to this. <button type="button" data-cc="c-settings" class="cc-link">Manage preferences</button>',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          showPreferencesBtn: 'Manage Individual preferences'
        },
        preferencesModal: {
          title: 'Manage cookie preferences',
          acceptAllBtn: 'Accept all',
          acceptNecessaryBtn: 'Reject all',
          savePreferencesBtn: 'Accept current selection',
          closeIconLabel: 'Close modal',
          sections: [
            {
              title: 'Cookie and Data Processing Preferences',
            },
            {
              title: 'Strictly Necessary cookies',
              description: 'These cookies are essential for the proper functioning of the website and cannot be disabled.',

              //this field will generate a toggle linked to the 'necessary' category
              linkedCategory: 'necessary'
            },
            {
              title: 'Performance and Analytics',
              description: 'These cookies collect information about how you use the website, such as which pages you visit and which links you click on. The information is used to improve the website.',
              linkedCategory: 'analytics'
            },
            {
              title: 'GitHub Comments (giscus)',
              description: 'This site uses GitHub Discussions for comments. By enabling this, your GitHub username and comments will be publicly visible and stored on GitHub. GitHub\'s privacy policy will apply.',
              linkedCategory: 'github_comments'
            }
          ]
        }
      }
    }
  }
});
