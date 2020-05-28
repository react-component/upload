/* eslint no-console:0 */
import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

const uploadProps = {
  action: '/upload.do',
  multiple: false,
  data: { a: 1, b: 2 },
  headers: {
    Authorization: '$prefix $token',
  },
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret, file) {
    console.log('onSuccess', ret, file.name);
  },
  onError(err) {
    console.log('onError', err);
  },
  onProgress({ percent }, file) {
    console.log('onProgress', `${percent}%`, file.name);
  },
  transformFile(file) {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const canvas = document.createElement('canvas');
        const img = document.createElement('img');
        img.src = reader.result;
        img.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(resolve);
        };
      };
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
        <Upload {...uploadProps}>
          <button>开始上传</button>
        </Upload>
      </div>
    </div>
  );
};

ReactDOM.render(<Test />, document.getElementById('__react-content'));
