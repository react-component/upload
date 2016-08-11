/* eslint no-console:0 */

const React = require('react');
const ReactDOM = require('react-dom');
const Upload = require('rc-upload');
const props = {
  action: '/upload.do',
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onError(err) {
    console.log('onError', err);
  },
  beforeUpload(file) {
    return new Promise((resolve) => {
      console.log('start check');
      setTimeout(() => {
        console.log('check finshed');
        resolve(file);
      }, 3000);
    });
  },
};

const Test = React.createClass({
  render() {
    return (
      <div
        style={{
          margin: 100,
        }}
      >
        <div>
          <Upload {...props}><a href="#nowhere">开始上传</a></Upload>
        </div>
      </div>
    );
  },
});

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
