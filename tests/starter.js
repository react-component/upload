var app = require('rc-server')();
var parse = require('co-busboy');

app.use(function*() {
  if (this.url === '/upload.do') {
    var parts = parse(this, {
      autoFields: true // saves the fields to parts.field(s)
    });
    var files = [];
    var part = yield parts;
    files.push(part.filename);
    this.status = 200;
    this.set('Content-Type', 'text/html');
    this.res.end(JSON.stringify(files));
    return;
  }
});
var port = 8000;
app.listen(port);
console.log('listen at 8000');
