'use strict';

var React = require('react');

var formStyle = {
  position: 'absolute',
  overflow: 'hidden',
  top: 0
};
var boxStyle = {
  position: 'relative'
};
var inputStyle = {
  position: 'absolute',
  filter: 'alpha(opacity=0)',
  outline: 0,
  right: 0,
  top: 0,
  fontSize: 100
};

var IframeUploader = React.createClass({

  getInitialState: function() {
    return {
      width: 20, height: 12, uid: 1
    };
  },

  componentDidMount: function() {
    var el = React.findDOMNode(this);
    this.setState({
      width: el.offsetWidth,
      height: el.offsetHeight
    });
  },

  _getName: function() {
    return 'iframe_uploader_' + this.state.uid;
  },

  _onload: function(e) {
    // ie8里面render方法会执行onLoad，应该是bug
    if (!this.startUpload || !this.file) {
      return;
    }

    var iframe = e.target;
    var props = this.props;
    var response;
    try {
      response = iframe.contentDocument.body.innerHTML;
      props.onSuccess(response, this.file);
    } catch (err) {
      response = 'cross-domain';
      props.onError(err);
    }

    this.startUpload = false;
    this.file = null;

    this.setState({
      uid: this.state.uid + 1
    });
  },

  _getIframe: function() {
    var name = this._getName();
    var hidden = {display: 'none'};
    return (
      <iframe
        key={name}
        onLoad={this._onload}
        style={hidden}
        name={name}>
      </iframe>
    );
  },

  _onChange: function(e) {
    this.startUpload = true;
    this.file = e.target.files[0];
    this.props.onStart(this.file);
    React.findDOMNode(this.refs.form).submit();
  },

  render: function() {
    var props = this.props;
    var state = this.state;
    inputStyle.height = state.height;
    inputStyle.fontSize = Math.max(64, state.height * 5);
    formStyle.width = state.width;
    formStyle.height = state.height;

    var iframeName = this._getName();
    var iframe = this._getIframe();

    return (
      <span style={boxStyle}>
        <form action={props.action}
          target={iframeName}
          encType="multipart/form-data"
          ref="form"
          method="post" style={formStyle}>
          <input type="file"
            style={inputStyle}
            accept={props.accept}
            onChange={this._onChange}
          />
        </form>
        {iframe}
        {props.children}
      </span>
    );
  }
});

module.exports = IframeUploader;
