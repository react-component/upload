/* eslint-disable react-hooks/exhaustive-deps */
/* eslint react/no-is-mounted:0,react/sort-comp:0,react/prop-types:0 */
import classnames from 'classnames';
import pickAttrs from '@rc-component/util/lib/pickAttrs';
import React from 'react';
import attrAccept from './attr-accept';
import type {
  BeforeUploadFileType,
  RcFile,
  UploadProgressEvent,
  UploadProps,
  UploadRequestError,
  UploadRequestOption,
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

const AjaxUploader: React.FC<Readonly<React.PropsWithChildren<UploadProps>>> = props => {
  const {
    component: Tag,
    prefixCls,
    className,
    classNames = {},
    disabled,
    id,
    name,
    style,
    styles = {},
    multiple,
    accept,
    capture,
    children,
    directory,
    openFileDialogOnClick,
    hasControlInside,
    action,
    headers,
    withCredentials,
    method,
    onMouseEnter,
    onMouseLeave,
    data,
    beforeUpload,
    onStart,
    customRequest,
    ...otherProps
  } = props;

  const [uid, setUid] = React.useState<string>(getUid());

  const isMountedRef = React.useRef<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const reqsRef = React.useRef<Partial<Record<PropertyKey, any>>>({});

  const abort = React.useCallback((file?: any) => {
    if (file) {
      const internalUid = file.uid ? file.uid : file;
      if (reqsRef.current[internalUid]?.abort) {
        reqsRef.current[internalUid].abort();
      }
      reqsRef.current[internalUid] = undefined;
    } else {
      Object.keys(reqsRef.current).forEach(key => {
        if (reqsRef.current[key]?.abort) {
          reqsRef.current[key].abort();
        }
      });
      reqsRef.current = {};
    }
  }, []);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abort();
    };
  }, []);

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  const processFile = async (file: RcFile, fileList: RcFile[]): Promise<ParsedFileInfo> => {
    let transformedFile: BeforeUploadFileType | void = file;
    if (beforeUpload) {
      if (typeof beforeUpload === 'function') {
        transformedFile = await beforeUpload(file, fileList);
      } else {
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

    let mergedAction: string;
    if (typeof action === 'function') {
      mergedAction = await action(file);
    } else {
      mergedAction = action;
    }

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

  const post = (info: ParsedFileInfo) => {
    if (!isMountedRef.current) {
      return;
    }

    const { origin, parsedFile } = info;

    const request = customRequest || defaultRequest;

    const requestOption: UploadRequestOption = {
      action: info.action,
      filename: name,
      data: info.data,
      file: parsedFile,
      headers,
      withCredentials,
      method: method || 'post',
      onProgress: (e: UploadProgressEvent) => {
        props.onProgress?.(e, parsedFile);
      },
      onSuccess: (ret: any, xhr: XMLHttpRequest) => {
        props.onSuccess?.(ret, parsedFile, xhr);
        reqsRef.current[origin.uid] = undefined;
      },
      onError: (err: UploadRequestError, ret: any) => {
        props.onError?.(err, ret, parsedFile);
        reqsRef.current[origin.uid] = undefined;
      },
    };
    onStart(origin);
    reqsRef.current[origin.uid] = request(requestOption);
  };

  const uploadFiles = (files: File[]) => {
    const originFiles = [...files] as RcFile[];
    const postFiles = originFiles.map((file: RcFile & { uid?: string }) => {
      // eslint-disable-next-line no-param-reassign
      file.uid = getUid();
      return processFile(file, originFiles);
    });

    // Batch upload files
    Promise.all(postFiles).then(fileList => {
      props.onBatchStart?.(
        fileList.map(({ origin, parsedFile }) => ({ file: origin, parsedFile })),
      );
      fileList.filter(file => file.parsedFile !== null).forEach(file => post(file));
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    const acceptedFiles = [...files].filter(
      (file: RcFile) => !directory || attrAccept(file, accept),
    );
    uploadFiles(acceptedFiles);
    setUid(getUid());
  };

  const onClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>,
  ) => {
    if (!inputRef.current) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target?.tagName.toUpperCase() === 'BUTTON') {
      const parent = inputRef.current.parentNode as HTMLInputElement;
      parent.focus();
      target.blur();
    }
    inputRef.current.click();
    props.onClick?.(event);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      onClick(e);
    }
  };

  const onFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.type === 'dragover') {
      return;
    }
    if (directory) {
      const files = await traverseFileTree(
        Array.prototype.slice.call(e.dataTransfer.items),
        (f: RcFile) => attrAccept(f, accept),
      );
      uploadFiles(files);
    } else {
      const allFiles = [...e.dataTransfer.files].filter((file: RcFile) => attrAccept(file, accept));
      uploadFiles(multiple === false ? allFiles.slice(0, 1) : allFiles);
    }
  };

  // because input don't have directory/webkitdirectory type declaration
  const dirProps = directory ? { directory: 'directory', webkitdirectory: 'webkitdirectory' } : {};

  const events = disabled
    ? {}
    : {
        onClick: openFileDialogOnClick ? onClick : () => {},
        onKeyDown: openFileDialogOnClick ? onKeyDown : () => {},
        onMouseEnter,
        onMouseLeave,
        onDrop: onFileDrop,
        onDragOver: onFileDrop,
      };

  return (
    <Tag
      {...events}
      style={style}
      role={disabled || hasControlInside ? undefined : 'button'}
      tabIndex={disabled || hasControlInside ? undefined : 0}
      className={classnames(prefixCls, className, { [`${prefixCls}-disabled`]: disabled })}
    >
      <input
        {...pickAttrs(otherProps, { aria: true, data: true })}
        id={id}
        /**
         * https://github.com/ant-design/ant-design/issues/50643,
         * https://github.com/react-component/upload/pull/575#issuecomment-2320646552
         */
        name={name}
        disabled={disabled}
        type="file"
        ref={inputRef}
        onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
        key={uid}
        style={{ display: 'none', ...styles.input }}
        className={classNames.input}
        accept={accept}
        {...dirProps}
        multiple={multiple}
        onChange={onChange}
        {...(capture != null ? { capture } : {})}
      />
      {children}
    </Tag>
  );
};

if (process.env.NODE_ENV !== 'production') {
  AjaxUploader.displayName = 'AjaxUploader';
}

export default AjaxUploader;
