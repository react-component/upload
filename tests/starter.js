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
  console.log(parts.fields);
  var ret = '';
  this.status = 200;
  this.set('Content-Type', 'text/html');
  yield wait(2000);
  if (parts.fields[0][0] === '_documentDomain') {
    ret += '<script>document.domain="' + parts.fields[0][1] + '";</script>';
  }
  ret += JSON.stringify(files);
  console.log(ret);
  this.body = ret;
});
var port = 8000;
app.listen(port);
console.log('listen at 8000');
