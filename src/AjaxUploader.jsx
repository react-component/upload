/* eslint react/no-is-mounted:0 react/sort-comp:0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import defaultRequest from './request';
import getUid from './uid';
import attrAccept from './attr-accept';
import traverseFileTree from './traverseFileTree';

class AjaxUploader extends Component {
  static propTypes = {
    id: PropTypes.string,
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    directory: PropTypes.bool,
    disabled: PropTypes.bool,
    accept: PropTypes.string,
    children: PropTypes.any,
    onStart: PropTypes.func,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    action: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    headers: PropTypes.object,
    beforeUpload: PropTypes.func,
    customRequest: PropTypes.func,
    onProgress: PropTypes.func,
    withCredentials: PropTypes.bool,
    openFileDialogOnClick: PropTypes.bool,
  }

  state = { uid: getUid() }

  reqs = {}

  onChange = e => {
    const files = e.target.files;
    this.uploadFiles(files);
    this.reset();
  }

  onClick = () => {
    const el = this.fileInput;
    if (!el) {
      return;
    }
    el.click();
  }

  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.onClick();
    }
  }

  onFileDrop = e => {
    e.preventDefault();

    if (e.type === 'dragover') {
      return;
    }

    if (this.props.directory) {
      traverseFileTree(
        e.dataTransfer.items,
        this.uploadFiles,
        _file => attrAccept(_file, this.props.accept)
      );
    } else {
      const files = Array.prototype.slice.call(e.dataTransfer.files).filter(
        file => attrAccept(file, this.props.accept)
      );
      this.uploadFiles(files);
    }
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
  }

  uploadFiles = (files) => {
    const postFiles = Array.prototype.slice.call(files);
    postFiles.forEach((file) => {
      file.uid = getUid();
      this.upload(file, postFiles);
    });
  }

  upload(file, fileList) {
    const { props } = this;
    if (!props.beforeUpload) {
      // always async in case use react state to keep fileList
      return setTimeout(() => this.post(file), 0);
    }

    const before = props.beforeUpload(file, fileList);
    if (before && before.then) {
      before.then((processedFile) => {
        const processedFileType = Object.prototype.toString.call(processedFile);
        if (processedFileType === '[object File]' || processedFileType === '[object Blob]') {
          return this.post(processedFile);
        }
        return this.post(file);
      }).catch(e => {
        console && console.log(e); // eslint-disable-line
      });
    } else if (before !== false) {
      setTimeout(() => this.post(file), 0);
    }
  }

  post(file) {
    if (!this._isMounted) {
      return;
    }
    const { props } = this;
    let { data } = props;
    const { onStart, onProgress } = props;
    if (typeof data === 'function') {
      data = data(file);
    }
    new Promise(resolve => {
      const { action } = props;
      if (typeof action === 'function') {
        return resolve(action(file));
      }
      resolve(action);
    }).then(action => {
      const { uid } = file;
      const request = props.customRequest || defaultRequest;
      this.reqs[uid] = request({
        action,
        filename: props.name,
        file,
        data,
        headers: props.headers,
        withCredentials: props.withCredentials,
        onProgress: onProgress ? e => {
          onProgress(e, file);
        } : null,
        onSuccess: (ret, xhr) => {
          delete this.reqs[uid];
          props.onSuccess(ret, file, xhr);
        },
        onError: (err, ret) => {
          delete this.reqs[uid];
          props.onError(err, ret, file);
        },
      });
      onStart(file);
    });
  }

  reset() {
    this.setState({
      uid: getUid(),
    });
  }

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
        if (reqs[uid]) {
          reqs[uid].abort();
        }

        delete reqs[uid];
      });
    }
  }

  saveFileInput = (node) => {
    this.fileInput = node;
  }

  render() {
    const {
      component: Tag, prefixCls, className, disabled, id,
      style, multiple, accept, children, directory, openFileDialogOnClick,
    } = this.props;
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [className]: className,
    });
    const events = disabled ? {} : {
      onClick: openFileDialogOnClick ? this.onClick : () => { },
      onKeyDown: this.onKeyDown,
      onDrop: this.onFileDrop,
      onDragOver: this.onFileDrop,
      tabIndex: '0',
    };
    return (
      <Tag
        {...events}
        className={cls}
        role="button"
        style={style}
      >
        <input
          id={id}
          type="file"
          ref={this.saveFileInput}
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={accept}
          directory={directory ? 'directory' : null}
          webkitdirectory={directory ? 'webkitdirectory' : null}
          multiple={multiple}
          onChange={this.onChange}
        />
        {children}
      </Tag>
    );
  }
}

export default AjaxUploader;
