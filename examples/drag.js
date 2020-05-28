webpackJsonp([3],{

/***/ 59:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(60);


/***/ }),

/***/ 60:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rc_upload__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rc_upload___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rc_upload__);
/* eslint no-console:0 */





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
  // openFileDialogOnClick: false
};

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_rc_upload___default.a, props), document.getElementById('__react-content'));

/***/ })

},[59]);
//# sourceMappingURL=drag.js.map