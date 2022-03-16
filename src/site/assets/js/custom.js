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

var twitterFunctions = (function() {
  const TWITTERFUNCTIONS = function(twitterFunctions) {
    function convertTweets() {
      var tweets = Object.values(document.querySelectorAll("div.twitter"));

      tweets.forEach(tweet => convertTwitterDiv(tweet));
    }

    /* Interface definition */
    Object.assign(twitterFunctions, {
      convertTweets
    });

    return twitterFunctions;
  }

  var TwitterFunctions = TWITTERFUNCTIONS({});

  function convertTwitterDiv(tweet) {
    if (tweet.hasAttribute("data-tweet-id")) {
      convertTweet(tweet, tweet.dataset.tweetId);
    } else if (tweet.hasAttribute("data-twitter-timeline-id")) {
      convertTimeline(tweet, tweet.dataset.twitterTimelineId);
    }
  }

  function convertTweet(tweet, tweetId) {
    tweet.innerHTML = "";
    twttr.widgets
      .createTweet(tweetId, tweet, {
        // conversation: 'none', // or all
        // cards: 'hidden', // or visible
        // linkColor: '#cc0000', // default is blue
        // theme: 'light', // or dark
      })
      .then(function (el) {
        // el.contentDocument.querySelector('.footer').style.display = 'none';
      });
  }

  function convertTimeline(tweet, timelineId) {
    tweet.innerHTML = "";
    twttr.widgets
      .createTimeline(
        {
          sourceType: 'profile',
          screenName: timelineId
        },
        tweet,
        {
          width: '450',
          height: '700',
          // related: 'twitterdev,twitterapi'
        } )
      .then( function ( el ) {
        //el.contentDocument.querySelector('.footer').style.display = 'none';
      } );
  }

  const twitterFunctions = TwitterFunctions;

  return twitterFunctions;
})();
if (typeof exports === 'object' && typeof module !== 'undefined') { module.exports = twitterFunctions; }
