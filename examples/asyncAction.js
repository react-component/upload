/* eslint no-console:0 */
import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

const props = {
  action: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('/upload.do');
      }, 2000);
    });
  },
  multiple: true,
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onError(err) {
    console.log('onError', err);
  },
};

const Test = () => {
  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <div>
        <Upload {...props}><a>开始上传</a></Upload>
      </div>
    </div>
  );
};

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
