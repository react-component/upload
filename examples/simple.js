webpackJsonp([0,1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var React = __webpack_require__(2);
	var Upload = __webpack_require__(3);
	var props = {
	  action: '/upload.do',
	  data: { a: 1, b: 2 },
	  multiple: true,
	  onStart: function onStart(file) {
	    console.log('onStart', file.name || file.value);
	  },
	  onSuccess: function onSuccess(ret) {
	    console.log('onSuccess', ret);
	  },
	  onProgress: function onProgress(step, file) {
	    console.log('onProgress', step, file);
	  },
	  onError: function onError(err) {
	    console.log('onError', err);
	  }
	};
	
	var Test = React.createClass({
	  displayName: 'Test',
	
	  getInitialState: function getInitialState() {
	    return {
	      destroyed: false
	    };
	  },
	
	  destroy: function destroy() {
	    this.setState({
	      destroyed: true
	    });
	  },
	
	  getFormContainer: function getFormContainer() {
	    return document.getElementById('container');
	  },
	
	  render: function render() {
	    if (this.state.destroyed) {
	      return null;
	    }
	    return React.createElement(
	      'div',
	      null,
	      React.createElement(
	        'h2',
	        null,
	        '固定位置'
	      ),
	      React.createElement(
	        'div',
	        null,
	        React.createElement(
	          Upload,
	          props,
	          React.createElement(
	            'a',
	            { href: '#nowhere' },
	            '开始上传'
	          )
	        )
	      ),
	      React.createElement(
	        'h2',
	        null,
	        '滚动'
	      ),
	      React.createElement(
	        'div',
	        { style: { height: 200, overflow: 'auto', border: '1px solid red' } },
	        React.createElement(
	          'div',
	          { style: { height: 500, position: 'relative' } },
	          React.createElement('div', { id: 'container' }),
	          React.createElement(
	            Upload,
	            _extends({}, props, { getFormContainer: this.getFormContainer }),
	            React.createElement(
	              'a',
	              { href: '#nowhere' },
	              '开始上传2'
	            )
	          )
	        )
	      ),
	      React.createElement(
	        'button',
	        { onClick: this.destroy },
	        'destroy'
	      )
	    );
	  }
	});
	
	React.render(React.createElement(Test, null), document.getElementById('__react-content'));

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// do not modify this file
	'use strict';
	
	module.exports = __webpack_require__(4);

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// export this package's api
	'use strict';
	
	module.exports = __webpack_require__(5);

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(2);
	var PropTypes = React.PropTypes;
	var AjaxUpload = __webpack_require__(6);
	var IframeUpload = __webpack_require__(11);
	
	function empty() {}
	
	var Upload = React.createClass({
	  displayName: 'Upload',
	
	  propTypes: {
	    forceAjax: PropTypes.bool,
	    action: PropTypes.string,
	    name: PropTypes.string,
	    multipart: PropTypes.bool,
	    onError: PropTypes.func,
	    onSuccess: PropTypes.func,
	    onProgress: PropTypes.func,
	    onStart: PropTypes.func,
	    data: PropTypes.object,
	    accept: PropTypes.string,
	    multiple: PropTypes.bool
	  },
	
	  getDefaultProps: function getDefaultProps() {
	    return {
	      data: {},
	      name: 'file',
	      forceAjax: false,
	      multipart: false,
	      onProgress: empty,
	      onStart: empty,
	      onError: empty,
	      onSuccess: empty,
	      multiple: false
	    };
	  },
	
	  render: function render() {
	    var props = this.props;
	    // node 渲染根据 ua 强制设置 forceAjax 或者支持FormData的情况使用AjaxUpload
	    if (props.forceAjax || typeof FormData !== 'undefined') {
	      return React.createElement(AjaxUpload, props);
	    }
	
	    return React.createElement(IframeUpload, props);
	  }
	});
	
	module.exports = Upload;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(2);
	var request = __webpack_require__(7);
	var uid = __webpack_require__(10);
	
	var AjaxUploader = React.createClass({
	  displayName: 'AjaxUploader',
	
	  propTypes: {
	    multiple: React.PropTypes.bool,
	    onStart: React.PropTypes.func,
	    data: React.PropTypes.object
	  },
	
	  onChange: function onChange(e) {
	    var files = e.target.files;
	    this.uploadFiles(files);
	  },
	
	  onClick: function onClick() {
	    var el = React.findDOMNode(this.refs.file);
	    if (!el) {
	      return;
	    }
	    el.click();
	    el.value = '';
	  },
	
	  onKeyDown: function onKeyDown(e) {
	    if (e.key === 'Enter') {
	      this.onClick();
	    }
	  },
	
	  onFileDrop: function onFileDrop(e) {
	    if (e.type === 'dragover') {
	      return e.preventDefault();
	    }
	
	    var files = e.dataTransfer.files;
	    this.uploadFiles(files);
	
	    e.preventDefault();
	  },
	
	  render: function render() {
	    var hidden = { display: 'none' };
	    var props = this.props;
	    return React.createElement(
	      'span',
	      { onClick: this.onClick, onKeyDown: this.onKeyDown, onDrop: this.onFileDrop, onDragOver: this.onFileDrop,
	        role: 'button', tabIndex: '0' },
	      React.createElement('input', { type: 'file',
	        ref: 'file',
	        style: hidden,
	        accept: props.accept,
	        multiple: this.props.multiple,
	        onChange: this.onChange }),
	      props.children
	    );
	  },
	
	  uploadFiles: function uploadFiles(files) {
	    var len = files.length;
	    if (len > 0) {
	      for (var i = 0; i < len; i++) {
	        var file = files.item(i);
	        file.uid = uid();
	        this.post(file);
	      }
	      if (this.props.multiple) {
	        this.props.onStart(Array.prototype.slice.call(files));
	      } else {
	        this.props.onStart(Array.prototype.slice.call(files)[0]);
	      }
	    }
	  },
	
	  post: function post(file) {
	    var props = this.props;
	    var req = request.post(props.action).attach(props.name, file, file.name);
	    var data = props.data;
	    if (typeof data === 'function') {
	      data = data();
	    }
	
	    for (var key in data) {
	      if (data.hasOwnProperty(key)) {
	        req.field(key, data[key]);
	      }
	    }
	
	    function progress(e) {
	      props.onProgress(e, file);
	    }
	
	    req.on('progress', progress);
	
	    req.end(function (err, ret) {
	      req.off('progress', progress);
	      if (err || ret.status !== 200) {
	        props.onError(err, ret, file);
	        return;
	      }
	
	      props.onSuccess(ret.body || ret.text, file);
	    });
	  }
	});
	
	module.exports = AjaxUploader;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Module dependencies.
	 */
	
	var Emitter = __webpack_require__(8);
	var reduce = __webpack_require__(9);
	
	/**
	 * Root reference for iframes.
	 */
	
	var root = 'undefined' == typeof window
	  ? (this || self)
	  : window;
	
	/**
	 * Noop.
	 */
	
	function noop(){};
	
	/**
	 * Check if `obj` is a host object,
	 * we don't want to serialize these :)
	 *
	 * TODO: future proof, move to compoent land
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isHost(obj) {
	  var str = {}.toString.call(obj);
	
	  switch (str) {
	    case '[object File]':
	    case '[object Blob]':
	    case '[object FormData]':
	      return true;
	    default:
	      return false;
	  }
	}
	
	/**
	 * Determine XHR.
	 */
	
	request.getXHR = function () {
	  if (root.XMLHttpRequest
	      && (!root.location || 'file:' != root.location.protocol
	          || !root.ActiveXObject)) {
	    return new XMLHttpRequest;
	  } else {
	    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
	    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
	  }
	  return false;
	};
	
	/**
	 * Removes leading and trailing whitespace, added to support IE.
	 *
	 * @param {String} s
	 * @return {String}
	 * @api private
	 */
	
	var trim = ''.trim
	  ? function(s) { return s.trim(); }
	  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };
	
	/**
	 * Check if `obj` is an object.
	 *
	 * @param {Object} obj
	 * @return {Boolean}
	 * @api private
	 */
	
	function isObject(obj) {
	  return obj === Object(obj);
	}
	
	/**
	 * Serialize the given `obj`.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	
	function serialize(obj) {
	  if (!isObject(obj)) return obj;
	  var pairs = [];
	  for (var key in obj) {
	    if (null != obj[key]) {
	      pairs.push(encodeURIComponent(key)
	        + '=' + encodeURIComponent(obj[key]));
	    }
	  }
	  return pairs.join('&');
	}
	
	/**
	 * Expose serialization method.
	 */
	
	 request.serializeObject = serialize;
	
	 /**
	  * Parse the given x-www-form-urlencoded `str`.
	  *
	  * @param {String} str
	  * @return {Object}
	  * @api private
	  */
	
	function parseString(str) {
	  var obj = {};
	  var pairs = str.split('&');
	  var parts;
	  var pair;
	
	  for (var i = 0, len = pairs.length; i < len; ++i) {
	    pair = pairs[i];
	    parts = pair.split('=');
	    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	  }
	
	  return obj;
	}
	
	/**
	 * Expose parser.
	 */
	
	request.parseString = parseString;
	
	/**
	 * Default MIME type map.
	 *
	 *     superagent.types.xml = 'application/xml';
	 *
	 */
	
	request.types = {
	  html: 'text/html',
	  json: 'application/json',
	  xml: 'application/xml',
	  urlencoded: 'application/x-www-form-urlencoded',
	  'form': 'application/x-www-form-urlencoded',
	  'form-data': 'application/x-www-form-urlencoded'
	};
	
	/**
	 * Default serialization map.
	 *
	 *     superagent.serialize['application/xml'] = function(obj){
	 *       return 'generated xml here';
	 *     };
	 *
	 */
	
	 request.serialize = {
	   'application/x-www-form-urlencoded': serialize,
	   'application/json': JSON.stringify
	 };
	
	 /**
	  * Default parsers.
	  *
	  *     superagent.parse['application/xml'] = function(str){
	  *       return { object parsed from str };
	  *     };
	  *
	  */
	
	request.parse = {
	  'application/x-www-form-urlencoded': parseString,
	  'application/json': JSON.parse
	};
	
	/**
	 * Parse the given header `str` into
	 * an object containing the mapped fields.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function parseHeader(str) {
	  var lines = str.split(/\r?\n/);
	  var fields = {};
	  var index;
	  var line;
	  var field;
	  var val;
	
	  lines.pop(); // trailing CRLF
	
	  for (var i = 0, len = lines.length; i < len; ++i) {
	    line = lines[i];
	    index = line.indexOf(':');
	    field = line.slice(0, index).toLowerCase();
	    val = trim(line.slice(index + 1));
	    fields[field] = val;
	  }
	
	  return fields;
	}
	
	/**
	 * Return the mime type for the given `str`.
	 *
	 * @param {String} str
	 * @return {String}
	 * @api private
	 */
	
	function type(str){
	  return str.split(/ *; */).shift();
	};
	
	/**
	 * Return header field parameters.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	
	function params(str){
	  return reduce(str.split(/ *; */), function(obj, str){
	    var parts = str.split(/ *= */)
	      , key = parts.shift()
	      , val = parts.shift();
	
	    if (key && val) obj[key] = val;
	    return obj;
	  }, {});
	};
	
	/**
	 * Initialize a new `Response` with the given `xhr`.
	 *
	 *  - set flags (.ok, .error, etc)
	 *  - parse header
	 *
	 * Examples:
	 *
	 *  Aliasing `superagent` as `request` is nice:
	 *
	 *      request = superagent;
	 *
	 *  We can use the promise-like API, or pass callbacks:
	 *
	 *      request.get('/').end(function(res){});
	 *      request.get('/', function(res){});
	 *
	 *  Sending data can be chained:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' })
	 *        .end(function(res){});
	 *
	 *  Or passed to `.send()`:
	 *
	 *      request
	 *        .post('/user')
	 *        .send({ name: 'tj' }, function(res){});
	 *
	 *  Or passed to `.post()`:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' })
	 *        .end(function(res){});
	 *
	 * Or further reduced to a single call for simple cases:
	 *
	 *      request
	 *        .post('/user', { name: 'tj' }, function(res){});
	 *
	 * @param {XMLHTTPRequest} xhr
	 * @param {Object} options
	 * @api private
	 */
	
	function Response(req, options) {
	  options = options || {};
	  this.req = req;
	  this.xhr = this.req.xhr;
	  // responseText is accessible only if responseType is '' or 'text' and on older browsers
	  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
	     ? this.xhr.responseText
	     : null;
	  this.statusText = this.req.xhr.statusText;
	  this.setStatusProperties(this.xhr.status);
	  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	  // getResponseHeader still works. so we get content-type even if getting
	  // other headers fails.
	  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	  this.setHeaderProperties(this.header);
	  this.body = this.req.method != 'HEAD'
	    ? this.parseBody(this.text ? this.text : this.xhr.response)
	    : null;
	}
	
	/**
	 * Get case-insensitive `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api public
	 */
	
	Response.prototype.get = function(field){
	  return this.header[field.toLowerCase()];
	};
	
	/**
	 * Set header related properties:
	 *
	 *   - `.type` the content type without params
	 *
	 * A response of "Content-Type: text/plain; charset=utf-8"
	 * will provide you with a `.type` of "text/plain".
	 *
	 * @param {Object} header
	 * @api private
	 */
	
	Response.prototype.setHeaderProperties = function(header){
	  // content-type
	  var ct = this.header['content-type'] || '';
	  this.type = type(ct);
	
	  // params
	  var obj = params(ct);
	  for (var key in obj) this[key] = obj[key];
	};
	
	/**
	 * Parse the given body `str`.
	 *
	 * Used for auto-parsing of bodies. Parsers
	 * are defined on the `superagent.parse` object.
	 *
	 * @param {String} str
	 * @return {Mixed}
	 * @api private
	 */
	
	Response.prototype.parseBody = function(str){
	  var parse = request.parse[this.type];
	  return parse && str && (str.length || str instanceof Object)
	    ? parse(str)
	    : null;
	};
	
	/**
	 * Set flags such as `.ok` based on `status`.
	 *
	 * For example a 2xx response will give you a `.ok` of __true__
	 * whereas 5xx will be __false__ and `.error` will be __true__. The
	 * `.clientError` and `.serverError` are also available to be more
	 * specific, and `.statusType` is the class of error ranging from 1..5
	 * sometimes useful for mapping respond colors etc.
	 *
	 * "sugar" properties are also defined for common cases. Currently providing:
	 *
	 *   - .noContent
	 *   - .badRequest
	 *   - .unauthorized
	 *   - .notAcceptable
	 *   - .notFound
	 *
	 * @param {Number} status
	 * @api private
	 */
	
	Response.prototype.setStatusProperties = function(status){
	  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
	  if (status === 1223) {
	    status = 204;
	  }
	
	  var type = status / 100 | 0;
	
	  // status / class
	  this.status = status;
	  this.statusType = type;
	
	  // basics
	  this.info = 1 == type;
	  this.ok = 2 == type;
	  this.clientError = 4 == type;
	  this.serverError = 5 == type;
	  this.error = (4 == type || 5 == type)
	    ? this.toError()
	    : false;
	
	  // sugar
	  this.accepted = 202 == status;
	  this.noContent = 204 == status;
	  this.badRequest = 400 == status;
	  this.unauthorized = 401 == status;
	  this.notAcceptable = 406 == status;
	  this.notFound = 404 == status;
	  this.forbidden = 403 == status;
	};
	
	/**
	 * Return an `Error` representative of this response.
	 *
	 * @return {Error}
	 * @api public
	 */
	
	Response.prototype.toError = function(){
	  var req = this.req;
	  var method = req.method;
	  var url = req.url;
	
	  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	  var err = new Error(msg);
	  err.status = this.status;
	  err.method = method;
	  err.url = url;
	
	  return err;
	};
	
	/**
	 * Expose `Response`.
	 */
	
	request.Response = Response;
	
	/**
	 * Initialize a new `Request` with the given `method` and `url`.
	 *
	 * @param {String} method
	 * @param {String} url
	 * @api public
	 */
	
	function Request(method, url) {
	  var self = this;
	  Emitter.call(this);
	  this._query = this._query || [];
	  this.method = method;
	  this.url = url;
	  this.header = {};
	  this._header = {};
	  this.on('end', function(){
	    var err = null;
	    var res = null;
	
	    try {
	      res = new Response(self);
	    } catch(e) {
	      err = new Error('Parser is unable to parse the response');
	      err.parse = true;
	      err.original = e;
	      return self.callback(err);
	    }
	
	    self.emit('response', res);
	
	    if (err) {
	      return self.callback(err, res);
	    }
	
	    if (res.status >= 200 && res.status < 300) {
	      return self.callback(err, res);
	    }
	
	    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
	    new_err.original = err;
	    new_err.response = res;
	    new_err.status = res.status;
	
	    self.callback(err || new_err, res);
	  });
	}
	
	/**
	 * Mixin `Emitter`.
	 */
	
	Emitter(Request.prototype);
	
	/**
	 * Allow for extension
	 */
	
	Request.prototype.use = function(fn) {
	  fn(this);
	  return this;
	}
	
	/**
	 * Set timeout to `ms`.
	 *
	 * @param {Number} ms
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.timeout = function(ms){
	  this._timeout = ms;
	  return this;
	};
	
	/**
	 * Clear previous timeout.
	 *
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.clearTimeout = function(){
	  this._timeout = 0;
	  clearTimeout(this._timer);
	  return this;
	};
	
	/**
	 * Abort the request, and clear potential timeout.
	 *
	 * @return {Request}
	 * @api public
	 */
	
	Request.prototype.abort = function(){
	  if (this.aborted) return;
	  this.aborted = true;
	  this.xhr.abort();
	  this.clearTimeout();
	  this.emit('abort');
	  return this;
	};
	
	/**
	 * Set header `field` to `val`, or multiple fields with one object.
	 *
	 * Examples:
	 *
	 *      req.get('/')
	 *        .set('Accept', 'application/json')
	 *        .set('X-API-Key', 'foobar')
	 *        .end(callback);
	 *
	 *      req.get('/')
	 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
	 *        .end(callback);
	 *
	 * @param {String|Object} field
	 * @param {String} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.set = function(field, val){
	  if (isObject(field)) {
	    for (var key in field) {
	      this.set(key, field[key]);
	    }
	    return this;
	  }
	  this._header[field.toLowerCase()] = val;
	  this.header[field] = val;
	  return this;
	};
	
	/**
	 * Remove header `field`.
	 *
	 * Example:
	 *
	 *      req.get('/')
	 *        .unset('User-Agent')
	 *        .end(callback);
	 *
	 * @param {String} field
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.unset = function(field){
	  delete this._header[field.toLowerCase()];
	  delete this.header[field];
	  return this;
	};
	
	/**
	 * Get case-insensitive header `field` value.
	 *
	 * @param {String} field
	 * @return {String}
	 * @api private
	 */
	
	Request.prototype.getHeader = function(field){
	  return this._header[field.toLowerCase()];
	};
	
	/**
	 * Set Content-Type to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.xml = 'application/xml';
	 *
	 *      request.post('/')
	 *        .type('xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 *      request.post('/')
	 *        .type('application/xml')
	 *        .send(xmlstring)
	 *        .end(callback);
	 *
	 * @param {String} type
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.type = function(type){
	  this.set('Content-Type', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Accept to `type`, mapping values from `request.types`.
	 *
	 * Examples:
	 *
	 *      superagent.types.json = 'application/json';
	 *
	 *      request.get('/agent')
	 *        .accept('json')
	 *        .end(callback);
	 *
	 *      request.get('/agent')
	 *        .accept('application/json')
	 *        .end(callback);
	 *
	 * @param {String} accept
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.accept = function(type){
	  this.set('Accept', request.types[type] || type);
	  return this;
	};
	
	/**
	 * Set Authorization field value with `user` and `pass`.
	 *
	 * @param {String} user
	 * @param {String} pass
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.auth = function(user, pass){
	  var str = btoa(user + ':' + pass);
	  this.set('Authorization', 'Basic ' + str);
	  return this;
	};
	
	/**
	* Add query-string `val`.
	*
	* Examples:
	*
	*   request.get('/shoes')
	*     .query('size=10')
	*     .query({ color: 'blue' })
	*
	* @param {Object|String} val
	* @return {Request} for chaining
	* @api public
	*/
	
	Request.prototype.query = function(val){
	  if ('string' != typeof val) val = serialize(val);
	  if (val) this._query.push(val);
	  return this;
	};
	
	/**
	 * Write the field `name` and `val` for "multipart/form-data"
	 * request bodies.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .field('foo', 'bar')
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} name
	 * @param {String|Blob|File} val
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.field = function(name, val){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(name, val);
	  return this;
	};
	
	/**
	 * Queue the given `file` as an attachment to the specified `field`,
	 * with optional `filename`.
	 *
	 * ``` js
	 * request.post('/upload')
	 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
	 *   .end(callback);
	 * ```
	 *
	 * @param {String} field
	 * @param {Blob|File} file
	 * @param {String} filename
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.attach = function(field, file, filename){
	  if (!this._formData) this._formData = new root.FormData();
	  this._formData.append(field, file, filename);
	  return this;
	};
	
	/**
	 * Send `data`, defaulting the `.type()` to "json" when
	 * an object is given.
	 *
	 * Examples:
	 *
	 *       // querystring
	 *       request.get('/search')
	 *         .end(callback)
	 *
	 *       // multiple data "writes"
	 *       request.get('/search')
	 *         .send({ search: 'query' })
	 *         .send({ range: '1..5' })
	 *         .send({ order: 'desc' })
	 *         .end(callback)
	 *
	 *       // manual json
	 *       request.post('/user')
	 *         .type('json')
	 *         .send('{"name":"tj"})
	 *         .end(callback)
	 *
	 *       // auto json
	 *       request.post('/user')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // manual x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send('name=tj')
	 *         .end(callback)
	 *
	 *       // auto x-www-form-urlencoded
	 *       request.post('/user')
	 *         .type('form')
	 *         .send({ name: 'tj' })
	 *         .end(callback)
	 *
	 *       // defaults to x-www-form-urlencoded
	  *      request.post('/user')
	  *        .send('name=tobi')
	  *        .send('species=ferret')
	  *        .end(callback)
	 *
	 * @param {String|Object} data
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.send = function(data){
	  var obj = isObject(data);
	  var type = this.getHeader('Content-Type');
	
	  // merge
	  if (obj && isObject(this._data)) {
	    for (var key in data) {
	      this._data[key] = data[key];
	    }
	  } else if ('string' == typeof data) {
	    if (!type) this.type('form');
	    type = this.getHeader('Content-Type');
	    if ('application/x-www-form-urlencoded' == type) {
	      this._data = this._data
	        ? this._data + '&' + data
	        : data;
	    } else {
	      this._data = (this._data || '') + data;
	    }
	  } else {
	    this._data = data;
	  }
	
	  if (!obj || isHost(data)) return this;
	  if (!type) this.type('json');
	  return this;
	};
	
	/**
	 * Invoke the callback with `err` and `res`
	 * and handle arity check.
	 *
	 * @param {Error} err
	 * @param {Response} res
	 * @api private
	 */
	
	Request.prototype.callback = function(err, res){
	  var fn = this._callback;
	  this.clearTimeout();
	  fn(err, res);
	};
	
	/**
	 * Invoke callback with x-domain error.
	 *
	 * @api private
	 */
	
	Request.prototype.crossDomainError = function(){
	  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
	  err.crossDomain = true;
	  this.callback(err);
	};
	
	/**
	 * Invoke callback with timeout error.
	 *
	 * @api private
	 */
	
	Request.prototype.timeoutError = function(){
	  var timeout = this._timeout;
	  var err = new Error('timeout of ' + timeout + 'ms exceeded');
	  err.timeout = timeout;
	  this.callback(err);
	};
	
	/**
	 * Enable transmission of cookies with x-domain requests.
	 *
	 * Note that for this to work the origin must not be
	 * using "Access-Control-Allow-Origin" with a wildcard,
	 * and also must set "Access-Control-Allow-Credentials"
	 * to "true".
	 *
	 * @api public
	 */
	
	Request.prototype.withCredentials = function(){
	  this._withCredentials = true;
	  return this;
	};
	
	/**
	 * Initiate request, invoking callback `fn(res)`
	 * with an instanceof `Response`.
	 *
	 * @param {Function} fn
	 * @return {Request} for chaining
	 * @api public
	 */
	
	Request.prototype.end = function(fn){
	  var self = this;
	  var xhr = this.xhr = request.getXHR();
	  var query = this._query.join('&');
	  var timeout = this._timeout;
	  var data = this._formData || this._data;
	
	  // store callback
	  this._callback = fn || noop;
	
	  // state change
	  xhr.onreadystatechange = function(){
	    if (4 != xhr.readyState) return;
	
	    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
	    // result in the error "Could not complete the operation due to error c00c023f"
	    var status;
	    try { status = xhr.status } catch(e) { status = 0; }
	
	    if (0 == status) {
	      if (self.timedout) return self.timeoutError();
	      if (self.aborted) return;
	      return self.crossDomainError();
	    }
	    self.emit('end');
	  };
	
	  // progress
	  var handleProgress = function(e){
	    if (e.total > 0) {
	      e.percent = e.loaded / e.total * 100;
	    }
	    self.emit('progress', e);
	  };
	  if (this.hasListeners('progress')) {
	    xhr.onprogress = handleProgress;
	  }
	  try {
	    if (xhr.upload && this.hasListeners('progress')) {
	      xhr.upload.onprogress = handleProgress;
	    }
	  } catch(e) {
	    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
	    // Reported here:
	    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
	  }
	
	  // timeout
	  if (timeout && !this._timer) {
	    this._timer = setTimeout(function(){
	      self.timedout = true;
	      self.abort();
	    }, timeout);
	  }
	
	  // querystring
	  if (query) {
	    query = request.serializeObject(query);
	    this.url += ~this.url.indexOf('?')
	      ? '&' + query
	      : '?' + query;
	  }
	
	  // initiate request
	  xhr.open(this.method, this.url, true);
	
	  // CORS
	  if (this._withCredentials) xhr.withCredentials = true;
	
	  // body
	  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
	    // serialize stuff
	    var serialize = request.serialize[this.getHeader('Content-Type')];
	    if (serialize) data = serialize(data);
	  }
	
	  // set header fields
	  for (var field in this.header) {
	    if (null == this.header[field]) continue;
	    xhr.setRequestHeader(field, this.header[field]);
	  }
	
	  // send stuff
	  this.emit('request', this);
	  xhr.send(data);
	  return this;
	};
	
	/**
	 * Expose `Request`.
	 */
	
	request.Request = Request;
	
	/**
	 * Issue a request:
	 *
	 * Examples:
	 *
	 *    request('GET', '/users').end(callback)
	 *    request('/users').end(callback)
	 *    request('/users', callback)
	 *
	 * @param {String} method
	 * @param {String|Function} url or callback
	 * @return {Request}
	 * @api public
	 */
	
	function request(method, url) {
	  // callback
	  if ('function' == typeof url) {
	    return new Request('GET', method).end(url);
	  }
	
	  // url first
	  if (1 == arguments.length) {
	    return new Request('GET', method);
	  }
	
	  return new Request(method, url);
	}
	
	/**
	 * GET `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.get = function(url, data, fn){
	  var req = request('GET', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.query(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * HEAD `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.head = function(url, data, fn){
	  var req = request('HEAD', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * DELETE `url` with optional callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.del = function(url, fn){
	  var req = request('DELETE', url);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PATCH `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.patch = function(url, data, fn){
	  var req = request('PATCH', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * POST `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed} data
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.post = function(url, data, fn){
	  var req = request('POST', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * PUT `url` with optional `data` and callback `fn(res)`.
	 *
	 * @param {String} url
	 * @param {Mixed|Function} data or fn
	 * @param {Function} fn
	 * @return {Request}
	 * @api public
	 */
	
	request.put = function(url, data, fn){
	  var req = request('PUT', url);
	  if ('function' == typeof data) fn = data, data = null;
	  if (data) req.send(data);
	  if (fn) req.end(fn);
	  return req;
	};
	
	/**
	 * Expose `request`.
	 */
	
	module.exports = request;


