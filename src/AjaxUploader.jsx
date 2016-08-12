import request from './request';
import React, { PropTypes } from 'react';
import getUid from './uid';

const AjaxUploader = React.createClass({
  propTypes: {
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    children: PropTypes.any,
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

  componentWillUnmount() {
    this.abort();
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
    const postFiles = Array.prototype.slice.call(files);
    const len = postFiles.length;
    for (let i = 0; i < len; i++) {
      const file = postFiles[i];
      file.uid = getUid();
      this.upload(file);
    }
  },

  upload(file) {
    const { props } = this;
    if (!props.beforeUpload) {
      // always async in case use react state to keep fileList
      return setTimeout(() => this.post(file), 0);
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
      setTimeout(() => this.post(file), 0);
    }
  },

  post(file) {
    const { props } = this;
    let { data } = props;
    const { onStart } = props;
    if (typeof data === 'function') {
      data = data(file);
    }
    const { uid } = file;
    this.reqs[uid] = request({
      action: props.action,
      filename: props.name,
      file,
      data,
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
    onStart(file);
  },

  reset() {
    this.setState({
      uid: getUid(),
    });
  },

  abort(file) {
    const { reqs } = this;
    if (file) {
      let uid = file;
      if (file && file.uid) {
        uid = file.uid;
      }
      if (reqs[uid]) {
        reqs[uid].abort();
        delete reqs[uid];
      }
    } else {
      Object.keys(reqs).forEach((uid) => {
        reqs[uid].abort();
        delete reqs[uid];
      });
    }
  },

  render() {
    const {
      component: Tag, prefixCls, disabled,
      style, multiple, accept, children,
    } = this.props;
    const events = disabled ? {
      className: `${prefixCls} ${prefixCls}-disabled`,
    } : {
      className: `${prefixCls}`,
      onClick: this.onClick,
      onKeyDown: this.onKeyDown,
      onDrop: this.onFileDrop,
      onDragOver: this.onFileDrop,
      tabIndex: '0',
    };
    return (
      <Tag
        {...events}
        role="button"
        style={style}
      >
        <input
          type="file"
          ref="file"
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={accept}
          multiple={multiple}
          onChange={this.onChange}
        />
        {children}
      </Tag>
    );
  },
});

export default AjaxUploader;
