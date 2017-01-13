const version = require('./package.json').version;
const isDocker = require('is-docker');
const assert = require('assert');
const debug = require('debug')('what-is-the-latency');
const getLastPointTimestamp = require('./lib').getLastPointTimestamp;
const writeLatency = require('./lib').writeLatency;

// get configuration
const influxdbUrl = process.env.INFLUXDB_URL;
const queryUrl = process.env.QUERY_URL;
const interval = Math.max(parseInt(process.env.SCAN_INTERVAL || '5000', 10), 1000);
const raven = require('raven');

assert(process.env.INFLUXDB_URL, 'must provide indluxdb url');
assert(process.env.QUERY_URL, 'must provide query url');

// sentry
const sentryTags = {
  release: version,
  environment: isDocker() ? 'production' : 'development'
};
const client = new raven.Client('https://a9f2505ae7ef4e71846fdab33d62c322:62206c13c5cf4807815ad7b18727c25e@sentry.cloudinsight.cc/10', sentryTags);
client.patchGlobal();
client.on('error', e => debug(e.message));

// process signal
['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    debug(`exit on ${signal}`);
    process.exit(0);
  });
});

// begin
let lastPoint = null;

const check = () => {
  const writeOnValue = (lastPointTimestamp) => {
    if (!lastPointTimestamp) {
      throw new Error('no data');
    } else if (lastPointTimestamp !== lastPoint) {
      lastPoint = lastPointTimestamp;
      const latency = Date.now() - (1000 * lastPointTimestamp);
      debug(`${lastPoint}:${latency}`);
      return writeLatency(influxdbUrl, latency);
    } else {
      debug(`${lastPointTimestamp}`);
    }
    return undefined;
  };
  const url = `${queryUrl}&end=${Date.now() - 5000}`;
  getLastPointTimestamp(url)
    .then(writeOnValue)
    .catch((e) => {
      debug(e.message);
      client.captureException(e, {
        tags: {
          url
        }
      });
    });
};

check();

debug(`ok: polling at ${interval}`);
setInterval(check, interval);
