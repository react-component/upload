import request from 'superagent';
import React, {PropTypes} from 'react';
import uid from './uid';

const AjaxUploader = React.createClass({
  propTypes: {
    multiple: PropTypes.bool,
    onStart: PropTypes.func,
    data: PropTypes.object,
    beforeUpload: PropTypes.func,
  },

  onChange(e) {
    const files = e.target.files;
    this.uploadFiles(files);
  },

  onClick() {
    const el = React.findDOMNode(this.refs.file);
    if (!el) {
      return;
    }
    el.click();
    el.value = '';
  },

  onKeyDown(e) {
    if (e.key === 'Enter') {
      this.onClick();
    }
  },

  onFileDrop(e) {
    if (e.type === 'dragover') {
      return e.preventDefault();
    }

    const files = e.dataTransfer.files;
    this.uploadFiles(files);

    e.preventDefault();
  },

  render() {
    const hidden = {display: 'none'};
    const props = this.props;
    return (
      <span onClick={this.onClick} onKeyDown={this.onKeyDown} onDrop={this.onFileDrop} onDragOver={this.onFileDrop}
            role="button" tabIndex="0">
        <input type="file"
               ref="file"
               style={hidden}
               accept={props.accept}
               multiple={this.props.multiple}
               onChange={this.onChange}/>
        {props.children}
      </span>
    );
  },

  uploadFiles(files) {
    const len = files.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const file = files.item(i);
        file.uid = uid();
        this.upload(file);
      }
      if (this.props.multiple) {
        this.props.onStart(Array.prototype.slice.call(files));
      } else {
        this.props.onStart(Array.prototype.slice.call(files)[0]);
      }
    }
  },

  upload(file) {
    const props = this.props;
    if (props.beforeUpload) {
      const before = props.beforeUpload(file);
      before.then && before.then(() => {
        this.post(file);
      });
      return;
    }

    this.post(file);
  },

  post(file) {
    const props = this.props;
    const req = request
      .post(props.action)
      .attach(props.name, file, file.name);
    let data = props.data;
    if (typeof data === 'function') {
      data = data();
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        req.field(key, data[key]);
      }
    }

    function progress(e) {
      props.onProgress(e, file);
    }

    req.on('progress', progress);

    req.end((err, ret) => {
      req.off('progress', progress);
      if (err || ret.status !== 200) {
        props.onError(err, ret, file);
        return;
      }

      props.onSuccess(ret.body || ret.text, file);
    });
  },
});

export default AjaxUploader;
