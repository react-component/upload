const app = require('../server-fn')();
const port = process.env.npm_package_config_port;
app.listen(port);
console.log('listen at ' + port);
