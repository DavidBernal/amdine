// I still to use require for external packages
const https = require('https');

define([], function () {
  const fetch = (route) =>
    new Promise((res, rej) =>
      https
        .get(route, (resp) => {
          let data = '';

          // A chunk of data has been recieved.
          resp.on('data', (chunk) => {
            data += chunk;
          });

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            res(JSON.parse(data));
          });
        })
        .on('error', (err) => {
          rej(err.message);
        })
    );

  return fetch;
});
