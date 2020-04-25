/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

const props = {
  action: '/upload.do',
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
  beforeMultipleUpload(fileList) {
    console.log(fileList);
    return new Promise((resolve) => {
      console.log('start check');
      setTimeout(() => {
        console.log('check finshed');
        resolve(fileList);
      }, 3000);
    });
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
