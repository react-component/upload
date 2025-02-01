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
    onMouseEnter,
    onMouseLeave,
    hasControlInside,
    ...otherProps
  } = props;

  const [uid, setUid] = React.useState<string>(getUid());
  const [reqs, setReqs] = React.useState<Record<PropertyKey, any>>({});

  const isMountedRef = React.useRef<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const abort = React.useCallback(
    (file?: any) => {
      if (file) {
        const internalUid = file.uid ? file.uid : file;
        if (reqs[internalUid]?.abort) {
          reqs[internalUid].abort();
        }
        setReqs(prev => {
          const { [internalUid]: _, ...rest } = prev;
          return rest;
        });
      } else {
        Object.keys(reqs).forEach(key => {
          if (reqs[key]?.abort) {
            reqs[key].abort();
          }
          setReqs(prev => {
            const { [key]: _, ...rest } = prev;
            return rest;
          });
        });
      }
    },
    [reqs],
  );

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      abort();
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Process file before upload. When all the file is ready, we start upload.
   */
  const processFile = async (file: RcFile, fileList: RcFile[]): Promise<ParsedFileInfo> => {
    const { beforeUpload } = props;
    let transformedFile: BeforeUploadFileType | void = file;
    if (beforeUpload) {
      try {
        transformedFile = await beforeUpload(file, fileList);
      } catch {
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
    const { action } = props;
    let mergedAction: string;
    if (typeof action === 'function') {
      mergedAction = await action(file);
    } else {
      mergedAction = action;
    }

    // Get latest data
    const { data } = props;
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

  const post = ({ data, origin, action, parsedFile }: ParsedFileInfo) => {
    if (!isMountedRef.current) {
      return;
    }

    const { onStart, customRequest, headers, withCredentials, method } = props;

    const request = customRequest || defaultRequest;

    const requestOption: UploadRequestOption = {
      action,
      filename: name,
      data,
      file: parsedFile,
      headers,
      withCredentials,
      method: method || 'post',
      onProgress: (e: UploadProgressEvent) => {
        props.onProgress?.(e, parsedFile);
      },
      onSuccess: (ret: any, xhr: XMLHttpRequest) => {
        props.onSuccess?.(ret, parsedFile, xhr);
        setReqs(prev => {
          const { [origin.uid]: _, ...rest } = prev;
          return rest;
        });
      },
      onError: (err: UploadRequestError, ret: any) => {
        props.onError?.(err, ret, parsedFile);
        setReqs(prev => {
          const { [origin.uid]: _, ...rest } = prev;
          return rest;
        });
      },
    };
    onStart(origin);
    setReqs(prev => ({ ...prev, [origin.uid]: request(requestOption) }));
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
      fileList
        .filter(file => file.parsedFile !== null)
        .forEach(file => {
          post(file);
        });
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
    if (target?.tagName === 'BUTTON') {
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
      className={classnames(prefixCls, className, {
        [`${prefixCls}-disabled`]: disabled,
      })}
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
