'use strict';
var React = require('react');
var request = require('superagent');

var AjaxUploader = React.createClass({

  _onChange: function(e) {
    var files = e.target.files;
    this._uploadFiles(files);
  },

  _onClick: function() {
    var el = React.findDOMNode(this.refs.file);
    if (!el) {
      return;
    }
    el.click();
    el.value = '';
  },

  _uploadFiles: function(files) {
    var len = files.length;
    if (len > 0) {
      for (var i = 0; i < len; i++) {
        var file = files.item(i);
        this._post(file);
      }
    }
  },

  _post: function(file) {

    var props = this.props;
    var req = request
      .post(props.action)
      .attach(props.name, file, file.name);

    for (var key in props.data) {
      req.field(key, props.data[key]);
    }

    req.on('progress', props.onProgress);

    req.end(function(err, ret) {
      req.off('progress', props.onProgress);
      if (err || ret.status !== 200) {
        var message = err ? err.message : ret.text;
        props.onError(message, file);
        return;
      }

      props.onSuccess(ret.body || ret.text, file);
    });
  },

  render: function() {
    var hidden = {display: 'none'};
    var props = this.props;
    return (
      <span onClick={this._onClick}>
        <input type="file"
        ref="file" style={hidden}
        accept={props.accept} onChange={this._onChange}/>
        {props.children}
      </span>
    );
  }
});

module.exports = AjaxUploader;