/***/ },
/* 8 */
/***/ function(module, exports) {

	
	/**
	 * Expose `Emitter`.
	 */
	
	module.exports = Emitter;
	
	/**
	 * Initialize a new `Emitter`.
	 *
	 * @api public
	 */
	
	function Emitter(obj) {
	  if (obj) return mixin(obj);
	};
	
	/**
	 * Mixin the emitter properties.
	 *
	 * @param {Object} obj
	 * @return {Object}
	 * @api private
	 */
	
	function mixin(obj) {
	  for (var key in Emitter.prototype) {
	    obj[key] = Emitter.prototype[key];
	  }
	  return obj;
	}
	
	/**
	 * Listen on the given `event` with `fn`.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.on =
	Emitter.prototype.addEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	  (this._callbacks[event] = this._callbacks[event] || [])
	    .push(fn);
	  return this;
	};
	
	/**
	 * Adds an `event` listener that will be invoked a single
	 * time then automatically removed.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.once = function(event, fn){
	  var self = this;
	  this._callbacks = this._callbacks || {};
	
	  function on() {
	    self.off(event, on);
	    fn.apply(this, arguments);
	  }
	
	  on.fn = fn;
	  this.on(event, on);
	  return this;
	};
	
	/**
	 * Remove the given callback for `event` or all
	 * registered callbacks.
	 *
	 * @param {String} event
	 * @param {Function} fn
	 * @return {Emitter}
	 * @api public
	 */
	
	Emitter.prototype.off =
	Emitter.prototype.removeListener =
	Emitter.prototype.removeAllListeners =
	Emitter.prototype.removeEventListener = function(event, fn){
	  this._callbacks = this._callbacks || {};
	
	  // all
	  if (0 == arguments.length) {
	    this._callbacks = {};
	    return this;
	  }
	
	  // specific event
	  var callbacks = this._callbacks[event];
	  if (!callbacks) return this;
	
	  // remove all handlers
	  if (1 == arguments.length) {
	    delete this._callbacks[event];
	    return this;
	  }
	
	  // remove specific handler
	  var cb;
	  for (var i = 0; i < callbacks.length; i++) {
	    cb = callbacks[i];
	    if (cb === fn || cb.fn === fn) {
	      callbacks.splice(i, 1);
	      break;
	    }
	  }
	  return this;
	};
	
	/**
	 * Emit `event` with the given args.
	 *
	 * @param {String} event
	 * @param {Mixed} ...
	 * @return {Emitter}
	 */
	
	Emitter.prototype.emit = function(event){
	  this._callbacks = this._callbacks || {};
	  var args = [].slice.call(arguments, 1)
	    , callbacks = this._callbacks[event];
	
	  if (callbacks) {
	    callbacks = callbacks.slice(0);
	    for (var i = 0, len = callbacks.length; i < len; ++i) {
	      callbacks[i].apply(this, args);
	    }
	  }
	
	  return this;
	};
	
	/**
	 * Return array of callbacks for `event`.
	 *
	 * @param {String} event
	 * @return {Array}
	 * @api public
	 */
	
	Emitter.prototype.listeners = function(event){
	  this._callbacks = this._callbacks || {};
	  return this._callbacks[event] || [];
	};
	
	/**
	 * Check if this emitter has `event` handlers.
	 *
	 * @param {String} event
	 * @return {Boolean}
	 * @api public
	 */
	
	Emitter.prototype.hasListeners = function(event){
	  return !! this.listeners(event).length;
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	
	/**
	 * Reduce `arr` with `fn`.
	 *
	 * @param {Array} arr
	 * @param {Function} fn
	 * @param {Mixed} initial
	 *
	 * TODO: combatible error handling?
	 */
	
	module.exports = function(arr, fn, initial){  
	  var idx = 0;
	  var len = arr.length;
	  var curr = arguments.length == 3
	    ? initial
	    : arr[idx++];
	
	  while (idx < len) {
	    curr = fn.call(null, curr, arr[idx], ++idx, arr);
	  }
	  
	  return curr;
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	var now = +new Date();
	var index = 0;
	
	module.exports = function uid() {
	  return 'rc-upload-' + now + '-' + ++index;
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(2);
	var uid = __webpack_require__(10);
	var Align = __webpack_require__(12);
	
	var IframeUploader = React.createClass({
	  displayName: 'IframeUploader',
	
	  propTypes: {
	    onStart: React.PropTypes.func,
	    getFormContainer: React.PropTypes.func,
	    children: React.PropTypes.any,
	    formZIndex: React.PropTypes.number,
	    data: React.PropTypes.object
	  },
	
	  getInitialState: function getInitialState() {
	    return {
	      uid: 1,
	      loading: false
	    };
	  },
	
	  getFormContainer: function getFormContainer() {
	    var props = this.props;
	    if (props.getFormContainer) {
	      return props.getFormContainer();
	    }
	    if (this.formContainer) {
	      return this.formContainer;
	    }
	    this.formContainer = document.createElement('div');
	    document.body.appendChild(this.formContainer);
	    return this.formContainer;
	  },
	
	  getFormElement: function getFormElement() {
	    var props = this.props;
	    var trigger = React.findDOMNode(this);
	    var width = trigger.offsetWidth;
	    var height = trigger.offsetHeight;
	    var iframeName = this.getIframeName();
	    var iframe = this.getIframe();
	    var cursor = this.state.loading ? 'default' : 'pointer';
	    var formStyle = {
	      position: 'absolute',
	      overflow: 'hidden',
	      width: width,
	      height: height,
	      cursor: cursor,
	      opacity: 0,
	      filter: 'alpha(opacity=0)',
	      zIndex: props.formZIndex
	    };
	    var inputStyle = {
	      position: 'absolute',
	      top: 0,
	      right: 0,
	      opacity: 0,
	      filter: 'alpha(opacity=0)',
	      outline: 0,
	      cursor: cursor,
	      height: height,
	      fontSize: Math.max(64, height * 5)
	    };
	    return React.createElement(
	      Align,
	      { monitorWindowResize: true, align: {
	          points: ['tl', 'tl']
	        }, target: this.getDOMNode },
	      React.createElement(
	        'form',
	        { action: props.action,
	          target: iframeName,
	          encType: 'multipart/form-data',
	          method: 'post', style: formStyle },
	        React.createElement('input', { type: 'file',
	          name: props.name,
	          disabled: this.state.loading,
	          hideFocus: 'true',
	          style: inputStyle,
	          accept: props.accept,
	          onChange: this.onChange
	        }),
	        React.createElement('span', null),
	        iframe
	      )
	    );
	  },
	
	  clearRenderTimeout: function clearRenderTimeout() {
	    if (this.timeout) {
	      clearTimeout(this.timeout);
	      this.timeout = null;
	    }
	  },
	
	  delayRender: function delayRender() {
	    var _this = this;
	
	    this.clearRenderTimeout();
	    // hack to wait layout update
	    this.timeout = setTimeout(function () {
	      var component = _this;
	      React.render(_this.getFormElement(), _this.getFormContainer(), function save() {
	        component.formInstance = this;
	      });
	    }, 0);
	  },
	
	  componentDidMount: function componentDidMount() {
	    this.delayRender();
	  },
	
	  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
	    if (prevState.uid !== this.state.uid || prevState.loading !== this.state.loading) {
	      this.delayRender();
	    }
	  },
	
	  componentWillUnmount: function componentWillUnmount() {
	    this.clearRenderTimeout();
	    if (this.formContainer) {
	      React.unmountComponentAtNode(this.formContainer);
	      document.body.removeChild(this.formContainer);
	      this.formContainer = null;
	    } else if (this.getFormContainer) {
	      React.unmountComponentAtNode(this.getFormContainer());
	    }
	  },
	
	  onLoad: function onLoad(e) {
	    // ie8里面render方法会执行onLoad，应该是bug
	    if (!this.state.loading || !this.file) {
	      return;
	    }
	
	    var iframe = e.target;
	    var props = this.props;
	    var response = undefined;
	    try {
	      response = iframe.contentDocument.body.innerHTML;
	      props.onSuccess(response, this.file);
	    } catch (err) {
	      response = 'cross-domain';
	      props.onError(err, null, this.file);
	    }
	
	    this.file = null;
	
	    React.findDOMNode(this.formInstance).reset();
	
	    this.setState({
	      uid: this.state.uid + 1,
	      loading: false
	    });
	  },
	
	  onChange: function onChange(e) {
	    this.setState({
	      loading: true
	    });
	    this.file = e.target.files && e.target.files[0] || e.target;
	    // ie8/9 don't support FileList Object
	    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
	    try {
	      this.file.name = this.file.name || e.target.value;
	      this.file.uid = uid();
	    } catch (ex) {
	      if (typeof console !== 'undefined') {
	        console.error(ex);
	      }
	    }
	    this.props.onStart(this.file);
	    var formNode = React.findDOMNode(this.formInstance);
	    var dataSpan = formNode.childNodes[1];
	    var data = this.props.data;
	    if (typeof data === 'function') {
	      data = data();
	    }
	    var inputs = [];
	    for (var key in data) {
	      if (data.hasOwnProperty(key)) {
	        inputs.push('<input name="' + key + '" value="' + data[key] + '"/>');
	      }
	    }
	    dataSpan.innerHTML = inputs.join('');
	    formNode.submit();
	    dataSpan.innerHTML = '';
	  },
	
	  getIframe: function getIframe() {
	    var name = this.getIframeName();
	    return React.createElement('iframe', {
	      key: name,
	      onLoad: this.onLoad,
	      style: { display: 'none' },
	      name: name });
	  },
	
	  getIframeName: function getIframeName() {
	    return 'iframe_uploader_' + this.state.uid;
	  },
	
	  render: function render() {
	    return this.props.children;
	  }
	});
	
	module.exports = IframeUploader;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	// export this package's api
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _Align = __webpack_require__(13);
	
	var _Align2 = _interopRequireDefault(_Align);
	
	exports['default'] = _Align2['default'];
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _domAlign = __webpack_require__(14);
	
	var _domAlign2 = _interopRequireDefault(_domAlign);
	
	var _rcUtil = __webpack_require__(16);
	
	var _rcUtil2 = _interopRequireDefault(_rcUtil);
	
	function isWindow(obj) {
	  /*eslint-disable eqeqeq */
	  return obj != null && obj == obj.window;
	  /*eslint-enable eqeqeq */
	}
	
	function buffer(fn, ms) {
	  var timer;
	  return function () {
	    if (timer) {
	      clearTimeout(timer);
	    }
	    timer = setTimeout(fn, ms);
	  };
	}
	
	var Align = (function (_React$Component) {
	  _inherits(Align, _React$Component);
	
	  function Align(props) {
	    _classCallCheck(this, Align);
	
	    _get(Object.getPrototypeOf(Align.prototype), 'constructor', this).apply(this, arguments);
	    this.handleWindowResize = this.handleWindowResize.bind(this);
	  }
	
	  _createClass(Align, [{
	    key: 'componentDidMount',
	    value: function componentDidMount() {
	      var props = this.props;
	      // if parent ref not attached .... use document.getElementById
	      if (!props.disabled) {
	        var source = _react2['default'].findDOMNode(this);
	        props.onAlign(source, (0, _domAlign2['default'])(source, props.target(), props.align));
	        if (props.monitorWindowResize) {
	          this.startMonitorWindowResize();
	        }
	      }
	    }
	  }, {
	    key: 'startMonitorWindowResize',
	    value: function startMonitorWindowResize() {
	      if (!this.resizeHandler) {
	        this.resizeHandler = _rcUtil2['default'].Dom.addEventListener(window, 'resize', buffer(this.handleWindowResize, this.props.monitorBufferTime));
	      }
	    }
	  }, {
	    key: 'stopMonitorWindowResize',
	    value: function stopMonitorWindowResize() {
	      if (this.resizeHandler) {
	        this.resizeHandler.remove();
	        this.resizeHandler = null;
	      }
	    }
	  }, {
	    key: 'handleWindowResize',
	    value: function handleWindowResize() {
	      var props = this.props;
	      if (!props.disabled) {
	        var source = _react2['default'].findDOMNode(this);
	        props.onAlign(source, (0, _domAlign2['default'])(source, props.target(), props.align));
	      }
	    }
	  }, {
	    key: 'componentWillUnmount',
	    value: function componentWillUnmount() {
	      this.stopMonitorWindowResize();
	    }
	  }, {
	    key: 'componentDidUpdate',
	    value: function componentDidUpdate(prevProps) {
	      var reAlign = false;
	      var props = this.props;
	      var currentTarget;
	
	      if (!props.disabled) {
	        if (prevProps.disabled || prevProps.align !== props.align) {
	          reAlign = true;
	          currentTarget = props.target();
	        } else {
	          var lastTarget = prevProps.target();
	          currentTarget = props.target();
	          if (isWindow(lastTarget) && isWindow(currentTarget)) {
	            reAlign = false;
	          } else if (lastTarget !== currentTarget) {
	            reAlign = true;
	          }
	        }
	      }
	
	      if (reAlign) {
	        var source = _react2['default'].findDOMNode(this);
	        props.onAlign(source, (0, _domAlign2['default'])(source, currentTarget, props.align));
	      }
	
	      if (props.monitorWindowResize && !props.disabled) {
	        this.startMonitorWindowResize();
	      } else {
	        this.stopMonitorWindowResize();
	      }
	    }
	  }, {
	    key: 'render',
	    value: function render() {
	      return _react2['default'].Children.only(this.props.children);
	    }
	  }]);
	
	  return Align;
	})(_react2['default'].Component);
	
	Align.defaultProps = {
	  target: function target() {
	    return window;
	  },
	  onAlign: function onAlign() {},
	  monitorBufferTime: 50,
	  monitorWindowResize: false,
	  disabled: false
	};
	
	Align.PropTypes = {
	  align: _react2['default'].PropTypes.object.isRequired,
	  target: _react2['default'].PropTypes.func,
	  onAlign: _react2['default'].PropTypes.func,
	  monitorBufferTime: _react2['default'].PropTypes.number,
	  monitorWindowResize: _react2['default'].PropTypes.bool,
	  disabled: _react2['default'].PropTypes.bool
	};
	
	exports['default'] = Align;
	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * align dom node flexibly
	 * @author yiminghe@gmail.com
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _utils = __webpack_require__(15);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	// http://yiminghe.iteye.com/blog/1124720
	
	/**
	 * 获取 node 上的 align 对齐点 相对于页面的坐标
	 */
	
	function getAlignOffset(region, align) {
	  var V = align.charAt(0);
	  var H = align.charAt(1);
	  var w = region.width;
	  var h = region.height;
	  var x = undefined;
	  var y = undefined;
	
	  x = region.left;
	  y = region.top;
	
	  if (V === 'c') {
	    y += h / 2;
	  } else if (V === 'b') {
	    y += h;
	  }
	
	  if (H === 'c') {
	    x += w / 2;
	  } else if (H === 'r') {
	    x += w;
	  }
	
	  return {
	    left: x,
	    top: y
	  };
	}
	
	/**
	 * 得到会导致元素显示不全的祖先元素
	 */
	
	function getOffsetParent(element) {
	  // ie 这个也不是完全可行
	  /*
	   <div style="width: 50px;height: 100px;overflow: hidden">
	   <div style="width: 50px;height: 100px;position: relative;" id="d6">
	   元素 6 高 100px 宽 50px<br/>
	   </div>
	   </div>
	   */
	  // element.offsetParent does the right thing in ie7 and below. Return parent with layout!
	  //  In other browsers it only includes elements with position absolute, relative or
	  // fixed, not elements with overflow set to auto or scroll.
	  //        if (UA.ie && ieMode < 8) {
	  //            return element.offsetParent;
	  //        }
	  // 统一的 offsetParent 方法
	  var doc = element.ownerDocument;
	  var body = doc.body;
	  var parent = undefined;
	  var positionStyle = _utils2['default'].css(element, 'position');
	  var skipStatic = positionStyle === 'fixed' || positionStyle === 'absolute';
	
	  if (!skipStatic) {
	    return element.nodeName.toLowerCase() === 'html' ? null : element.parentNode;
	  }
	
	  for (parent = element.parentNode; parent && parent !== body; parent = parent.parentNode) {
	    positionStyle = _utils2['default'].css(parent, 'position');
	    if (positionStyle !== 'static') {
	      return parent;
	    }
	  }
	  return null;
	}
	
	/**
	 * 获得元素的显示部分的区域
	 */
	
	function getVisibleRectForElement(element) {
	  var visibleRect = {
	    left: 0,
	    right: Infinity,
	    top: 0,
	    bottom: Infinity
	  };
	  var el = element;
	  var scrollX = undefined;
	  var scrollY = undefined;
	  var winSize = undefined;
	  var doc = element.ownerDocument;
	  var win = doc.defaultView || doc.parentWindow;
	  var body = doc.body;
	  var documentElement = doc.documentElement;
	
	  // Determine the size of the visible rect by climbing the dom accounting for
	  // all scrollable containers.
	  while (el) {
	    // clientWidth is zero for inline block elements in ie.
	    if ((navigator.userAgent.indexOf('MSIE') === -1 || el.clientWidth !== 0) && (
	    // body may have overflow set on it, yet we still get the entire
	    // viewport. In some browsers, el.offsetParent may be
	    // document.documentElement, so check for that too.
	    el !== body && el !== documentElement && _utils2['default'].css(el, 'overflow') !== 'visible')) {
	      var pos = _utils2['default'].offset(el);
	      // add border
	      pos.left += el.clientLeft;
	      pos.top += el.clientTop;
	      visibleRect.top = Math.max(visibleRect.top, pos.top);
	      visibleRect.right = Math.min(visibleRect.right,
	      // consider area without scrollBar
	      pos.left + el.clientWidth);
	      visibleRect.bottom = Math.min(visibleRect.bottom, pos.top + el.clientHeight);
	      visibleRect.left = Math.max(visibleRect.left, pos.left);
	    } else if (el === body || el === documentElement) {
	      break;
	    }
	    el = getOffsetParent(el);
	  }
	
	  // Clip by window's viewport.
	  scrollX = _utils2['default'].getWindowScrollLeft(win);
	  scrollY = _utils2['default'].getWindowScrollTop(win);
	  visibleRect.left = Math.max(visibleRect.left, scrollX);
	  visibleRect.top = Math.max(visibleRect.top, scrollY);
	  winSize = {
	    width: _utils2['default'].viewportWidth(win),
	    height: _utils2['default'].viewportHeight(win)
	  };
	  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
	  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
	  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null;
	}
	
	function getElFuturePos(elRegion, refNodeRegion, points, offset) {
	  var xy = undefined;
	  var diff = undefined;
	  var p1 = undefined;
	  var p2 = undefined;
	
	  xy = {
	    left: elRegion.left,
	    top: elRegion.top
	  };
	
	  p1 = getAlignOffset(refNodeRegion, points[1]);
	  p2 = getAlignOffset(elRegion, points[0]);
	
	  diff = [p2.left - p1.left, p2.top - p1.top];
	
	  return {
	    left: xy.left - diff[0] + +offset[0],
	    top: xy.top - diff[1] + +offset[1]
	  };
	}
	
	function isFailX(elFuturePos, elRegion, visibleRect) {
	  return elFuturePos.left < visibleRect.left || elFuturePos.left + elRegion.width > visibleRect.right;
	}
	
	function isFailY(elFuturePos, elRegion, visibleRect) {
	  return elFuturePos.top < visibleRect.top || elFuturePos.top + elRegion.height > visibleRect.bottom;
	}
	
	function adjustForViewport(elFuturePos, elRegion, visibleRect, overflow) {
	  var pos = _utils2['default'].clone(elFuturePos);
	  var size = {
	    width: elRegion.width,
	    height: elRegion.height
	  };
	
	  if (overflow.adjustX && pos.left < visibleRect.left) {
	    pos.left = visibleRect.left;
	  }
	
	  // Left edge inside and right edge outside viewport, try to resize it.
	  if (overflow.resizeWidth && pos.left >= visibleRect.left && pos.left + size.width > visibleRect.right) {
	    size.width -= pos.left + size.width - visibleRect.right;
	  }
	
	  // Right edge outside viewport, try to move it.
	  if (overflow.adjustX && pos.left + size.width > visibleRect.right) {
	    // 保证左边界和可视区域左边界对齐
	    pos.left = Math.max(visibleRect.right - size.width, visibleRect.left);
	  }
	
	  // Top edge outside viewport, try to move it.
	  if (overflow.adjustY && pos.top < visibleRect.top) {
	    pos.top = visibleRect.top;
	  }
	
	  // Top edge inside and bottom edge outside viewport, try to resize it.
	  if (overflow.resizeHeight && pos.top >= visibleRect.top && pos.top + size.height > visibleRect.bottom) {
	    size.height -= pos.top + size.height - visibleRect.bottom;
	  }
	
	  // Bottom edge outside viewport, try to move it.
	  if (overflow.adjustY && pos.top + size.height > visibleRect.bottom) {
	    // 保证上边界和可视区域上边界对齐
	    pos.top = Math.max(visibleRect.bottom - size.height, visibleRect.top);
	  }
	
	  return _utils2['default'].mix(pos, size);
	}
	
	function flip(points, reg, map) {
	  var ret = [];
	  _utils2['default'].each(points, function (p) {
	    ret.push(p.replace(reg, function (m) {
	      return map[m];
	    }));
	  });
	  return ret;
	}
	
	function flipOffset(offset, index) {
	  offset[index] = -offset[index];
	  return offset;
	}
	
	function getRegion(node) {
	  var offset = undefined;
	  var w = undefined;
	  var h = undefined;
	  if (!_utils2['default'].isWindow(node) && node.nodeType !== 9) {
	    offset = _utils2['default'].offset(node);
	    w = _utils2['default'].outerWidth(node);
	    h = _utils2['default'].outerHeight(node);
	  } else {
	    var win = _utils2['default'].getWindow(node);
	    offset = {
	      left: _utils2['default'].getWindowScrollLeft(win),
	      top: _utils2['default'].getWindowScrollTop(win)
	    };
	    w = _utils2['default'].viewportWidth(win);
	    h = _utils2['default'].viewportHeight(win);
	  }
	  offset.width = w;
	  offset.height = h;
	  return offset;
	}
	
	/*
	 * align node
	 * @param {Element} node current dom node
	 * @param {Object} align align config
	 *
	 *    @example
	 *    {
	 *      node: null,         // 参考元素, falsy 或 window 为可视区域, 'trigger' 为触发元素, 其他为指定元素
	 *      points: ['cc','cc'], // ['tr', 'tl'] 表示 overlay 的 tr 与参考节点的 tl 对齐
	 *      offset: [0, 0]      // 有效值为 [n, m]
	 *    }
	 */
	function domAlign(el, refNode, align) {
	  var points = align.points;
	  var offset = align.offset;
	  var overflow = align.overflow;
	  offset = offset && [].concat(offset) || [0, 0];
	  overflow = overflow || {};
	  var newOverflowCfg = {};
	
	  var fail = 0;
	  // 当前节点可以被放置的显示区域
	  var visibleRect = getVisibleRectForElement(el);
	  // 当前节点所占的区域, left/top/width/height
	  var elRegion = getRegion(el);
	  // 参照节点所占的区域, left/top/width/height
	  var refNodeRegion = getRegion(refNode);
	  // 当前节点将要被放置的位置
	  var elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
	  // 当前节点将要所处的区域
	  var newElRegion = _utils2['default'].merge(elRegion, elFuturePos);
	
	  // 如果可视区域不能完全放置当前节点时允许调整
	  if (visibleRect && (overflow.adjustX || overflow.adjustY)) {
	    if (overflow.adjustX) {
	      // 如果横向不能放下
	      if (isFailX(elFuturePos, elRegion, visibleRect)) {
	        fail = 1;
	        // 对齐位置反下
	        points = flip(points, /[lr]/ig, {
	          l: 'r',
	          r: 'l'
	        });
	        // 偏移量也反下
	        offset = flipOffset(offset, 0);
	      }
	    }
	
	    if (overflow.adjustY) {
	      // 如果纵向不能放下
	      if (isFailY(elFuturePos, elRegion, visibleRect)) {
	        fail = 1;
	        // 对齐位置反下
	        points = flip(points, /[tb]/ig, {
	          t: 'b',
	          b: 't'
	        });
	        // 偏移量也反下
	        offset = flipOffset(offset, 1);
	      }
	    }
	
	    // 如果失败，重新计算当前节点将要被放置的位置
	    if (fail) {
	      elFuturePos = getElFuturePos(elRegion, refNodeRegion, points, offset);
	      _utils2['default'].mix(newElRegion, elFuturePos);
	    }
	
	    // 检查反下后的位置是否可以放下了
	    // 如果仍然放不下只有指定了可以调整当前方向才调整
	    newOverflowCfg.adjustX = overflow.adjustX && isFailX(elFuturePos, elRegion, visibleRect);
	
	    newOverflowCfg.adjustY = overflow.adjustY && isFailY(elFuturePos, elRegion, visibleRect);
	
	    // 确实要调整，甚至可能会调整高度宽度
	    if (newOverflowCfg.adjustX || newOverflowCfg.adjustY) {
	      newElRegion = adjustForViewport(elFuturePos, elRegion, visibleRect, newOverflowCfg);
	    }
	  }
	
	  // https://github.com/kissyteam/kissy/issues/190
	  // http://localhost:8888/kissy/src/overlay/demo/other/relative_align/align.html
	  // 相对于屏幕位置没变，而 left/top 变了
	  // 例如 <div 'relative'><el absolute></div>
	  _utils2['default'].offset(el, { left: newElRegion.left, top: newElRegion.top });
	
	  // need judge to in case set fixed with in css on height auto element
	  if (newElRegion.width !== elRegion.width) {
	    _utils2['default'].css(el, 'width', el.width() + newElRegion.width - elRegion.width);
	  }
	
	  if (newElRegion.height !== elRegion.height) {
	    _utils2['default'].css(el, 'height', el.height() + newElRegion.height - elRegion.height);
	  }
	
	  return {
	    points: points,
	    offset: offset,
	    overflow: newOverflowCfg
	  };
	}
	
	domAlign.__getOffsetParent = getOffsetParent;
	
	domAlign.__getVisibleRectForElement = getVisibleRectForElement;
	
	exports['default'] = domAlign;
	
	/**
	 *  2012-04-26 yiminghe@gmail.com
	 *   - 优化智能对齐算法
	 *   - 慎用 resizeXX
	 *
	 *  2011-07-13 yiminghe@gmail.com note:
	 *   - 增加智能对齐，以及大小调整选项
	 **/
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source;
	
	var getComputedStyleX = undefined;
	
	function css(el, name, v) {
	  var value = v;
	  if (typeof name === 'object') {
	    for (var i in name) {
	      if (name.hasOwnProperty(i)) {
	        css(el, i, name[i]);
	      }
	    }
	    return undefined;
	  }
	  if (typeof value !== 'undefined') {
	    if (typeof value === 'number') {
	      value = value + 'px';
	    }
	    el.style[name] = value;
	    return undefined;
	  }
	  return getComputedStyleX(el, name);
	}
	
	function getClientPosition(elem) {
	  var box = undefined;
	  var x = undefined;
	  var y = undefined;
	  var doc = elem.ownerDocument;
	  var body = doc.body;
	  var docElem = doc && doc.documentElement;
	  // 根据 GBS 最新数据，A-Grade Browsers 都已支持 getBoundingClientRect 方法，不用再考虑传统的实现方式
	  box = elem.getBoundingClientRect();
	
	  // 注：jQuery 还考虑减去 docElem.clientLeft/clientTop
	  // 但测试发现，这样反而会导致当 html 和 body 有边距/边框样式时，获取的值不正确
	  // 此外，ie6 会忽略 html 的 margin 值，幸运地是没有谁会去设置 html 的 margin
	
	  x = box.left;
	  y = box.top;
	
	  // In IE, most of the time, 2 extra pixels are added to the top and left
	  // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
	  // IE6 standards mode, this border can be overridden by setting the
	  // document element's border to zero -- thus, we cannot rely on the
	  // offset always being 2 pixels.
	
	  // In quirks mode, the offset can be determined by querying the body's
	  // clientLeft/clientTop, but in standards mode, it is found by querying
	  // the document element's clientLeft/clientTop.  Since we already called
	  // getClientBoundingRect we have already forced a reflow, so it is not
	  // too expensive just to query them all.
	
	  // ie 下应该减去窗口的边框吧，毕竟默认 absolute 都是相对窗口定位的
	  // 窗口边框标准是设 documentElement ,quirks 时设置 body
	  // 最好禁止在 body 和 html 上边框 ，但 ie < 9 html 默认有 2px ，减去
	  // 但是非 ie 不可能设置窗口边框，body html 也不是窗口 ,ie 可以通过 html,body 设置
	  // 标准 ie 下 docElem.clientTop 就是 border-top
	  // ie7 html 即窗口边框改变不了。永远为 2
	  // 但标准 firefox/chrome/ie9 下 docElem.clientTop 是窗口边框，即使设了 border-top 也为 0
	
	  x -= docElem.clientLeft || body.clientLeft || 0;
	  y -= docElem.clientTop || body.clientTop || 0;
	
	  return { left: x, top: y };
	}
	
	function getScroll(w, top) {
	  var ret = w['page' + (top ? 'Y' : 'X') + 'Offset'];
	  var method = 'scroll' + (top ? 'Top' : 'Left');
	  if (typeof ret !== 'number') {
	    var d = w.document;
	    // ie6,7,8 standard mode
	    ret = d.documentElement[method];
	    if (typeof ret !== 'number') {
	      // quirks mode
	      ret = d.body[method];
	    }
	  }
	  return ret;
	}
	
	function getScrollLeft(w) {
	  return getScroll(w);
	}
	
	function getScrollTop(w) {
	  return getScroll(w, true);
	}
	
	function getOffset(el) {
	  var pos = getClientPosition(el);
	  var doc = el.ownerDocument;
	  var w = doc.defaultView || doc.parentWindow;
	  pos.left += getScrollLeft(w);
	  pos.top += getScrollTop(w);
	  return pos;
	}
	function _getComputedStyle(elem, name, cs) {
	  var computedStyle = cs;
	  var val = '';
	  var d = elem.ownerDocument;
	
	  // https://github.com/kissyteam/kissy/issues/61
	  if (computedStyle = computedStyle || d.defaultView.getComputedStyle(elem, null)) {
	    val = computedStyle.getPropertyValue(name) || computedStyle[name];
	  }
	
	  return val;
	}
	
	var _RE_NUM_NO_PX = new RegExp('^(' + RE_NUM + ')(?!px)[a-z%]+$', 'i');
	var RE_POS = /^(top|right|bottom|left)$/;
	var CURRENT_STYLE = 'currentStyle';
	var RUNTIME_STYLE = 'runtimeStyle';
	var LEFT = 'left';
	var PX = 'px';
	
	function _getComputedStyleIE(elem, name) {
	  // currentStyle maybe null
	  // http://msdn.microsoft.com/en-us/library/ms535231.aspx
	  var ret = elem[CURRENT_STYLE] && elem[CURRENT_STYLE][name];
	
	  // 当 width/height 设置为百分比时，通过 pixelLeft 方式转换的 width/height 值
	  // 一开始就处理了! CUSTOM_STYLE.height,CUSTOM_STYLE.width ,cssHook 解决@2011-08-19
	  // 在 ie 下不对，需要直接用 offset 方式
	  // borderWidth 等值也有问题，但考虑到 borderWidth 设为百分比的概率很小，这里就不考虑了
	
	  // From the awesome hack by Dean Edwards
	  // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
	  // If we're not dealing with a regular pixel number
	  // but a number that has a weird ending, we need to convert it to pixels
	  // exclude left right for relativity
	  if (_RE_NUM_NO_PX.test(ret) && !RE_POS.test(name)) {
	    // Remember the original values
	    var style = elem.style;
	    var left = style[LEFT];
	    var rsLeft = elem[RUNTIME_STYLE][LEFT];
	
	    // prevent flashing of content
	    elem[RUNTIME_STYLE][LEFT] = elem[CURRENT_STYLE][LEFT];
	
	    // Put in the new values to get a computed value out
	    style[LEFT] = name === 'fontSize' ? '1em' : ret || 0;
	    ret = style.pixelLeft + PX;
	
	    // Revert the changed values
	    style[LEFT] = left;
	
	    elem[RUNTIME_STYLE][LEFT] = rsLeft;
	  }
	  return ret === '' ? 'auto' : ret;
	}
	
	if (typeof window !== 'undefined') {
	  getComputedStyleX = window.getComputedStyle ? _getComputedStyle : _getComputedStyleIE;
	}
	
	// 设置 elem 相对 elem.ownerDocument 的坐标
	function setOffset(elem, offset) {
	  // set position first, in-case top/left are set even on static elem
	  if (css(elem, 'position') === 'static') {
	    elem.style.position = 'relative';
	  }
	  var preset = -9999;
	  if ('left' in offset) {
	    elem.style.left = preset + 'px';
	  }
	  if ('top' in offset) {
	    elem.style.top = preset + 'px';
	  }
	  var old = getOffset(elem);
	  var ret = {};
	  var key = undefined;
	  for (key in offset) {
	    if (offset.hasOwnProperty(key)) {
	      ret[key] = preset + offset[key] - old[key];
	    }
	  }
	  css(elem, ret);
	}
	
	function each(arr, fn) {
	  for (var i = 0; i < arr.length; i++) {
	    fn(arr[i]);
	  }
	}
	
	function isBorderBoxFn(elem) {
	  return getComputedStyleX(elem, 'boxSizing') === 'border-box';
	}
	
	var BOX_MODELS = ['margin', 'border', 'padding'];
	var CONTENT_INDEX = -1;
	var PADDING_INDEX = 2;
	var BORDER_INDEX = 1;
	var MARGIN_INDEX = 0;
	
	function swap(elem, options, callback) {
	  var old = {};
	  var style = elem.style;
	  var name = undefined;
	
	  // Remember the old values, and insert the new ones
	  for (name in options) {
	    if (options.hasOwnProperty(name)) {
	      old[name] = style[name];
	      style[name] = options[name];
	    }
	  }
	
	  callback.call(elem);
	
	  // Revert the old values
	  for (name in options) {
	    if (options.hasOwnProperty(name)) {
	      style[name] = old[name];
	    }
	  }
	}
	
	function getPBMWidth(elem, props, which) {
	  var value = 0;
	  var prop = undefined;
	  var j = undefined;
	  var i = undefined;
	  for (j = 0; j < props.length; j++) {
	    prop = props[j];
	    if (prop) {
	      for (i = 0; i < which.length; i++) {
	        var cssProp = undefined;
	        if (prop === 'border') {
	          cssProp = prop + which[i] + 'Width';
	        } else {
	          cssProp = prop + which[i];
	        }
	        value += parseFloat(getComputedStyleX(elem, cssProp)) || 0;
	      }
	    }
	  }
	  return value;
	}
	
	/**
	 * A crude way of determining if an object is a window
	 * @member util
	 */
	function isWindow(obj) {
	  // must use == for ie8
	  /* eslint eqeqeq:0 */
	  return obj !== null && obj !== undefined && obj == obj.window;
	}
	
	var domUtils = {};
	
	each(['Width', 'Height'], function (name) {
	  domUtils['doc' + name] = function (refWin) {
	    var d = refWin.document;
	    return Math.max(
	    // firefox chrome documentElement.scrollHeight< body.scrollHeight
	    // ie standard mode : documentElement.scrollHeight> body.scrollHeight
	    d.documentElement['scroll' + name],
	    // quirks : documentElement.scrollHeight 最大等于可视窗口多一点？
	    d.body['scroll' + name], domUtils['viewport' + name](d));
	  };
	
	  domUtils['viewport' + name] = function (win) {
	    // pc browser includes scrollbar in window.innerWidth
	    var prop = 'client' + name;
	    var doc = win.document;
	    var body = doc.body;
	    var documentElement = doc.documentElement;
	    var documentElementProp = documentElement[prop];
	    // 标准模式取 documentElement
	    // backcompat 取 body
	    return doc.compatMode === 'CSS1Compat' && documentElementProp || body && body[prop] || documentElementProp;
	  };
	});
	
	/*
	 得到元素的大小信息
	 @param elem
	 @param name
	 @param {String} [extra]  'padding' : (css width) + padding
	 'border' : (css width) + padding + border
	 'margin' : (css width) + padding + border + margin
	 */
	function getWH(elem, name, ex) {
	  var extra = ex;
	  if (isWindow(elem)) {
	    return name === 'width' ? domUtils.viewportWidth(elem) : domUtils.viewportHeight(elem);
	  } else if (elem.nodeType === 9) {
	    return name === 'width' ? domUtils.docWidth(elem) : domUtils.docHeight(elem);
	  }
	  var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
	  var borderBoxValue = name === 'width' ? elem.offsetWidth : elem.offsetHeight;
	  var computedStyle = getComputedStyleX(elem);
	  var isBorderBox = isBorderBoxFn(elem, computedStyle);
	  var cssBoxValue = 0;
	  if (borderBoxValue === null || borderBoxValue === undefined || borderBoxValue <= 0) {
	    borderBoxValue = undefined;
	    // Fall back to computed then un computed css if necessary
	    cssBoxValue = getComputedStyleX(elem, name);
	    if (cssBoxValue === null || cssBoxValue === undefined || Number(cssBoxValue) < 0) {
	      cssBoxValue = elem.style[name] || 0;
	    }
	    // Normalize '', auto, and prepare for extra
	    cssBoxValue = parseFloat(cssBoxValue) || 0;
	  }
	  if (extra === undefined) {
	    extra = isBorderBox ? BORDER_INDEX : CONTENT_INDEX;
	  }
	  var borderBoxValueOrIsBorderBox = borderBoxValue !== undefined || isBorderBox;
	  var val = borderBoxValue || cssBoxValue;
	  if (extra === CONTENT_INDEX) {
	    if (borderBoxValueOrIsBorderBox) {
	      return val - getPBMWidth(elem, ['border', 'padding'], which, computedStyle);
	    }
	    return cssBoxValue;
	  } else if (borderBoxValueOrIsBorderBox) {
	    if (extra === BORDER_INDEX) {
	      return val;
	    }
	    return val + (extra === PADDING_INDEX ? -getPBMWidth(elem, ['border'], which, computedStyle) : getPBMWidth(elem, ['margin'], which, computedStyle));
	  }
	  return cssBoxValue + getPBMWidth(elem, BOX_MODELS.slice(extra), which, computedStyle);
	}
	
	var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
	
	// fix #119 : https://github.com/kissyteam/kissy/issues/119
	function getWHIgnoreDisplay() {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }
	
	  var val = undefined;
	  var elem = args[0];
	  // in case elem is window
	  // elem.offsetWidth === undefined
	  if (elem.offsetWidth !== 0) {
	    val = getWH.apply(undefined, args);
	  } else {
	    swap(elem, cssShow, function () {
	      val = getWH.apply(undefined, args);
	    });
	  }
	  return val;
	}
	
	each(['width', 'height'], function (name) {
	  var first = name.charAt(0).toUpperCase() + name.slice(1);
	  domUtils['outer' + first] = function (el, includeMargin) {
	    return el && getWHIgnoreDisplay(el, name, includeMargin ? MARGIN_INDEX : BORDER_INDEX);
	  };
	  var which = name === 'width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
	
	  domUtils[name] = function (elem, v) {
	    var val = v;
	    if (val !== undefined) {
	      if (elem) {
	        var computedStyle = getComputedStyleX(elem);
	        var isBorderBox = isBorderBoxFn(elem);
	        if (isBorderBox) {
	          val += getPBMWidth(elem, ['padding', 'border'], which, computedStyle);
	        }
	        return css(elem, name, val);
	      }
	      return undefined;
	    }
	    return elem && getWHIgnoreDisplay(elem, name, CONTENT_INDEX);
	  };
	});
	
	function mix(to, from) {
	  for (var i in from) {
	    if (from.hasOwnProperty(i)) {
	      to[i] = from[i];
	    }
	  }
	  return to;
	}
	
	var utils = {
	  getWindow: function getWindow(node) {
	    if (node && node.document && node.setTimeout) {
	      return node;
	    }
	    var doc = node.ownerDocument || node;
	    return doc.defaultView || doc.parentWindow;
	  },
	  offset: function offset(el, value) {
	    if (typeof value !== 'undefined') {
	      setOffset(el, value);
	    } else {
	      return getOffset(el);
	    }
	  },
	  isWindow: isWindow,
	  each: each,
	  css: css,
	  clone: function clone(obj) {
	    var i = undefined;
	    var ret = {};
	    for (i in obj) {
	      if (obj.hasOwnProperty(i)) {
	        ret[i] = obj[i];
	      }
	    }
	    var overflow = obj.overflow;
	    if (overflow) {
	      for (i in obj) {
	        if (obj.hasOwnProperty(i)) {
	          ret.overflow[i] = obj.overflow[i];
	        }
	      }
	    }
	    return ret;
	  },
	  mix: mix,
	  getWindowScrollLeft: function getWindowScrollLeft(w) {
	    return getScrollLeft(w);
	  },
	  getWindowScrollTop: function getWindowScrollTop(w) {
	    return getScrollTop(w);
	  },
	  merge: function merge() {
	    var ret = {};
	
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }
	
	    for (var i = 0; i < args.length; i++) {
	      utils.mix(ret, args[i]);
	    }
	    return ret;
	  },
	  viewportWidth: 0,
	  viewportHeight: 0
	};
	
	mix(utils, domUtils);
	
	exports['default'] = utils;
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  guid: __webpack_require__(17),
	  classSet: __webpack_require__(18),
	  joinClasses: __webpack_require__(19),
	  KeyCode: __webpack_require__(20),
	  PureRenderMixin: __webpack_require__(21),
	  shallowEqual: __webpack_require__(22),
	  createChainedFunction: __webpack_require__(23),
	  Dom: {
	    addEventListener: __webpack_require__(24),
	    contains: __webpack_require__(25)
	  },
	  Children: {
	    toArray: __webpack_require__(26),
	    mapSelf: __webpack_require__(27)
	  }
	};


