webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var React = __webpack_require__(2);
	var ReactDOM = __webpack_require__(158);
	var Upload = __webpack_require__(159);
	var props = {
	  action: '/upload.do',
	  onStart: function onStart(file) {
	    console.log('onStart', file, file.name);
	  },
	  onSuccess: function onSuccess(ret) {
	    console.log('onSuccess', ret);
	  },
	  onError: function onError(err) {
	    console.log('onError', err);
	  },
	  beforeUpload: function beforeUpload(file) {
	    return new Promise(function (resolve) {
	      console.log('start check');
	      setTimeout(function () {
	        console.log('check finshed');
	        resolve(file);
	      }, 3000);
	    });
	  }
	};
	
	var Test = React.createClass({
	  displayName: 'Test',
	
	  render: function render() {
	    return React.createElement(
	      'div',
	      { style: { margin: 100 } },
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
	      )
	    );
	  }
	});
	
	ReactDOM.render(React.createElement(Test, null), document.getElementById('__react-content'));

/***/ }
]);
//# sourceMappingURL=beforeUpload.js.map