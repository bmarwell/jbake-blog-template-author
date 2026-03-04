<?xml version="1.0" encoding="UTF-8"?>
<!--
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
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom"
                exclude-result-prefixes="atom">
  <xsl:output method="html" version="5.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title><xsl:value-of select="/atom:feed/atom:title"/> - RSS Feed</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #24292f;
            background-color: #f6f8fa;
            padding: 20px;
          }

          .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .feed-header {
            border-bottom: 2px solid #d0d7de;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }

          .feed-title {
            font-size: 2.3125em;
            line-height: 1;
            color: #24292f;
            margin-bottom: 10px;
          }

          .feed-subtitle {
            font-size: 1.1em;
            color: #6e7781;
            margin-bottom: 15px;
          }

          .feed-info {
            font-size: 0.875em;
            color: #6e7781;
            padding: 15px;
            background-color: #f6f8fa;
            border-radius: 6px;
            margin-bottom: 20px;
          }

          .feed-info a {
            color: #0969da;
            text-decoration: none;
          }

          .feed-info a:hover {
            text-decoration: underline;
          }

          .entry {
            border-bottom: 1px solid #d0d7de;
            padding: 25px 0;
          }

          .entry:last-child {
            border-bottom: none;
          }

          .entry-title {
            font-size: 1.75em;
            line-height: 1.321;
            margin-bottom: 10px;
          }

          .entry-title a {
            color: #24292f;
            text-decoration: none;
          }

          .entry-title a:hover {
            color: #0969da;
          }

          .entry-meta {
            font-size: 0.875em;
            color: #6e7781;
            margin-bottom: 15px;
          }

          .entry-summary {
            font-size: 1em;
            line-height: 1.6;
            color: #24292f;
            margin-bottom: 10px;
          }

          .entry-link {
            display: inline-block;
            padding: 8px 16px;
            background-color: #0969da;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-size: 0.875em;
            transition: background-color 0.2s;
          }

          .entry-link:hover {
            background-color: #0550ae;
          }

          @media (max-width: 768px) {
            body {
              padding: 10px;
            }

            .container {
              padding: 20px;
            }

            .feed-title {
              font-size: 1.75em;
            }

            .entry-title {
              font-size: 1.3125em;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="feed-header">
            <h1 class="feed-title">
              <xsl:value-of select="/atom:feed/atom:title"/>
            </h1>
            <p class="feed-subtitle">
              <xsl:value-of select="/atom:feed/atom:subtitle"/>
            </p>
          </div>

          <div class="feed-info">
            <p>
              <strong>This is an RSS feed.</strong> Subscribe by copying the URL into your RSS reader.
              Visit <a href="{/atom:feed/atom:link[@rel='self']/@href}" target="_blank">feed URL</a> or
              <a href="{/atom:feed/atom:link[not(@rel)]/@href}" target="_blank">website</a>.
            </p>
          </div>

          <div class="entries">
            <xsl:apply-templates select="/atom:feed/atom:entry"/>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="atom:entry">
    <article class="entry">
      <h2 class="entry-title">
        <a href="{atom:link/@href}" target="_blank">
          <xsl:value-of select="atom:title"/>
        </a>
      </h2>
      <div class="entry-meta">
        <time>
          <xsl:value-of select="substring(atom:updated, 1, 10)"/>
        </time>
        <xsl:if test="atom:author/atom:name">
          <xsl:text> by </xsl:text>
          <xsl:value-of select="atom:author/atom:name"/>
        </xsl:if>
      </div>
      <div class="entry-summary">
        <xsl:value-of select="atom:summary" disable-output-escaping="yes"/>
      </div>
      <a class="entry-link" href="{atom:link/@href}" target="_blank">
        Read full article →
      </a>
    </article>
  </xsl:template>

</xsl:stylesheet>
