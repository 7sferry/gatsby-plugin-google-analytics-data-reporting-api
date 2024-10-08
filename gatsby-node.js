const { executeAnalytics } = require("./index.js");

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    serviceAccountEmail: Joi.string()
        .required()
        .description(`it's your service account email, like xxx@xxx.iam.gserviceaccount.com.`),
    privateKey: Joi.string()
        .required()
        .description(
            `it's your private key from Google cloud console. download the json, and copy and paste the "private_key" here. it's start with "-----BEGIN PRIVATE KEY-----".`
        ),
    property: Joi.string().required().description(`it's your GA4 property id from Google Analytics Page.`),
    startDate: Joi.string().description(
        `it's based on Google Analytics date value. Could be '30daysAgo', 'today', 'yesterday', or ISO date format (yyyy-MM-dd) like '2022-12-31'. Default value '365daysAgo'. Google changed its API and for version < v1.3.0 using startDate default value will throw error. Since v1.3.0 I encourage to specify your startDate in config or use dynamic value like '365daysAgo'.`
    ),
    endDate: Joi.string().description(
        `it's based on Google Analytics date value. Could be '30daysAgo', 'today', 'yesterday', or ISO date format (yyyy-MM-dd) like '2022-12-31'. Default value 'today'.`
    ),
    metric: Joi.string().description(
        `Metric calculation for reporting. Default value is 'screenPageViews' to calculate metric of the number of app screens or web pages your users viewed. Repeated views of a single page or screen are counted. Since v1.1.0 we can use custom metric like 'totalUsers' to calculate based on distinct users, or 'scrolledUsers' to calculate based on total users who scrolled your pages to at least 90% of page. Visit "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#metrics" for more info about metric values can be used.`
    ),
    dimension: Joi.string().description(
        `Dimension for reporting. Default value is 'pagePath' as path your users viewed or 'landingPagePlusQueryString' if metric is 'organicGoogleSearch'. Visit "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema#dimensions" for more info about dimension values can be used.`
    ),
    limit: Joi.number()
        .min(1)
        .description(
            `you can skip this option. it's to limit data fetch from the API. Default value is null which means no limit.`
        ),
    desc: Joi.boolean().description(
        `you can skip this option. it's boolean value to determine you want to order the result by ascending or descending. Default value is true`
    ),
    regexFilter: Joi.string().description(
        `you can skip this option. it's a regex value to filter page path. for examples, you only want to filter page which starts by "/page/", then you can write regex filter value to "^/page/".`
    ),
  });
};

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, pluginOptions) => {
  try {
    const { createNode } = actions;
    let report = await executeAnalytics(pluginOptions);
    report.data.rows.forEach((row) => {
      const totalCount = row.metricValues[0].value;
      const pagePath = row.dimensionValues[0].value;
      createNode({
        path: decodeURIComponent(pagePath),
        totalCount: Number(totalCount),
        id: createNodeId(pagePath),
        internal: {
          type: `PageViews`,
          contentDigest: createContentDigest({ path: pagePath, totalCount: totalCount }),
          description: `Metric calculation by page path`,
        },
      });
    });
  } catch (err) {
    console.error("failed to ge analytics report. " + err);
  }
};
