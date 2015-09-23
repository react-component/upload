var React = require('react');
var Upload = require('rc-upload');
var props = {
  action: '/upload.do',
  data: {a: 1, b: 2},
  multiple: true,
  beforeStart(files,loader) {
    const file = files[0];
    console.log('beforeStart', file, file.name);

    //模拟异步校验
    setTimeout(function () {
      console.log('在这里可以进行异步校验，甚至自行更改要上传的files');
      //截断上传过程后必须自己手工提交
      loader.uploadFiles(files);
    },3000);

    //截断上传过程
    return false;
  },
  onStart(files) {
    const file = files[0];
    console.log('onStart', file, file.name);
  },
  onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onProgress(step, file) {
    console.log('onProgress', step, file);
  },
  onError(err){
    console.log('onError', err);
  }
};

// document.domain = 'alipay.net';

const Test = React.createClass({
  getInitialState(){
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
    return (<div style={{margin:100}}>
      <h2>固定位置</h2>

      <div>
        <Upload {...props}><a href="#nowhere">开始上传</a></Upload>
      </div>

      <h2>滚动</h2>

      <div style={{height:200,overflow:'auto',border:'1px solid red'}}>
        <div style={{height:500}}>
          <Upload {...props}><a href="#nowhere">开始上传2</a></Upload>
        </div>
      </div>

      <button onClick={this.destroy}>destroy</button>
    </div>);
  }
});

React.render(<Test/>, document.getElementById('__react-content'));
