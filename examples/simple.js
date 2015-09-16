var React = require('react');
var Upload = require('rc-upload');
var props = {
  action: '/upload.do',
  data: {a: 1, b: 2},
  multiple: true,
  onStart(file) {
    console.log('onStart', file.name || file.value);
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

  getFormContainer(){
    return document.getElementById('container');
  },

  render() {
    if (this.state.destroyed) {
      return null;
    }
    return (<div>
      <h2>固定位置</h2>

      <div>
        <Upload {...props}><a href="#nowhere">开始上传</a></Upload>
      </div>

      <h2>滚动</h2>

      <div style={{height:200,overflow:'auto',border:'1px solid red'}}>
        <div style={{height:500,position:'relative'}}>
          <div id="container"></div>
          <Upload {...props} getFormContainer={this.getFormContainer}><a href="#nowhere">开始上传2</a></Upload>
        </div>
      </div>

      <button onClick={this.destroy}>destroy</button>
    </div>);
  }
});

React.render(<Test/>, document.getElementById('__react-content'));
