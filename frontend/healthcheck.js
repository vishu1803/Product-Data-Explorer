const http = require('http'); // eslint-disable-line @typescript-eslint/no-require-imports

const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200 || res.statusCode === 404) {
    // 404 is acceptable if no health endpoint exists
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', function(err) {
  console.log('ERROR', err);
  process.exit(1);
});

request.end();
