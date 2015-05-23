var app = require('rc-server')();
app.use(function*() {
  if (this.url === '/upload.do') {
    this.set('Content-Type', 'text/html');
    this.status = 200;
    this.res.end('["hello"]');
    return;
  }
});
var port = 8000;
app.listen(port);
console.log('listen at 8000');
