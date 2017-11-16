webpackJsonp([1],{

/***/ 130:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(69);


/***/ }),

/***/ 69:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_upload__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rc_upload___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rc_upload__);




/* eslint no-console:0 */





var Test = function (_React$Component) {
  __WEBPACK_IMPORTED_MODULE_3_babel_runtime_helpers_inherits___default()(Test, _React$Component);

  function Test() {
    __WEBPACK_IMPORTED_MODULE_0_babel_runtime_helpers_classCallCheck___default()(this, Test);

    return __WEBPACK_IMPORTED_MODULE_2_babel_runtime_helpers_possibleConstructorReturn___default()(this, (Test.__proto__ || Object.getPrototypeOf(Test)).apply(this, arguments));
  }

  __WEBPACK_IMPORTED_MODULE_1_babel_runtime_helpers_createClass___default()(Test, [{
    key: 'render',
    value: function render() {
      var props = {
        action: '/upload.do',
        type: 'drag',
        accept: '.png',
        beforeUpload: function beforeUpload(file) {
          console.log('beforeUpload', file.name);
        },

        onStart: function onStart(file) {
          console.log('onStart', file.name);
        },
        onSuccess: function onSuccess(file) {
          console.log('onSuccess', file);
        },
        onProgress: function onProgress(step, file) {
          console.log('onProgress', Math.round(step.percent), file.name);
        },
        onError: function onError(err) {
          console.log('onError', err);
        },

        style: { display: 'inline-block', width: 200, height: 200, background: '#eee' }
      };
      return __WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_6_rc_upload___default.a, props);
    }
  }]);

  return Test;
}(__WEBPACK_IMPORTED_MODULE_4_react___default.a.Component);

__WEBPACK_IMPORTED_MODULE_5_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_4_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[130]);
//# sourceMappingURL=drag.js.map