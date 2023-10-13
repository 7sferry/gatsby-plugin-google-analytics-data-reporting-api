const {google} = require('googleapis');

const scopes = [
  // View and manage your Google Analytics data
  "https://www.googleapis.com/auth/analytics",

  // See and download your Google Analytics data
  "https://www.googleapis.com/auth/analytics.readonly",
];

exports.sourceNodes = async ({actions, createNodeId, createContentDigest}, pluginOptions) => {
  const {createNode} = actions;
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

  let metric = pluginOptions.metric || "screenPageViews";
  await analyticsReporting.properties.runReport({
    property: `properties/${pluginOptions.property}`,
    requestBody: {
      dimensions: [{name: "pagePath"}],
      metrics: [{name: metric}],
      dateRanges: [{startDate: pluginOptions.startDate, endDate: pluginOptions.endDate}],
      limit: pluginOptions.limit,
      orderBys: [{metric: {metricName: metric}, desc: pluginOptions.desc === true}],
    },
  }).then((report) => {
    report.data.rows.forEach(row => {
      const totalCount = row.metricValues[0].value;
      const pagePath = row.dimensionValues[0].value;
      createNode({
        path: pagePath,
        totalCount: Number(totalCount),
        id: createNodeId(pagePath),
        internal: {
          type: `PageViews`,
          contentDigest: createContentDigest({path: pagePath, totalCount: totalCount}),
          description: `Metric calculation by page path`,
        },
      });
    })
  });
};
