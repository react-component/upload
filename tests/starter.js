var app = require('rc-server')();
var parse = require('co-busboy');

function wait(time) {
  return function (callback) {
    setTimeout(callback, time);
  }
}

app.post('/upload.do', function*() {
  var parts = parse(this, {
    autoFields: true // saves the fields to parts.field(s)
  });
  var files = [];
  var part = yield parts;
  if (part) {
    files.push(part.filename);
  } else {
    files.push('foo.png');
  }
  this.status = 200;
  this.set('Content-Type', 'text/html');
  yield wait(2000);
  this.body = JSON.stringify(files);
});
var port = 8000;
app.listen(port);
console.log('listen at 8000');
