/* eslint no-console:0 */
import React from 'react';
import Upload from '@rc-component/upload';

const props = {
  action: () => {
    return new Promise<string>(resolve => {
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
        <Upload {...props}>
          <a>开始上传</a>
        </Upload>
      </div>
    </div>
  );
};

export default Test;
