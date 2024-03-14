/* eslint no-console:0 */
import React from 'react';
import Upload from 'rc-upload';

const props = {
  action: '/upload.do',
  type: 'drag',
  accept: '.png',
  beforeUpload(file) {
    console.log('beforeUpload', file.name);
  },
  onStart: file => {
    console.log('onStart', file.name);
  },
  onSuccess(file) {
    console.log('onSuccess', file);
  },
  onProgress(step, file) {
    console.log('onProgress', Math.round(step.percent), file.name);
  },
  onError(err) {
    console.log('onError', err);
  },
  style: { display: 'inline-block', width: 200, height: 200, background: '#eee' },
};

const Test = () => {
  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <div>
        <Upload {...props}>
          <a>开始上传</a>
        </Upload>
      </div>
    </div>
  );
};

export default Test;
