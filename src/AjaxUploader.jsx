'use strict';
var React = require('react');
var request = require('superagent');
var uid = require('./uid');

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
        file.uid = uid();
        this._post(file);
      }
      if (this.props.multiple) {
        this.props.onStart(Array.prototype.slice.call(files));
      } else {
        this.props.onStart(Array.prototype.slice.call(files)[0]);
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

    var progress = function(e) {
      props.onProgress(e, file);
    };

    req.on('progress', progress);

    req.end(function(err, ret) {
      req.off('progress', progress);
      if (err || ret.status !== 200) {
        props.onError(err, ret, file);
        return;
      }

      props.onSuccess(ret.body || ret.text, file);
    });
  },

  _onFileDrop(e) {
    if (e.type === 'dragover') {
      return e.preventDefault();
    }

    var files = e.dataTransfer.files;
    this._uploadFiles(files);

    e.preventDefault();
  },

  render() {
    var hidden = {display: 'none'};
    var props = this.props;
    return (
      <span onClick={this._onClick} onDrop={this._onFileDrop} onDragOver={this._onFileDrop}>
        <input type="file"
        ref="file"
        style={hidden}
        accept={props.accept}
        multiple={this.props.multiple}
        onChange={this._onChange}/>
        {props.children}
      </span>
    );
  }
});

module.exports = AjaxUploader;
