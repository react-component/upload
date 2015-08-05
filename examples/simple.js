// use jsx to render html, do not modify simple.html
var React = require('react');
var Upload = require('rc-upload');
var props = {
  action: '/upload.do',
  data: {a: 1, b: 2},
  onStart: function(file){
    console.log('onStart',file.name || file.value);
  },
  onSuccess: function(ret) {
    console.log('onSuccess',ret);
  },
  onProgress: function(step) {
    console.log('onProgress',step);
  }
};

React.render(<Upload {...props}><a href="#nowhere">开始上传</a></Upload>,
    document.getElementById('__react-content'));