/***/ },
/* 17 */
/***/ function(module, exports) {

	var seed = 0;
	module.exports = function () {
	  return Date.now() + '_' + (seed++);
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This file contains an unmodified version of:
	 * https://github.com/facebook/react/blob/v0.12.0/src/vendor/stubs/cx.js
	 *
	 * This source code is licensed under the BSD-style license found here:
	 * https://github.com/facebook/react/blob/v0.12.0/LICENSE
	 * An additional grant of patent rights can be found here:
	 * https://github.com/facebook/react/blob/v0.12.0/PATENTS
	 */
	
	/**
	 * This function is used to mark string literals representing CSS class names
	 * so that they can be transformed statically. This allows for modularization
	 * and minification of CSS class names.
	 *
	 * In static_upstream, this function is actually implemented, but it should
	 * eventually be replaced with something more descriptive, and the transform
	 * that is used in the main stack should be ported for use elsewhere.
	 *
	 * @param string|object className to modularize, or an object of key/values.
	 *                      In the object case, the values are conditions that
	 *                      determine if the className keys should be included.
	 * @param [string ...]  Variable list of classNames in the string case.
	 * @return string       Renderable space-separated CSS className.
	 */
	function cx(classNames) {
	  if (typeof classNames === 'object') {
	    return Object.keys(classNames).filter(function(className) {
	      return classNames[className];
	    }).join(' ');
	  } else {
	    return Array.prototype.join.call(arguments, ' ');
	  }
	}
	
	module.exports = cx;


/***/ },
/* 19 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This file contains an unmodified version of:
	 * https://github.com/facebook/react/blob/v0.12.0/src/utils/joinClasses.js
	 *
	 * This source code is licensed under the BSD-style license found here:
	 * https://github.com/facebook/react/blob/v0.12.0/LICENSE
	 * An additional grant of patent rights can be found here:
	 * https://github.com/facebook/react/blob/v0.12.0/PATENTS
	 */
	
	"use strict";
	
	/**
	 * Combines multiple className strings into one.
	 * http://jsperf.com/joinclasses-args-vs-array
	 *
	 * @param {...?string} classes
	 * @return {string}
	 */
	
	function joinClasses(className /*, ... */ ) {
	  if (!className) {
	    className = '';
	  }
	  var nextClass;
	  var argLength = arguments.length;
	  if (argLength > 1) {
	    for (var ii = 1; ii < argLength; ii++) {
	      nextClass = arguments[ii];
	      if (nextClass) {
	        className = (className ? className + ' ' : '') + nextClass;
	      }
	    }
	  }
	  return className;
	}
	
	module.exports = joinClasses;


/***/ },
/* 20 */
/***/ function(module, exports) {

	/**
	 * @ignore
	 * some key-codes definition and utils from closure-library
	 * @author yiminghe@gmail.com
	 */
	
	var KeyCode = {
	  /**
	   * MAC_ENTER
	   */
	  MAC_ENTER: 3,
	  /**
	   * BACKSPACE
	   */
	  BACKSPACE: 8,
	  /**
	   * TAB
	   */
	  TAB: 9,
	  /**
	   * NUMLOCK on FF/Safari Mac
	   */
	  NUM_CENTER: 12, // NUMLOCK on FF/Safari Mac
	  /**
	   * ENTER
	   */
	  ENTER: 13,
	  /**
	   * SHIFT
	   */
	  SHIFT: 16,
	  /**
	   * CTRL
	   */
	  CTRL: 17,
	  /**
	   * ALT
	   */
	  ALT: 18,
	  /**
	   * PAUSE
	   */
	  PAUSE: 19,
	  /**
	   * CAPS_LOCK
	   */
	  CAPS_LOCK: 20,
	  /**
	   * ESC
	   */
	  ESC: 27,
	  /**
	   * SPACE
	   */
	  SPACE: 32,
	  /**
	   * PAGE_UP
	   */
	  PAGE_UP: 33, // also NUM_NORTH_EAST
	  /**
	   * PAGE_DOWN
	   */
	  PAGE_DOWN: 34, // also NUM_SOUTH_EAST
	  /**
	   * END
	   */
	  END: 35, // also NUM_SOUTH_WEST
	  /**
	   * HOME
	   */
	  HOME: 36, // also NUM_NORTH_WEST
	  /**
	   * LEFT
	   */
	  LEFT: 37, // also NUM_WEST
	  /**
	   * UP
	   */
	  UP: 38, // also NUM_NORTH
	  /**
	   * RIGHT
	   */
	  RIGHT: 39, // also NUM_EAST
	  /**
	   * DOWN
	   */
	  DOWN: 40, // also NUM_SOUTH
	  /**
	   * PRINT_SCREEN
	   */
	  PRINT_SCREEN: 44,
	  /**
	   * INSERT
	   */
	  INSERT: 45, // also NUM_INSERT
	  /**
	   * DELETE
	   */
	  DELETE: 46, // also NUM_DELETE
	  /**
	   * ZERO
	   */
	  ZERO: 48,
	  /**
	   * ONE
	   */
	  ONE: 49,
	  /**
	   * TWO
	   */
	  TWO: 50,
	  /**
	   * THREE
	   */
	  THREE: 51,
	  /**
	   * FOUR
	   */
	  FOUR: 52,
	  /**
	   * FIVE
	   */
	  FIVE: 53,
	  /**
	   * SIX
	   */
	  SIX: 54,
	  /**
	   * SEVEN
	   */
	  SEVEN: 55,
	  /**
	   * EIGHT
	   */
	  EIGHT: 56,
	  /**
	   * NINE
	   */
	  NINE: 57,
	  /**
	   * QUESTION_MARK
	   */
	  QUESTION_MARK: 63, // needs localization
	  /**
	   * A
	   */
	  A: 65,
	  /**
	   * B
	   */
	  B: 66,
	  /**
	   * C
	   */
	  C: 67,
	  /**
	   * D
	   */
	  D: 68,
	  /**
	   * E
	   */
	  E: 69,
	  /**
	   * F
	   */
	  F: 70,
	  /**
	   * G
	   */
	  G: 71,
	  /**
	   * H
	   */
	  H: 72,
	  /**
	   * I
	   */
	  I: 73,
	  /**
	   * J
	   */
	  J: 74,
	  /**
	   * K
	   */
	  K: 75,
	  /**
	   * L
	   */
	  L: 76,
	  /**
	   * M
	   */
	  M: 77,
	  /**
	   * N
	   */
	  N: 78,
	  /**
	   * O
	   */
	  O: 79,
	  /**
	   * P
	   */
	  P: 80,
	  /**
	   * Q
	   */
	  Q: 81,
	  /**
	   * R
	   */
	  R: 82,
	  /**
	   * S
	   */
	  S: 83,
	  /**
	   * T
	   */
	  T: 84,
	  /**
	   * U
	   */
	  U: 85,
	  /**
	   * V
	   */
	  V: 86,
	  /**
	   * W
	   */
	  W: 87,
	  /**
	   * X
	   */
	  X: 88,
	  /**
	   * Y
	   */
	  Y: 89,
	  /**
	   * Z
	   */
	  Z: 90,
	  /**
	   * META
	   */
	  META: 91, // WIN_KEY_LEFT
	  /**
	   * WIN_KEY_RIGHT
	   */
	  WIN_KEY_RIGHT: 92,
	  /**
	   * CONTEXT_MENU
	   */
	  CONTEXT_MENU: 93,
	  /**
	   * NUM_ZERO
	   */
	  NUM_ZERO: 96,
	  /**
	   * NUM_ONE
	   */
	  NUM_ONE: 97,
	  /**
	   * NUM_TWO
	   */
	  NUM_TWO: 98,
	  /**
	   * NUM_THREE
	   */
	  NUM_THREE: 99,
	  /**
	   * NUM_FOUR
	   */
	  NUM_FOUR: 100,
	  /**
	   * NUM_FIVE
	   */
	  NUM_FIVE: 101,
	  /**
	   * NUM_SIX
	   */
	  NUM_SIX: 102,
	  /**
	   * NUM_SEVEN
	   */
	  NUM_SEVEN: 103,
	  /**
	   * NUM_EIGHT
	   */
	  NUM_EIGHT: 104,
	  /**
	   * NUM_NINE
	   */
	  NUM_NINE: 105,
	  /**
	   * NUM_MULTIPLY
	   */
	  NUM_MULTIPLY: 106,
	  /**
	   * NUM_PLUS
	   */
	  NUM_PLUS: 107,
	  /**
	   * NUM_MINUS
	   */
	  NUM_MINUS: 109,
	  /**
	   * NUM_PERIOD
	   */
	  NUM_PERIOD: 110,
	  /**
	   * NUM_DIVISION
	   */
	  NUM_DIVISION: 111,
	  /**
	   * F1
	   */
	  F1: 112,
	  /**
	   * F2
	   */
	  F2: 113,
	  /**
	   * F3
	   */
	  F3: 114,
	  /**
	   * F4
	   */
	  F4: 115,
	  /**
	   * F5
	   */
	  F5: 116,
	  /**
	   * F6
	   */
	  F6: 117,
	  /**
	   * F7
	   */
	  F7: 118,
	  /**
	   * F8
	   */
	  F8: 119,
	  /**
	   * F9
	   */
	  F9: 120,
	  /**
	   * F10
	   */
	  F10: 121,
	  /**
	   * F11
	   */
	  F11: 122,
	  /**
	   * F12
	   */
	  F12: 123,
	  /**
	   * NUMLOCK
	   */
	  NUMLOCK: 144,
	  /**
	   * SEMICOLON
	   */
	  SEMICOLON: 186, // needs localization
	  /**
	   * DASH
	   */
	  DASH: 189, // needs localization
	  /**
	   * EQUALS
	   */
	  EQUALS: 187, // needs localization
	  /**
	   * COMMA
	   */
	  COMMA: 188, // needs localization
	  /**
	   * PERIOD
	   */
	  PERIOD: 190, // needs localization
	  /**
	   * SLASH
	   */
	  SLASH: 191, // needs localization
	  /**
	   * APOSTROPHE
	   */
	  APOSTROPHE: 192, // needs localization
	  /**
	   * SINGLE_QUOTE
	   */
	  SINGLE_QUOTE: 222, // needs localization
	  /**
	   * OPEN_SQUARE_BRACKET
	   */
	  OPEN_SQUARE_BRACKET: 219, // needs localization
	  /**
	   * BACKSLASH
	   */
	  BACKSLASH: 220, // needs localization
	  /**
	   * CLOSE_SQUARE_BRACKET
	   */
	  CLOSE_SQUARE_BRACKET: 221, // needs localization
	  /**
	   * WIN_KEY
	   */
	  WIN_KEY: 224,
	  /**
	   * MAC_FF_META
	   */
	  MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
	  /**
	   * WIN_IME
	   */
	  WIN_IME: 229
	};
	
	/*
	 whether text and modified key is entered at the same time.
	 */
	KeyCode.isTextModifyingKeyEvent = function (e) {
	  var keyCode = e.keyCode;
	  if (e.altKey && !e.ctrlKey || e.metaKey ||
	      // Function keys don't generate text
	    keyCode >= KeyCode.F1 && keyCode <= KeyCode.F12) {
	    return false;
	  }
	
	  // The following keys are quite harmless, even in combination with
	  // CTRL, ALT or SHIFT.
	  switch (keyCode) {
	    case KeyCode.ALT:
	    case KeyCode.CAPS_LOCK:
	    case KeyCode.CONTEXT_MENU:
	    case KeyCode.CTRL:
	    case KeyCode.DOWN:
	    case KeyCode.END:
	    case KeyCode.ESC:
	    case KeyCode.HOME:
	    case KeyCode.INSERT:
	    case KeyCode.LEFT:
	    case KeyCode.MAC_FF_META:
	    case KeyCode.META:
	    case KeyCode.NUMLOCK:
	    case KeyCode.NUM_CENTER:
	    case KeyCode.PAGE_DOWN:
	    case KeyCode.PAGE_UP:
	    case KeyCode.PAUSE:
	    case KeyCode.PRINT_SCREEN:
	    case KeyCode.RIGHT:
	    case KeyCode.SHIFT:
	    case KeyCode.UP:
	    case KeyCode.WIN_KEY:
	    case KeyCode.WIN_KEY_RIGHT:
	      return false;
	    default:
	      return true;
	  }
	};
	
	/*
	 whether character is entered.
	 */
	KeyCode.isCharacterKey = function (keyCode) {
	  if (keyCode >= KeyCode.ZERO &&
	    keyCode <= KeyCode.NINE) {
	    return true;
	  }
	
	  if (keyCode >= KeyCode.NUM_ZERO &&
	    keyCode <= KeyCode.NUM_MULTIPLY) {
	    return true;
	  }
	
	  if (keyCode >= KeyCode.A &&
	    keyCode <= KeyCode.Z) {
	    return true;
	  }
	
	  // Safari sends zero key code for non-latin characters.
	  if (window.navigation.userAgent.indexOf('WebKit') !== -1 && keyCode === 0) {
	    return true;
	  }
	
	  switch (keyCode) {
	    case KeyCode.SPACE:
	    case KeyCode.QUESTION_MARK:
	    case KeyCode.NUM_PLUS:
	    case KeyCode.NUM_MINUS:
	    case KeyCode.NUM_PERIOD:
	    case KeyCode.NUM_DIVISION:
	    case KeyCode.SEMICOLON:
	    case KeyCode.DASH:
	    case KeyCode.EQUALS:
	    case KeyCode.COMMA:
	    case KeyCode.PERIOD:
	    case KeyCode.SLASH:
	    case KeyCode.APOSTROPHE:
	    case KeyCode.SINGLE_QUOTE:
	    case KeyCode.OPEN_SQUARE_BRACKET:
	    case KeyCode.BACKSLASH:
	    case KeyCode.CLOSE_SQUARE_BRACKET:
	      return true;
	    default:
	      return false;
	  }
	};
	
	module.exports = KeyCode;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	* @providesModule ReactComponentWithPureRenderMixin
	*/
	
	"use strict";
	
	var shallowEqual = __webpack_require__(22);
	
	/**
	 * If your React component's render function is "pure", e.g. it will render the
	 * same result given the same props and state, provide this Mixin for a
	 * considerable performance boost.
	 *
	 * Most React components have pure render functions.
	 *
	 * Example:
	 *
	 *   var ReactComponentWithPureRenderMixin =
	 *     require('ReactComponentWithPureRenderMixin');
	 *   React.createClass({
	 *     mixins: [ReactComponentWithPureRenderMixin],
	 *
	 *     render: function() {
	 *       return <div className={this.props.className}>foo</div>;
	 *     }
	 *   });
	 *
	 * Note: This only checks shallow equality for props and state. If these contain
	 * complex data structures this mixin may have false-negatives for deeper
	 * differences. Only mixin to components which have simple props and state, or
	 * use `forceUpdate()` when you know deep data structures have changed.
	 */
	var ReactComponentWithPureRenderMixin = {
	  shouldComponentUpdate: function(nextProps, nextState) {
	    return !shallowEqual(this.props, nextProps) ||
	           !shallowEqual(this.state, nextState);
	  }
	};
	
	module.exports = ReactComponentWithPureRenderMixin;


/***/ },
/* 22 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2014, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule shallowEqual
	 */
	
	"use strict";
	
	/**
	 * Performs equality by iterating through keys on an object and returning
	 * false when any key has values which are not strictly equal between
	 * objA and objB. Returns true when the values of all keys are strictly equal.
	 *
	 * @return {boolean}
	 */
	function shallowEqual(objA, objB) {
	  if (objA === objB) {
	    return true;
	  }
	  var key;
	  // Test for A's keys different from B.
	  for (key in objA) {
	    if (objA.hasOwnProperty(key) &&
	        (!objB.hasOwnProperty(key) || objA[key] !== objB[key])) {
	      return false;
	    }
	  }
	  // Test for B's keys missing from A.
	  for (key in objB) {
	    if (objB.hasOwnProperty(key) && !objA.hasOwnProperty(key)) {
	      return false;
	    }
	  }
	  return true;
	}
	
	module.exports = shallowEqual;


