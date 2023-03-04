const { google } = require('googleapis');

const scopes = [
  // View and manage your Google Analytics data
  "https://www.googleapis.com/auth/analytics",

  // See and download your Google Analytics data
  "https://www.googleapis.com/auth/analytics.readonly",
];

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }, pluginOptions) => {
  const { createNode } = actions;
  const jwt = new google.auth.JWT(
      pluginOptions.serviceAccountEmail,
      null,
      pluginOptions.privateKey.replace(/\\n/gm, "\n"),
      scopes
  );
  await jwt.authorize();

  const analyticsReporting = google.analyticsdata({
    version: "v1beta",
    auth: jwt,
  });

  await analyticsReporting.properties.runReport({
    property: `properties/${pluginOptions.property}`,
    requestBody: {
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dateRanges: [{ startDate: pluginOptions.startDate || '1970-01-01', endDate: pluginOptions.endDate || 'today' }],
      limit: pluginOptions.limit,
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: pluginOptions.desc || true }],
    },
  }).then((report) => {
    report.data.rows.forEach(row => {
      const screenPageViewCount = row.metricValues[0].value;
      const pagePath = row.dimensionValues[0].value;
      createNode({
        path: pagePath,
        totalCount: Number(screenPageViewCount),
        id: createNodeId(pagePath),
        internal: {
          type: `PageViews`,
          contentDigest: createContentDigest({ path: pagePath, totalCount: screenPageViewCount }),
          description: `Screen page views by page path`,
        },
      });
    })
  });
};
