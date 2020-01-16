webpackJsonp([2],{

/***/ 151:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(68);


/***/ }),

/***/ 68:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_createClass__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_createClass___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_createClass__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_react_dom__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_upload__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_rc_upload___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_rc_upload__);





/* eslint no-console:0 */





var style = '\n        .rc-upload-disabled {\n           opacity:0.5;\n        ';

var Test = function (_React$Component) {
  __WEBPACK_IMPORTED_MODULE_4_babel_runtime_helpers_inherits___default()(Test, _React$Component);

  function Test(props) {
    __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_classCallCheck___default()(this, Test);

    var _this = __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_possibleConstructorReturn___default()(this, (Test.__proto__ || Object.getPrototypeOf(Test)).call(this, props));

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

  __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_createClass___default()(Test, [{
    key: 'render',
    value: function render() {
      if (this.state.destroyed) {
        return null;
      }
      return __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
        'div',
        {
          style: {
            margin: 100
          }
        },
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'h2',
          null,
          '\u56FA\u5B9A\u4F4D\u7F6E'
        ),
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'style',
          null,
          style
        ),
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'div',
          null,
          __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
            __WEBPACK_IMPORTED_MODULE_7_rc_upload___default.a,
            __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, this.uploaderProps, { ref: 'inner' }),
            __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
              'a',
              null,
              '\u5F00\u59CB\u4E0A\u4F20'
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'h2',
          null,
          '\u6EDA\u52A8'
        ),
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'div',
          {
            style: {
              height: 200,
              overflow: 'auto',
              border: '1px solid red'
            }
          },
          __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
            'div',
            {
              style: {
                height: 500
              }
            },
            __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
              __WEBPACK_IMPORTED_MODULE_7_rc_upload___default.a,
              __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_extends___default()({}, this.uploaderProps, {
                id: 'test',
                component: 'div',
                style: { display: 'inline-block' }
              }),
              __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
                'a',
                null,
                '\u5F00\u59CB\u4E0A\u4F202'
              )
            )
          ),
          __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
            'label',
            { htmlFor: 'test' },
            'Label for Upload'
          )
        ),
        __WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(
          'button',
          { onClick: this.destroy },
          'destroy'
        )
      );
    }
  }]);

  return Test;
}(__WEBPACK_IMPORTED_MODULE_5_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_6_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_5_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[151]);
//# sourceMappingURL=simple.js.map