/***/ },
/* 23 */
/***/ function(module, exports) {

	/**
	 * Safe chained function
	 *
	 * Will only create a new function if needed,
	 * otherwise will pass back existing functions or null.
	 *
	 * @returns {function|null}
	 */
	function createChainedFunction() {
	  var args = arguments;
	
	  return function chainedFunction() {
	    for (var i = 0; i < args.length; i++) {
	      if (args[i] && args[i].apply) {
	        args[i].apply(this, arguments);
	      }
	    }
	  };
	}
	
	module.exports = createChainedFunction;


/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = function (target, eventType, callback) {
	  if (target.addEventListener) {
	    target.addEventListener(eventType, callback, false);
	    return {
	      remove: function () {
	        target.removeEventListener(eventType, callback, false);
	      }
	    };
	  } else if (target.attachEvent) {
	    target.attachEvent('on' + eventType, callback);
	    return {
	      remove: function () {
	        target.detachEvent('on' + eventType, callback);
	      }
	    };
	  }
	};


/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = function (root, node) {
	  while (node) {
	    if (node === root) {
	      return true;
	    }
	    node = node.parentNode;
	  }
	
	  return false;
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	
	module.exports = function (children) {
	  var ret = [];
	  React.Children.forEach(children, function (c) {
	    ret.push(c);
	  });
	  return ret;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var React = __webpack_require__(2);
	
	function mirror(o) {
	  return o;
	}
	
	module.exports = function (children) {
	  // return ReactFragment
	  return React.Children.map(children, mirror);
	};


/***/ }
]);
//# sourceMappingURL=simple.js.map