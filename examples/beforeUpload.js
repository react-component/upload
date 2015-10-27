var React = require('react');
var ReactDOM = require('react-dom');
var Upload = require('rc-upload');
var props = {
  action: '/upload.do',
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onError(err){
    console.log('onError', err);
  },
  beforeUpload(file) {
    return new Promise(function(resolve) {
      console.log('start check');
      setTimeout(function() {
        console.log('check finshed');
        resolve(file);
      }, 3000);
    })
  }
};

const Test = React.createClass({
  render() {
    return (<div style={{margin:100}}>
      <div>
        <Upload {...props}><a href="#nowhere">开始上传</a></Upload>
      </div>
    </div>);
  }
});

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
