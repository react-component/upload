/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.uploaderProps = {
      action: '/upload.do',
      data: { a: 1, b: 2 },
      headers: {
        Authorization: 'xxxxxxx',
      },
      directory: true,
      beforeUpload(file) {
        console.log('beforeUpload', file.name);
      },
      onStart: (file) => {
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
  }
  render() {
    return (<div
      style={{
        margin: 100,
      }}
    >

      <div>
        <Upload {...this.uploaderProps}><a>开始上传</a></Upload>
      </div>

    </div>);
  }
}

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
