# gatsby-plugin-google-analytics-data-reporting-api

## Description

This is Reporting API plugin to get your page views count from Google Analytics Data API (GA4). I used to
use "https://www.gatsbyjs.com/plugins/gatsby-plugin-google-analytics-reporter" for my blog, but it's only support
Universal Analytics v4. Since Universal Analytics would be deprecated soon, and I didn't found the replacement for this
plugin yet, I decide to create one.

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
    //any plugins...

    resolve: `gatsby-plugin-google-analytics-data-reporting-api`,
    options: {
        serviceAccountEmail: process.env.ANALYTICS_EMAIL, //required. it's your service account email, like xxx.iam.gserviceaccount.com
        privateKey: process.env.ANALYTICS_PRIVATE_KEY, //required. it's your private key from google cloud console. download the json, and copy paste the private_key here. start from "-----BEGIN PRIVATE KEY-----" 
        property: process.env.ANALYTICS_GA4, //require. it's your GA4 property id
        startDate: `1970-01-01`, //optional, you can skip this. default: "1970-01-01". value is based on Google Analytics date value
        endDate: `yesterday`, //optional, you can skip this. default: "today". value is based on Google Analytics date value
        limit: 100, //optional, you can skip this. default: no limit.
        desc: true //optional, you can skip this. default: true
    }
}]
```

## When do I use this plugin?

Include stories about when this plugin is helpful and/or necessary.

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
