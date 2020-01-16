/* eslint react/no-is-mounted:0,react/sort-comp:0,react/prop-types:0 */
import React, { Component } from 'react';
import classNames from 'classnames';
import defaultRequest from './request';
import getUid from './uid';
import attrAccept from './attr-accept';
import traverseFileTree from './traverseFileTree';

class AjaxUploader extends Component {
  state = { uid: getUid() }

  reqs = {}

  onChange = e => {
    const files = e.target.files;
    this.uploadFiles(files);
    this.reset();
  }

  onClick = () => {
    const el = this.fileInput;
    const parent = el.parentNode;
    const childrenType = this.props.children.type;
    if (childrenType === 'button') {
      parent.focus();
      parent.querySelector('button').blur();
    }
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
    const { multiple } = this.props;

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
      let files = Array.prototype.slice
        .call(e.dataTransfer.files)
        .filter(file => attrAccept(file, this.props.accept));

      if (multiple === false) {
        files = files.slice(0, 1);
      }

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
    postFiles
      .map(file => {
        file.uid = getUid();
        return file;
      })
      .forEach(file => {
        this.upload(file, postFiles);
      });
  };

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
    const {
      onStart,
      onProgress,
      transformFile = (originFile) => originFile,
    } = props;

    new Promise(resolve => {
      const { action } = props;
      if (typeof action === 'function') {
        return resolve(action(file));
      }
      resolve(action);
    }).then(action => {
      const { uid } = file;
      const request = props.customRequest || defaultRequest;
      const transform = Promise.resolve(transformFile(file)).catch(e => {
        console.error(e); // eslint-disable-line no-console
      });

      transform.then((transformedFile) => {
        if (typeof data === 'function') {
          data = data(file);
        }

        const requestOption = {
          action,
          filename: props.name,
          data,
          file: transformedFile,
          headers: props.headers,
          withCredentials: props.withCredentials,
          method: props.method || 'post',
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
        };
        this.reqs[uid] = request(requestOption);
        onStart(file);
      });
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
      if (reqs[uid] && reqs[uid].abort) {
        reqs[uid].abort();
      }
      delete reqs[uid];
    } else {
      Object.keys(reqs).forEach((uid) => {
        if (reqs[uid] && reqs[uid].abort) {
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
      onKeyDown: openFileDialogOnClick ? this.onKeyDown : () => { },
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
          onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
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
