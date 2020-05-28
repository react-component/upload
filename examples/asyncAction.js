webpackJsonp([6],{

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(17);


/***/ }),

/***/ 17:
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
  action: function action() {
    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve('/upload.do');
      }, 2000);
    });
  },
  multiple: true,
  onStart: function onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess: function onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onError: function onError(err) {
    console.log('onError', err);
  }
};

var Test = function Test() {
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    'div',
    {
      style: {
        margin: 100
      }
    },
    __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_2_rc_upload___default.a,
        props,
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'a',
          null,
          '\u5F00\u59CB\u4E0A\u4F20'
        )
      )
    )
  );
};

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[16]);
//# sourceMappingURL=asyncAction.js.map