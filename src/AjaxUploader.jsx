import request from './request';
import React, { PropTypes } from 'react';
import getUid from './uid';

const AjaxUploader = React.createClass({
  propTypes: {
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    multiple: PropTypes.bool,
    onStart: PropTypes.func,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    headers: PropTypes.object,
    beforeUpload: PropTypes.func,
    withCredentials: PropTypes.bool,
  },

  getInitialState() {
    this.reqs = {};
    return {
      uid: getUid(),
    };
  },

  onChange(e) {
    const files = e.target.files;
    this.uploadFiles(files);
    this.reset();
  },

  onClick() {
    const el = this.refs.file;
    if (!el) {
      return;
    }
    el.click();
  },

  onKeyDown(e) {
    if (e.key === 'Enter') {
      this.onClick();
    }
  },

  onFileDrop(e) {
    if (e.type === 'dragover') {
      e.preventDefault();
      return;
    }

    const files = e.dataTransfer.files;
    this.uploadFiles(files);

    e.preventDefault();
  },

  uploadFiles(files) {
    let postFiles = Array.prototype.slice.call(files);
    if (!this.props.multiple) {
      postFiles = postFiles.slice(0, 1);
    }
    const len = postFiles.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const file = postFiles[i];
        file.uid = getUid();
        this.upload(file);
      }
      if (this.props.multiple) {
        this.props.onStart(postFiles);
      } else {
        this.props.onStart(postFiles[0]);
      }
    }
  },

  upload(file) {
    const props = this.props;
    if (!props.beforeUpload) {
      return this.post(file);
    }

    const before = props.beforeUpload(file);
    if (before && before.then) {
      before.then((processedFile) => {
        if (Object.prototype.toString.call(processedFile) === '[object File]') {
          this.post(processedFile);
        } else {
          this.post(file);
        }
      });
    } else if (before !== false) {
      this.post(file);
    }
  },

  post(file) {
    const props = this.props;
    let data = props.data;
    if (typeof data === 'function') {
      data = data(file);
    }
    const { uid } = file;
    this.reqs[uid] = request({
      action: props.action,
      filename: props.name,
      file: file,
      data: data,
      headers: props.headers,
      withCredentials: props.withCredentials,
      onProgress: e => {
        props.onProgress(e, file);
      },
      onSuccess: ret => {
        delete this.reqs[uid];
        props.onSuccess(ret, file);
      },
      onError: (err, ret) => {
        delete this.reqs[uid];
        props.onError(err, ret, file);
      },
    });
  },

  reset() {
    this.setState({
      uid: getUid(),
    });
  },

  abort(file) {
    let uid = file;
    if (file && file.uid) {
      uid = file.uid;
    }
    if (this.reqs[uid]) {
      this.reqs[uid].abort();
      delete this.reqs[uid];
    }
  },

  render() {
    const props = this.props;
    const Tag = this.props.component;
    return (
      <Tag
        onClick={this.onClick}
        onKeyDown={this.onKeyDown}
        onDrop={this.onFileDrop}
        onDragOver={this.onFileDrop}
        role="button"
        tabIndex="0"
        style={this.props.style}
        className={`${this.props.prefixCls}`}
      >
        <input
          type="file"
          ref="file"
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={props.accept}
          multiple={this.props.multiple}
          onChange={this.onChange}
        />
        {props.children}
      </Tag>
    );
  },
});

export default AjaxUploader;
