var app = require('rc-server')();
var parse = require('co-busboy');
var fs = require('fs');

function wait(time) {
  return function (callback) {
    setTimeout(callback, time);
  }
}

app.post('/upload.do', function*() {
  var parts = parse(this, {
    autoFields: true
  });
  var part, files = [];
  while (part = yield parts) {
    files.push(part.filename);
    part.resume();
  }
  var ret = '';
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
  var ret = yield parse(this);
  if (ret[1].indexOf('success') > -1) {
    this.status = 200;
    this.body = ret;
  } else {
    this.status = 400;
    this.body = 'error 400';
  }
});

var port = 8000;
app.listen(port);
console.log('listen at 8000');
