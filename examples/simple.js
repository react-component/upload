const React = require('react');
const ReactDOM = require('react-dom');
const Upload = require('rc-upload');

// document.domain = 'alipay.net';

const style = `
        .rc-upload-disabled {
           opacity:0.5;
        `;

const Test = React.createClass({
  getInitialState() {
    this.uploaderProps = {
      action: '/upload.do',
      data: { a: 1, b: 2 },
      headers: {
        Authorization: 'xxxxxxx',
      },
      multiple: true,
      onStart: (files) => {
        const file = files[0];
        console.log('onStart', file.name);
        this.refs.inner.abort(file);
      },
      onSuccess(file) {
        console.log('onSuccess', file);
      },
      onProgress(step, file) {
        console.log('onProgress', file.name);
      },
      onError(err) {
        console.log('onError', err);
      },
    };
    return {
      destroyed: false,
    };
  },

  destroy() {
    this.setState({
      destroyed: true,
    });
  },

  render() {
    if (this.state.destroyed) {
      return null;
    }
    return (<div style={{
      margin: 100,
    }}>
      <h2>固定位置</h2>

      <style>
        {style}
      </style>

      <div>
        <Upload {...this.uploaderProps} ref="inner"><a href="#nowhere">开始上传</a></Upload>
      </div>

      <h2>滚动</h2>

      <div style={{
        height: 200,
        overflow: 'auto',
        border: '1px solid red',
      }}>
        <div style={{
          height: 500,
        }}>
          <Upload {...this.uploaderProps} component="div" style={{ display: 'inline-block' }}><a
            href="#nowhere">开始上传2</a></Upload>
        </div>
      </div>

      <button onClick={this.destroy}>destroy</button>
    </div>);
  },
});

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
