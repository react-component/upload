var app = require('rc-server')();
var parse = require('co-busboy');
var fs=require('fs');
function wait(time) {
  return function (callback) {
    setTimeout(callback, time);
  }
}

app.post('/upload.do', function*() {
  var parts = parse(this, {
    autoFields: true
  });
  var part,files=[];
  while (part = yield parts) {
    files.push(part.filename);
    part.resume();
  }
  console.log(parts.fields)
  this.status = 200;
  this.set('Content-Type', 'text/html');
  yield wait(2000);
  this.body = JSON.stringify(files);
});
var port = 8000;
app.listen(port);
console.log('listen at 8000');
