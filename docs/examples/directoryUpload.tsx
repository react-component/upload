/* eslint no-console:0 */

import React from 'react';
import Upload from '@rc-component/upload';

const Test = () => {
  const uploaderProps = {
    action: '/upload.do',
    data: { a: 1, b: 2 },
    directory: true,
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
  };

  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <div>
        <Upload {...uploaderProps}>
          <a>开始上传</a>
        </Upload>
      </div>
    </div>
  );
};

export default Test;
