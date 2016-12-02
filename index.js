const request = require('request');
const isNull = require('lodash.isnull');
const token = process.env.TOKEN || 'c4574494bb874afcab772d3f91fa7aad';
const url = `https://cloud.oneapm.com/v1/query.json?q=avg:system.load.1&begin=180000&interval=10&token=${token}`;

let lastPoint;

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
          // console.log(':', keys[i])
          if (keys[i] !== lastPoint) {
            lastPoint = keys[i];
            console.log(2500 + Date.now() - 1000 * keys[i]);
          }
          break;
        }
      }
    } catch (e) {
    }
  });
}

check();
setInterval(check, 5000);

console.log(process.env)


process.on('SIGINT', () => {
  console.log('exit');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('exitt');
  process.exit(0);
});


