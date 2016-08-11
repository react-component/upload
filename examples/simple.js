webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(167);


/***/ },

/***/ 167:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(158);
	var Upload = __webpack_require__(159);
	
	// document.domain = 'alipay.net';
	
	var style = '\n        .rc-upload-disabled {\n           opacity:0.5;\n        ';
	
	var Test = React.createClass({
	  displayName: 'Test',
	
	  getInitialState: function getInitialState() {
	    this.uploaderProps = {
	      action: '/upload.do',
	      data: { a: 1, b: 2 },
	      headers: {
	        Authorization: 'xxxxxxx'
	      },
	      multiple: true,
	      beforeUpload: function beforeUpload(file) {
	        console.log('beforeUpload', file.name);
	      },
	      onStart: function onStart(file) {
	        console.log('onStart', file.name);
	        // this.refs.inner.abort(file);
	      },
	      onSuccess: function onSuccess(file) {
	        console.log('onSuccess', file);
	      },
	      onProgress: function onProgress(step, file) {
	        console.log('onProgress', file.name);
	      },
	      onError: function onError(err) {
	        console.log('onError', err);
	      }
	    };
	    return {
	      destroyed: false
	    };
	  },
	
	  destroy: function destroy() {
	    this.setState({
	      destroyed: true
	    });
	  },
	
	  render: function render() {
	    if (this.state.destroyed) {
	      return null;
	    }
	    return React.createElement(
	      'div',
	      { style: {
	          margin: 100
	        } },
	      React.createElement(
	        'h2',
	        null,
	        '固定位置'
	      ),
	      React.createElement(
	        'style',
	        null,
	        style
	      ),
	      React.createElement(
	        'div',
	        null,
	        React.createElement(
	          Upload,
	          _extends({}, this.uploaderProps, { ref: 'inner' }),
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
	        { style: {
	            height: 200,
	            overflow: 'auto',
	            border: '1px solid red'
	          } },
	        React.createElement(
	          'div',
	          { style: {
	              height: 500
	            } },
	          React.createElement(
	            Upload,
	            _extends({}, this.uploaderProps, { component: 'div', style: { display: 'inline-block' } }),
	            React.createElement(
	              'a',
	              {
	                href: '#nowhere' },
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
	
	ReactDOM.render(React.createElement(Test, null), document.getElementById('__react-content'));

/***/ }

});
//# sourceMappingURL=simple.js.map