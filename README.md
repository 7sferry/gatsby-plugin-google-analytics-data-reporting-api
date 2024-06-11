# gatsby-plugin-google-analytics-data-reporting-api

## Description

This is Reporting API plugin to get your page views count from Google Analytics Data API (GA4). I used to
use "https://www.gatsbyjs.com/plugins/gatsby-plugin-google-analytics-reporter" for my blog, but it's only support
Universal Analytics v4. Since Universal Analytics would be deprecated soon, and I didn't found the replacement for GA4
yet, so I decide to create one.

## How to install

1. Make sure you already set up Google Analytics 4 and anything related properly;
2. Enable Google Analytics Data API in your console cloud apis
   in "https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com";
3. Make sure your Service Account email has "Viewer" permissions. It's on Google Analytics page > Admin > Account Access
   Management > choose the Service Account Email > View user's Account details on Roles and Data Restrictions > Choose
   your GA 4 property > Set it as "Viewer";
4. run `npm i gatsby-plugin-google-analytics-data-reporting-api`;
5. add this to your `gatsby-config`:

```js
plugins: [{
  //other plugins...

  resolve: `gatsby-plugin-google-analytics-data-reporting-api`,
  options: {
    serviceAccountEmail: process.env.ANALYTICS_EMAIL,
    privateKey: process.env.ANALYTICS_PRIVATE_KEY,
    property: process.env.ANALYTICS_GA4,
    startDate: `2020-01-01`,
    endDate: `yesterday`,
    limit: 100,
    metric: `screenPageViews`,
    regexFilter: `^/page/`,
    desc: true
  }
}]
```

I recommend you to set the sensitive value above in environment variables, or use "(dot)env" in local for security.

## Options

### serviceAccountEmail

required. it's your service account email, like xxx@xxx.iam.gserviceaccount.com.

### privateKey

required. it's your private key from Google cloud console. download the json, and copy and paste the "private_key" here.
it's start with "-----BEGIN PRIVATE KEY-----".

### property

required. it's your GA4 property id from Google Analytics Page.

### startDate

required since v1.3.0. it's based on Google Analytics date value. Could be '30daysAgo', 'today', 'yesterday', or ISO
date format (yyyy-MM-dd) like '2022-12-31'. Default value '365daysAgo'. Google changed its API and for version < v1.3.0
using startDate default value will throw error. Since v1.3.0 I encourage to specify your startDate in config or use
dynamic value like '365daysAgo'.

### endDate

required since v1.3.0. it's based on Google Analytics date value. Could be '30daysAgo', 'today', 'yesterday', or ISO
date format (yyyy-MM-dd) like '2022-12-31'. Default value 'today'. Since v1.3.0 I encourage to specify your endDate.

### metric

optional. Metric calculation for reporting. Default value is 'screenPageViews' to calculate metric of the number of app
screens or web pages your users viewed. Repeated views of a single page or screen are counted. Since v1.1.0 we can use
custom metric like 'totalUsers' to calculate based on distinct users, or 'scrolledUsers' to calculate based on total
users who scrolled your pages to at least 90% of page.
Visit "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#metrics" for more info about
metric values can be used.

### limit

optional. you can skip this option. it's to limit data fetch from the API. Default value is null which means no limit.

### desc

optional. you can skip this option. it's boolean value to determine you want to order the result by ascending or
descending. Default value is true.

### regexFilter
optional. you can skip this option. it's a regex value to filter page path. for examples, you only want to filter page which starts by "/page/", then you can write regex filter value to "^/page/".

## Examples of usage

query the page views like this:

```graphql
query AnalyticsPageQuery {
    allPageViews(sort: { totalCount: DESC }) {
        nodes {
            path
            totalCount
        }
    }
}
```

the response would be this:

```json
{
  "data": {
    "allPageViews": {
      "nodes": [
        {
          "path": "/blog/first-blog",
          "totalCount": 190
        },
        {
          "path": "/blog/second-blog",
          "totalCount": 55
        }
      ]
    }
  }
}
```

## Using Client Side Analytics
By default, this plugin will fetch analytics in build time. so, any new data can't be fetched until next build. Doing this in runtime on client side would expose our sensitive key.

Since Gatsby 5 (I used v5.13.3), we can create a middleware API on server side. We can use it to get analytics in runtime without exposing sensitive key to client.

To do this we should create an api inside "src/api" directory, for example "src/api/trending.ts" (or "src/api/trending.js") for api with route: "/api/trending" and import getReport from gatsby-plugin-google-analytics-data-reporting-api.

```ts
import { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby";
import {
  getReport,
  ReportingPluginOption,
  TrendingReport,
} from "gatsby-plugin-google-analytics-data-reporting-api";

function getTimeToLiveExpiration() {
   return 24 * 3600;
}

export default async function handler(_: GatsbyFunctionRequest, res: GatsbyFunctionResponse) {
  let ttl = getTimeToLiveExpiration();
  let opt: ReportingPluginOption = {
    privateKey: process.env.ANALYTICS_PRIVATE_KEY,
    property: process.env.ANALYTICS_GA4,
    serviceAccountEmail: process.env.ANALYTICS_EMAIL,
    desc: false,
    endDate: "yesterday",
    limit: 5,
    metric: "scrolledUsers",
    regexFilter: "^/blog/",
    startDate: "30daysAgo",
  };
  let reports: TrendingReport[] = await getReport(opt);
  res.setHeader("Cache-Control", `public, max-age=${ttl}, s-maxage=${ttl + 3600}, stale-while-revalidate=300`).json({
    nodes: reports,
  });
}
```
or if using js:
```js
import {
  getReport
} from "gatsby-plugin-google-analytics-data-reporting-api";

function getTimeToLiveExpiration() {
	return 24 * 3600;
}

export default async function handler(_, res) {
  let ttl = getTimeToLiveExpiration();
  let opt = {
    privateKey: process.env.ANALYTICS_PRIVATE_KEY,
    property: process.env.ANALYTICS_GA4,
    serviceAccountEmail: process.env.ANALYTICS_EMAIL,
    desc: false,
    endDate: "yesterday",
    limit: 5,
    metric: "scrolledUsers",
    regexFilter: "^/blog/",
    startDate: "30daysAgo",
  };
  let reports = await getReport(opt);
  res.setHeader("Cache-Control", `public, max-age=${ttl}, stale-while-revalidate=300`).json({
    nodes: reports,
  });
}
```

notes: better use max-age and set time to live expiration (in seconds) to cache response for better experience.

And in your component make an API call to "/api/trending" route and render the result:
```jsx
import { useEffect, useState } from "react";

export const fetchTopTrending = () => {
  const [trendingReports, setTrendingReports] = useState([]);
  useEffect(() => {
    getTopTrendingReports().then((reports) => {
      setTrendingReports(reports);
    });
  }, []);

  return (
        <ul>
          {trendingNodes.map((node) => {
            return (
              <li key={node.path}>
                <small className="title">
                  <Link className="text-link" to={`${node.path}`}>
                    {node.path}
                  </Link>
                </small>
              </li>
            );
          })}
        </ul>
  )
};

async function getTopTrendingReports() {
  let response = await fetch("/api/trending");
  if (response.status !== 200) {
    return [];
  }
  const reportNode = await response.json();
  let reports = [];
  for (const node of reportNode.nodes) {
    reports.push(node);
  }
  return reports;
}
```



## Changelogs
See: https://github.com/7sferry/gatsby-plugin-google-analytics-data-reporting-api/releases

## How to contribute

any ideas or recommendations are welcome.
