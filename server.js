'use strict';


const app = require('rc-tools/lib/server/')();
const parse = require('co-busboy');
const fs = require('fs');

function wait(time) {
  return function (callback) {
    setTimeout(callback, time);
  }
}

app.post('/upload.do', function*() {
  const parts = parse(this, {
    autoFields: true
  });
  let part, files = [];
  while (part = yield parts) {
    files.push(part.filename);
    part.resume();
  }
  let ret = '';
  this.status = 200;
  this.set('Content-Type', 'text/html');
  yield wait(2000);
  if (parts.fields[0] && parts.fields[0][0] === '_documentDomain') {
    ret += '<script>document.domain="' + parts.fields[0][1] + '";</script>';
  }
  ret += JSON.stringify(files);
  console.log(ret);
  this.body = ret;
});

app.post('/test', function*() {
  this.set('Content-Type', 'text/html');

  const parts = parse(this, {
    autoFields: true
  });
  let part;
  const files = [];
  while (part = yield parts) {
    files.push(part.filename);
    part.resume();
  }

  const ret = parts.fields[2];

  if (ret[1].indexOf('success') > -1) {
    this.status = 200;
    this.body = ret;
  } else {
    this.status = 400;
    this.body = 'error 400';
  }
});

const port = process.env.npm_package_config_port;
app.listen(port);
console.log('listen at ' + port);
