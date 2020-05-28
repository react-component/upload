/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        `;

class Test extends React.Component {
  constructor(props) {
    super(props);
    this.uploaderProps = {
      action: '/upload.do',
      data: { a: 1, b: 2 },
      headers: {
        Authorization: 'xxxxxxx',
      },
      multiple: true,
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
    this.state = {
      destroyed: false,
    };
  }
  destroy = () => {
    this.setState({
      destroyed: true,
    });
  }
  render() {
    if (this.state.destroyed) {
      return null;
    }
    return (<div
      style={{
        margin: 100,
      }}
    >
      <h2>固定位置</h2>

      <style>
        {style}
      </style>

      <div>
        <Upload {...this.uploaderProps}><a>开始上传</a></Upload>
      </div>

      <h2>滚动</h2>

      <div
        style={{
          height: 200,
          overflow: 'auto',
          border: '1px solid red',
        }}
      >
        <div
          style={{
            height: 500,
          }}
        >
          <Upload
            {...this.uploaderProps}
            id="test"
            component="div"
            style={{ display: 'inline-block' }}
          >
            <a>开始上传2</a>
          </Upload>
        </div>

        <label htmlFor="test">Label for Upload</label>
      </div>

      <button onClick={this.destroy}>destroy</button>
    </div>);
  }
}

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
