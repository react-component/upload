webpackJsonp([1],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(275);


/***/ },

/***/ 275:
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends2 = __webpack_require__(182);
	
	var _extends3 = _interopRequireDefault(_extends2);
	
	var _classCallCheck2 = __webpack_require__(220);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _possibleConstructorReturn2 = __webpack_require__(221);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(257);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactDom = __webpack_require__(33);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _rcUpload = __webpack_require__(179);
	
	var _rcUpload2 = _interopRequireDefault(_rcUpload);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var style = '\n        .rc-upload-disabled {\n           opacity:0.5;\n        '; /* eslint no-console:0 */
	
	var Test = function (_React$Component) {
	  (0, _inherits3.default)(Test, _React$Component);
	
	  function Test(props) {
	    (0, _classCallCheck3.default)(this, Test);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, _React$Component.call(this, props));
	
	    _this.destroy = function () {
	      _this.setState({
	        destroyed: true
	      });
	    };
	
	    _this.uploaderProps = {
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
	        console.log('onProgress', Math.round(step.percent), file.name);
	      },
	      onError: function onError(err) {
	        console.log('onError', err);
	      }
	    };
	    _this.state = {
	      destroyed: false
	    };
	    return _this;
	  }
	
	  Test.prototype.render = function render() {
	    if (this.state.destroyed) {
	      return null;
	    }
	    return _react2.default.createElement(
	      'div',
	      {
	        style: {
	          margin: 100
	        }
	      },
	      _react2.default.createElement(
	        'h2',
	        null,
	        '\u56FA\u5B9A\u4F4D\u7F6E'
	      ),
	      _react2.default.createElement(
	        'style',
	        null,
	        style
	      ),
	      _react2.default.createElement(
	        'div',
	        null,
	        _react2.default.createElement(
	          _rcUpload2.default,
	          (0, _extends3.default)({}, this.uploaderProps, { ref: 'inner' }),
	          _react2.default.createElement(
	            'a',
	            null,
	            '\u5F00\u59CB\u4E0A\u4F20'
	          )
	        )
	      ),
	      _react2.default.createElement(
	        'h2',
	        null,
	        '\u6EDA\u52A8'
	      ),
	      _react2.default.createElement(
	        'div',
	        {
	          style: {
	            height: 200,
	            overflow: 'auto',
	            border: '1px solid red'
	          }
	        },
	        _react2.default.createElement(
	          'div',
	          {
	            style: {
	              height: 500
	            }
	          },
	          _react2.default.createElement(
	            _rcUpload2.default,
	            (0, _extends3.default)({}, this.uploaderProps, { component: 'div', style: { display: 'inline-block' } }),
	            _react2.default.createElement(
	              'a',
	              null,
	              '\u5F00\u59CB\u4E0A\u4F202'
	            )
	          )
	        )
	      ),
	      _react2.default.createElement(
	        'button',
	        { onClick: this.destroy },
	        'destroy'
	      )
	    );
	  };
	
	  return Test;
	}(_react2.default.Component);
	
	_reactDom2.default.render(_react2.default.createElement(Test, null), document.getElementById('__react-content'));

/***/ }

});
//# sourceMappingURL=simple.js.map