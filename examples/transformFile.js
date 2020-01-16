webpackJsonp([1],{

/***/ 152:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(69);


/***/ }),

/***/ 69:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rc_upload__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rc_upload___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rc_upload__);
/* eslint no-console:0 */




var uploadProps = {
  action: '/upload.do',
  multiple: false,
  data: { a: 1, b: 2 },
  headers: {
    Authorization: '$prefix $token'
  },
  onStart: function onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess: function onSuccess(ret, file) {
    console.log('onSuccess', ret, file.name);
  },
  onError: function onError(err) {
    console.log('onError', err);
  },
  onProgress: function onProgress(_ref, file) {
    var percent = _ref.percent;

    console.log('onProgress', percent + '%', file.name);
  },
  transformFile: function transformFile(file) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        var canvas = document.createElement('canvas');
        var img = document.createElement('img');
        img.src = reader.result;
        img.onload = function () {
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(resolve);
        };
      };
    });
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
        uploadProps,
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'button',
          null,
          '\u5F00\u59CB\u4E0A\u4F20'
        )
      )
    )
  );
};

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(Test, null), document.getElementById('__react-content'));

/***/ })

},[152]);
//# sourceMappingURL=transformFile.js.map