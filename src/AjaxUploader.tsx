/* eslint react/no-is-mounted:0,react/sort-comp:0,react/prop-types:0 */
import clsx from 'classnames';
import pickAttrs from 'rc-util/lib/pickAttrs';
import React, { Component } from 'react';
import attrAccept from './attr-accept';
import type {
  BeforeUploadFileType,
  RcFile,
  UploadProgressEvent,
  UploadProps,
  UploadRequestError,
} from './interface';
import defaultRequest from './request';
import traverseFileTree from './traverseFileTree';
import getUid from './uid';

interface ParsedFileInfo {
  origin: RcFile;
  action: string;
  data: Record<string, unknown>;
  parsedFile: RcFile;
}

class AjaxUploader extends Component<UploadProps> {
  state = { uid: getUid() };

  reqs: any = {};

  private fileInput: HTMLInputElement;

  private isMouseEnter: boolean;

  private _isMounted: boolean;

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { accept, directory } = this.props;
    const { files } = e.target;
    const acceptedFiles = [...files].filter(
      (file: RcFile) => !directory || attrAccept(file, accept),
    );
    this.uploadFiles(acceptedFiles);
    this.reset();
  };

  onClick = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
    const el = this.fileInput;
    if (!el) {
      return;
    }

    const target = event.target as HTMLElement;
    const { onClick } = this.props;

    if (target && target.tagName === 'BUTTON') {
      const parent = el.parentNode as HTMLInputElement;
      parent.focus();
      target.blur();
    }
    el.click();
    if (onClick) {
      onClick(event);
    }
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      this.onClick(e);
    }
  };

  onFileDropOrPaste = (e: React.DragEvent<HTMLDivElement> | ClipboardEvent) => {
    e.preventDefault();

    if (e.type === 'dragover') {
      return;
    }

    const { multiple, accept, directory } = this.props;
    let items: DataTransferItem[] = [];
    let files: File[] = [];

    if (e.type === 'drop') {
      const dataTransfer = (e as React.DragEvent<HTMLDivElement>).dataTransfer;
      items = [...(dataTransfer.items || [])];
      files = [...(dataTransfer.files || [])];
    } else if (e.type === 'paste') {
      const clipboardData = (e as ClipboardEvent).clipboardData;
      items = [...(clipboardData.items || [])];
      files = [...(clipboardData.files || [])];
    }

    if (directory) {
      traverseFileTree(Array.prototype.slice.call(items), this.uploadFiles, (_file: RcFile) =>
        attrAccept(_file, accept),
      );
    } else {
      let acceptFiles = [...files].filter((file: RcFile) => attrAccept(file, accept));

      if (multiple === false) {
        acceptFiles = files.slice(0, 1);
      }

      this.uploadFiles(acceptFiles);
    }
  };

  onPrePaste(e: ClipboardEvent) {
    if (this.isMouseEnter) {
      this.onFileDropOrPaste(e);
    }
  }

  componentDidMount() {
    this._isMounted = true;
    document.addEventListener('paste', this.onPrePaste.bind(this));
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
    document.removeEventListener('paste', this.onPrePaste.bind(this));
  }

  uploadFiles = (files: File[]) => {
    const originFiles = [...files] as RcFile[];
    const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
      // eslint-disable-next-line no-param-reassign
      file.uid = getUid();
      return this.processFile(file, originFiles);
    });

    // Batch upload files
    Promise.all(postFiles).then(fileList => {
      const { onBatchStart } = this.props;

      onBatchStart?.(fileList.map(({ origin, parsedFile }) => ({ file: origin, parsedFile })));

      fileList
        .filter(file => file.parsedFile !== null)
        .forEach(file => {
          this.post(file);
        });
    });
  };

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  processFile = async (file: RcFile, fileList: RcFile[]): Promise<ParsedFileInfo> => {
    const { beforeUpload } = this.props;

    let transformedFile: BeforeUploadFileType | void = file;
    if (beforeUpload) {
      try {
        transformedFile = await beforeUpload(file, fileList);
      } catch (e) {
        // Rejection will also trade as false
        transformedFile = false;
      }
      if (transformedFile === false) {
        return {
          origin: file,
          parsedFile: null,
          action: null,
          data: null,
        };
      }
    }

    // Get latest action
    const { action } = this.props;
    let mergedAction: string;
    if (typeof action === 'function') {
      mergedAction = await action(file);
    } else {
      mergedAction = action;
    }

    // Get latest data
    const { data } = this.props;
    let mergedData: Record<string, unknown>;
    if (typeof data === 'function') {
      mergedData = await data(file);
    } else {
      mergedData = data;
    }

    const parsedData =
      // string type is from legacy `transformFile`.
      // Not sure if this will work since no related test case works with it
      (typeof transformedFile === 'object' || typeof transformedFile === 'string') &&
      transformedFile
        ? transformedFile
        : file;

    let parsedFile: File;
    if (parsedData instanceof File) {
      parsedFile = parsedData;
    } else {
      parsedFile = new File([parsedData], file.name, { type: file.type });
    }

    const mergedParsedFile: RcFile = parsedFile as RcFile;
    mergedParsedFile.uid = file.uid;

    return {
      origin: file,
      data: mergedData,
      parsedFile: mergedParsedFile,
      action: mergedAction,
    };
  };

  post({ data, origin, action, parsedFile }: ParsedFileInfo) {
    if (!this._isMounted) {
      return;
    }

    const { onStart, customRequest, name, headers, withCredentials, method } = this.props;

    const { uid } = origin;
    const request = customRequest || defaultRequest;

    const requestOption = {
      action,
      filename: name,
      data,
      file: parsedFile,
      headers,
      withCredentials,
      method: method || 'post',
      onProgress: (e: UploadProgressEvent) => {
        const { onProgress } = this.props;
        onProgress?.(e, parsedFile);
      },
      onSuccess: (ret: any, xhr: XMLHttpRequest) => {
        const { onSuccess } = this.props;
        onSuccess?.(ret, parsedFile, xhr);

        delete this.reqs[uid];
      },
      onError: (err: UploadRequestError, ret: any) => {
        const { onError } = this.props;
        onError?.(err, ret, parsedFile);

        delete this.reqs[uid];
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

  handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    this.isMouseEnter = true;

    this.props.onMouseEnter?.(e);
  };

  handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    this.isMouseEnter = false;

    this.props.onMouseLeave?.(e);
  };

  render() {
    const {
      component: Tag,
      prefixCls,
      className,
      classNames = {},
      disabled,
      id,
      style,
      styles = {},
      multiple,
      accept,
      capture,
      children,
      directory,
      openFileDialogOnClick,
      hasControlInside,
      ...otherProps
    } = this.props;
    const cls = clsx({
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
          onMouseEnter: this.handleMouseEnter,
          onMouseLeave: this.handleMouseLeave,
          onDrop: this.onFileDropOrPaste,
          onDragOver: this.onFileDropOrPaste,
          tabIndex: hasControlInside ? undefined : '0',
        };
    return (
      <Tag {...events} className={cls} role={hasControlInside ? undefined : 'button'} style={style}>
        <input
          {...pickAttrs(otherProps, { aria: true, data: true })}
          id={id}
          disabled={disabled}
          type="file"
          ref={this.saveFileInput}
          onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
          key={this.state.uid}
          style={{ display: 'none', ...styles.input }}
          className={classNames.input}
          accept={accept}
          {...dirProps}
          multiple={multiple}
          onChange={this.onChange}
          {...(capture != null ? { capture } : {})}
        />
        {children}
      </Tag>
    );
  }
}

export default AjaxUploader;
