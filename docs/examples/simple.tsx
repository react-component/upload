/* eslint no-console:0 */

import Upload, { type UploadProps } from '@rc-component/upload';
import React from 'react';

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        `;

const uploaderProps: UploadProps = {
  action: '/upload.do',
  data: { a: 1, b: 2 },
  multiple: true,
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
  capture: 'user',
};

const Test = () => {
  const [destroyed, setDestroyed] = React.useState(false);

  const destroy = () => {
    setDestroyed(true);
  };

  if (destroyed) {
    return null;
  }

  return (
    <div style={{ margin: 100 }}>
      <h2>固定位置</h2>
      <style>{style}</style>
      <div>
        <Upload {...uploaderProps}>
          <a>开始上传</a>
        </Upload>
      </div>
      <h2>滚动</h2>
      <div
        style={{
          height: 200,
          overflow: 'auto',
          border: '1px solid red',
        }}
      ></div>
      <div
        style={{
          height: 500,
        }}
      >
        <Upload {...uploaderProps} id="test" component="div" style={{ display: 'inline-block' }}>
          <a>开始上传2</a>
        </Upload>
      </div>
      <button type="button" onClick={destroy}>
        destroy
      </button>
    </div>
  );
};

export default Test;
