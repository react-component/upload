webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(222);


/***/ },

/***/ 222:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends2 = __webpack_require__(179);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/* eslint no-console:0 */
	
	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(36);
	var Upload = __webpack_require__(176);
	
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
	      {
	        style: {
	          margin: 100
	        }
	      },
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
	          (0, _extends3.default)({}, this.uploaderProps, { ref: 'inner' }),
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
	        {
	          style: {
	            height: 200,
	            overflow: 'auto',
	            border: '1px solid red'
	          }
	        },
	        React.createElement(
	          'div',
	          {
	            style: {
	              height: 500
	            }
	          },
	          React.createElement(
	            Upload,
	            (0, _extends3.default)({}, this.uploaderProps, { component: 'div', style: { display: 'inline-block' } }),
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
	
	ReactDOM.render(React.createElement(Test, null), document.getElementById('__react-content'));

/***/ }

});
//# sourceMappingURL=simple.js.map