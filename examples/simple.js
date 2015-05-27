/** @jsx React.DOM */
// use jsx to render html, do not modify simple.html
var React = require('react');
var Upload = require('../lib/upload');
var props = {
  action: '/upload.do',
  data: {a: 1, b: 2},
  onSuccess: function(ret) {
    console.log(ret);
  },
  onProgress: function(step) {
    console.log(step);
  }
};

React.render(<Upload {...props}><a href="#nowhere">开始上传</a></Upload>,
    document.getElementById('__react-content'));
