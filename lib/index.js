const request = require('request-promise');
const isNull = require('lodash.isnull');
const objectPath = require('object-path');


/**
 * 返回最后一个 value 不为 null 的 key
 *
 * {
 *   ts1:v1,
 *   ts2:v2,
 *   ts3:null
 * }
 *
 * 返回 ts2
 *
 * @param object
 * @returns {string|undefined}
 */
const getLastNonNullKey = (object) => {
  const keys = Object.keys(object);
  let i = keys.length;
  while (i > 0) {
    i -= 1;
    if (!isNull(object[keys[i]])) {
      return keys[i];
    }
  }
  return undefined;
};

/**
 * 请求 queryUrl，然后返回 result[0].pointlist 下最后一个 NonNullKey
 * @param queryUrl
 */
const getLastPointTimestamp = queryUrl =>
  request
    .get({
      url: queryUrl,
      json: true
    })
    .then(
      res => objectPath.get(res, 'result.0.pointlist', {})
    )
    .then(getLastNonNullKey);

/**
 * 写入延迟
 * @param influxdbUrl
 * @param latency
 */
const writeLatency = (influxdbUrl, latency) =>
  request
    .post({
      url: `${influxdbUrl}`,
      body: `latency value=${latency},rss=${process.memoryUsage().rss},heap=${process.memoryUsage().heapUsed} ${Date.now()}000000`
    });

exports.writeLatency = writeLatency;
exports.getLastPointTimestamp = getLastPointTimestamp;
exports.getLastNonNullKey = getLastNonNullKey;
