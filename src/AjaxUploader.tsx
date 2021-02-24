/* eslint react/no-is-mounted:0,react/sort-comp:0,react/prop-types:0 */
import type { ReactElement } from 'react';
import React, { Component } from 'react';
import classNames from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import defaultRequest from './request';
import getUid from './uid';
import attrAccept from './attr-accept';
import traverseFileTree from './traverseFileTree';
import type {
  UploadProps,
  UploadProgressEvent,
  UploadRequestError,
  RcFile,
  BeforeUploadFileType,
} from './interface';

interface ParsedFileInfo {
  origin: RcFile;
  action: string;
  data: object;
  parsedFile: Exclude<BeforeUploadFileType, boolean>;
}

class AjaxUploader extends Component<UploadProps> {
  state = { uid: getUid() };

  reqs: any = {};

  private fileInput: HTMLInputElement;

  private _isMounted: boolean;

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    this.uploadFiles(files);
    this.reset();
  };

  onClick = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    const el = this.fileInput;
    if (!el) {
      return;
    }
    const { children, onClick } = this.props;
    if (children && (children as ReactElement).type === 'button') {
      const parent = el.parentNode as HTMLInputElement;
      parent.focus();
      parent.querySelector('button').blur();
    }
    el.click();
    if (onClick) {
      onClick(e);
    }
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      this.onClick(e);
    }
  };

  onFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const { multiple } = this.props;

    e.preventDefault();

    if (e.type === 'dragover') {
      return;
    }

    if (this.props.directory) {
      traverseFileTree(
        Array.prototype.slice.call(e.dataTransfer.items),
        this.uploadFiles,
        (_file: RcFile) => attrAccept(_file, this.props.accept),
      );
    } else {
      let files = Array.prototype.slice
        .call(e.dataTransfer.files)
        .filter((file: RcFile) => attrAccept(file, this.props.accept));

      if (multiple === false) {
        files = files.slice(0, 1);
      }

      this.uploadFiles(files);
    }
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
  }

  uploadFiles = (files: FileList) => {
    const originFiles = [...files] as RcFile[];
    const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
      // eslint-disable-next-line no-param-reassign
      file.uid = getUid();
      return this.processFile(file, originFiles);
    });

    // Batch upload files
    Promise.all(postFiles).then(fileList => {
      const { onBatchStart } = this.props;
      const enabledFiles = fileList.filter(file => file);

      onBatchStart?.(enabledFiles.map(file => file.origin));

      enabledFiles.forEach(file => {
        this.post(file);
      });
    });
  };

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  processFile = async (file: RcFile, fileList: RcFile[]): Promise<ParsedFileInfo> => {
    const { beforeUpload, action, data } = this.props;

    let transformedFile: BeforeUploadFileType | void = file;
    if (beforeUpload) {
      transformedFile = await beforeUpload(file, fileList);
      if (transformedFile === false) {
        return null;
      }
    }

    let mergedAction: string;
    if (typeof action === 'function') {
      mergedAction = await action(file);
    } else {
      mergedAction = action;
    }

    let mergedData: object;
    if (typeof data === 'function') {
      mergedData = await data(file);
    } else {
      mergedData = data;
    }

    const parsedFile =
      // string type is from legacy `transformFile`.
      // Not sure if this will work since no related test case works with it
      (typeof transformedFile === 'object' || typeof transformedFile === 'string') &&
      transformedFile
        ? transformedFile
        : file;

    // Used for `request.ts` get form data name
    if (!(parsedFile as any).name) {
      (parsedFile as any).name = file.name;
    }

    return {
      origin: file,
      data: mergedData,
      parsedFile,
      action: mergedAction,
    };
  };

  post({ data, origin, action, parsedFile }: ParsedFileInfo) {
    if (!this._isMounted) {
      return;
    }
    const { props } = this;
    const { onStart, onProgress } = props;

    const { uid } = origin;
    const request = props.customRequest || defaultRequest;

    const requestOption = {
      action,
      filename: props.name,
      data,
      file: parsedFile,
      headers: props.headers,
      withCredentials: props.withCredentials,
      method: props.method || 'post',
      onProgress: onProgress
        ? (e: UploadProgressEvent) => {
            onProgress(e, origin);
          }
        : null,
      onSuccess: (ret: any, xhr: XMLHttpRequest) => {
        delete this.reqs[uid];
        props.onSuccess(ret, origin, xhr);
      },
      onError: (err: UploadRequestError, ret: any) => {
        delete this.reqs[uid];
        props.onError(err, ret, origin);
      },
    };

    onStart(origin);
    this.reqs[uid] = request(requestOption);
  }

  reset() {
    this.setState({
      uid: getUid(),
    });
  }

  abort(file?: any) {
    const { reqs } = this;
    if (file) {
      const uid = file.uid ? file.uid : file;
      if (reqs[uid] && reqs[uid].abort) {
        reqs[uid].abort();
      }
      delete reqs[uid];
    } else {
      Object.keys(reqs).forEach(uid => {
        if (reqs[uid] && reqs[uid].abort) {
          reqs[uid].abort();
        }
        delete reqs[uid];
      });
    }
  }

  saveFileInput = (node: HTMLInputElement) => {
    this.fileInput = node;
  };

  render() {
    const {
      component: Tag,
      prefixCls,
      className,
      disabled,
      id,
      style,
      multiple,
      accept,
      children,
      directory,
      openFileDialogOnClick,
      onMouseEnter,
      onMouseLeave,
      ...otherProps
    } = this.props;
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [className]: className,
    });
    // because input don't have directory/webkitdirectory type declaration
    const dirProps: any = directory
      ? { directory: 'directory', webkitdirectory: 'webkitdirectory' }
      : {};
    const events = disabled
      ? {}
      : {
          onClick: openFileDialogOnClick ? this.onClick : () => {},
          onKeyDown: openFileDialogOnClick ? this.onKeyDown : () => {},
          onMouseEnter,
          onMouseLeave,
          onDrop: this.onFileDrop,
          onDragOver: this.onFileDrop,
          tabIndex: '0',
        };
    return (
      <Tag {...events} className={cls} role="button" style={style}>
        <input
          {...pickAttrs(otherProps, { aria: true, data: true })}
          id={id}
          type="file"
          ref={this.saveFileInput}
          onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={accept}
          {...dirProps}
          multiple={multiple}
          onChange={this.onChange}
        />
        {children}
      </Tag>
    );
  }
}

export default AjaxUploader;
