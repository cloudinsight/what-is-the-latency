const request = require('request-promise');
const isNull = require('lodash.isnull');
const stringify = require('querystring').stringify;

// get parameters
const token = process.env.TOKEN || 'c4574494bb874afcab772d3f91fa7aad';
const db = process.env.DB || 'mydb';
const influxdb_host = process.env.INFLUXDB_HOST || 'influxdb';
const influxdb_port = process.env.INFLUXDB_PORT || 8086;
const interval = process.env.SCAN_INTERVAL || 3000;
const params = {
  q: 'avg:base.counter.1s.1',
  begin: 180000,
  token: token,
  interval: 10
};
const url = `https://cloud.oneapm.com/v1/query.json?${stringify(params)}`;

// / begin
let lastPoint;

const createDatabase = () => request.post({
  url: `http://${influxdb_host}:${influxdb_port}/query`,
  form: {
    q: `CREATE DATABASE ${db}`
  }
});

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
  setInterval(check, interval);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    console.log(`exit on ${signal}`);
    process.exit(0);
  });
});
