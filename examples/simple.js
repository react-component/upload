webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(167);


/***/ },

/***/ 167:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(158);
	var Upload = __webpack_require__(159);
	var props = {
	  action: '/upload.do',
	  data: { a: 1, b: 2 },
	  headers: {
	    Authorization: 'xxxxxxx'
	  },
	  multiple: true,
	  onStart: function onStart(files) {
	    var file = files[0];
	    console.log('onStart', file, file.name);
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
	
	// document.domain = 'alipay.net';
	
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
	            props,
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