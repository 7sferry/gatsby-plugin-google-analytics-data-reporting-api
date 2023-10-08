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
    startDate: `1970-01-01`,
    endDate: `yesterday`,
    limit: 100,
    metric: `screenPageViews`,
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

optional. you can skip this option. it's based on Google Analytics date value. Could be '30daysAgo', 'today', '
yesterday', or ISO date format (yyyy-MM-dd) like '2022-12-31'. Since v1.2.0 Default value is '2005-01-01' because
Google Analytics 4 say so. If you still use version <= 1.1.0 you should upgrade to newer version or specify startDate in
your gatsby-config.

### endDate

optional. you can skip this option. it's based on Google Analytics date value. Could be '30daysAgo', 'today', '
yesterday', or ISO date format (yyyy-MM-dd) like '2022-12-31'. Default value is 'today'.

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

## How to contribute

any ideas or recommendations are welcome.
