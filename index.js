"use strict";

const { google } = require("googleapis");
exports.__esModule = true;
exports.getReport = getReport;
exports.executeAnalytics = executeAnalytics;

const scopes = [
  // View and manage your Google Analytics data
  "https://www.googleapis.com/auth/analytics",

  // See and download your Google Analytics data
  "https://www.googleapis.com/auth/analytics.readonly",
];

const constructReport = row => {
  return {
    path: decodeURIComponent(String(row?.dimensionValues?.[0]?.value)),
    value: Number(row?.metricValues?.[0].value),
  };
}

async function getReport(pluginOptions) {
  let report = await executeAnalytics(pluginOptions);
  return report.data.rows?.map(constructReport) || [];
}

async function executeAnalytics(pluginOptions) {
  const jwt = new google.auth.JWT(
    pluginOptions.serviceAccountEmail,
    undefined,
    pluginOptions.privateKey.replace(/\\n/gm, "\n"),
    scopes
  );
  await jwt.authorize();

  const analyticsReporting = google.analyticsdata({
    version: "v1beta",
    auth: jwt,
  });

  let metric = pluginOptions.metric || "screenPageViews";
  let assignedDimension = pluginOptions.dimension || "pagePath";
  let dimension = metric.startsWith("organicGoogleSearch") ? "landingPagePlusQueryString" : assignedDimension;
  let regexFilter = pluginOptions.regexFilter;
  const properties = analyticsReporting.properties;
  return properties.runReport({
    property: `properties/${pluginOptions.property}`,
    requestBody: {
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      dateRanges: [{ startDate: pluginOptions.startDate || "365daysAgo", endDate: pluginOptions.endDate || "today" }],
      dimensionFilter: {
        orGroup: {
          expressions: [
            {
              orGroup: {
                expressions: [
                  {
                    filter: {
                      fieldName: dimension,
                      stringFilter: {
                        matchType: "PARTIAL_REGEXP",
                        value: regexFilter,
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      limit: pluginOptions.limit?.toString(),
      orderBys: [{ metric: { metricName: metric }, desc: pluginOptions.desc ?? true }],
    },
  });
}
