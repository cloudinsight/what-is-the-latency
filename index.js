const request = require('request-promise');
const isNull = require('lodash.isnull');
const stringify = require('querystring').stringify;
const raven = require('raven');

// sentry
const client = new raven.Client('https://a9f2505ae7ef4e71846fdab33d62c322:62206c13c5cf4807815ad7b18727c25e@sentry.cloudinsight.cc/10', {
  transport: new raven.transports.HTTPSTransport({ rejectUnauthorized: false })
});
client.patchGlobal();
client.on('error', e => console.error(e));

// get parameters
const token = 'c4574494bb874afcab772d3f91fa7aad';
const db = process.env.DB;
const influxdb_host = process.env.INFLUXDB_HOST;
const influxdb_port = 8086;
const interval = Math.max(parseInt(process.env.SCAN_INTERVAL || 3000, 10), 1000);

const params = {
  q: 'avg:base.counter.1s.1',
  begin: 180000,
  token: token,
  interval: 10
};
const url = `https://cloud.oneapm.com/v1/query.json?${stringify(params)}`;

// / begin
let lastPoint;

const createDatabase = () => {
  return request.post({
    url: `http://${influxdb_host}:${influxdb_port}/query`,
    form: {
      q: `CREATE DATABASE ${db}`
    }
  }).then(() => {
    const message = `ok: created database ${db} on ${influxdb_host}:${influxdb_port}`;
    client.captureMessage(message, {
      level: 'debug'
    });
    console.log(message);
  }).catch(e => {
    client.captureException(e, function () {
      console.log(arguments)
    });
  })
};

const writeLatency = latency => request.post({
  url: `http://${influxdb_host}:${influxdb_port}/write?db=${db}`,
  body: `latency value=${latency} ${Date.now()}000000`
});

const check = () => {
  request.get(url, (error, res, responseText) => {
    if (error) {
      return;
    }
    try {
      const pointList = JSON.parse(responseText).result[0].pointlist;
      const keys = Object.keys(pointList);
      let i = keys.length;
      while (i >= 0) {
        i--;
        if (!isNull(pointList[keys[i]])) {
          if (keys[i] !== lastPoint) {
            lastPoint = keys[i];
            writeLatency(2500 + Date.now() - 1000 * keys[i]);
          }
          break;
        }
      }
    } catch (e) {
    }
  });
};

createDatabase().then(() => {
  check();
  console.log(`ok: polling at ${interval}`);
  setInterval(check, interval);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`exit on ${signal}`);
    process.exit(0);
  });
});
