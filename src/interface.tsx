import type * as React from 'react';

export type BeforeUploadFileType = File | Blob | boolean | string;

export type Action = string | ((file: RcFile) => string | PromiseLike<string>);

export interface UploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onError' | 'onProgress'> {
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  component?: React.ComponentType<any> | string;
  action?: Action;
  method?: UploadRequestMethod;
  /** @deprecated Please use `folder` instead */
  directory?: boolean;
  folder?: boolean;
  data?: Record<string, unknown> | ((file: RcFile | string | Blob) => Record<string, unknown>);
  headers?: UploadRequestHeader;
  accept?: string;
  multiple?: boolean;
  onBatchStart?: (
    fileList: { file: RcFile; parsedFile: Exclude<BeforeUploadFileType, boolean> }[],
  ) => void;
  onStart?: (file: RcFile) => void;
  onError?: (error: Error, ret: Record<string, unknown>, file: RcFile) => void;
  onSuccess?: (response: Record<string, unknown>, file: RcFile, xhr: XMLHttpRequest) => void;
  onProgress?: (event: UploadProgressEvent, file: RcFile) => void;
  beforeUpload?: (
    file: RcFile,
    FileList: RcFile[],
  ) => BeforeUploadFileType | Promise<void | BeforeUploadFileType> | void;
  customRequest?: (option: UploadRequestOption) => void | { abort: () => void };
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  prefixCls?: string;
  id?: string;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  classNames?: {
    input?: string;
  };
  styles?: {
    input?: React.CSSProperties;
  };
  hasControlInside?: boolean;
  pastable?: boolean;
}

export interface UploadProgressEvent extends Partial<ProgressEvent> {
  percent?: number;
}

export type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';

export type UploadRequestHeader = Record<string, string>;

export type UploadRequestFile = Exclude<BeforeUploadFileType, File | boolean> | RcFile;

export interface UploadRequestError extends Error {
  status?: number;
  method?: UploadRequestMethod;
  url?: string;
}

export interface UploadRequestOption<T = any> {
  onProgress?: (event: UploadProgressEvent, file?: UploadRequestFile) => void;
  onError?: (event: UploadRequestError | ProgressEvent, body?: T) => void;
  onSuccess?: (body: T, fileOrXhr?: UploadRequestFile | XMLHttpRequest) => void;
  data?: Record<string, unknown>;
  filename?: string;
  file: UploadRequestFile;
  withCredentials?: boolean;
  action: string;
  headers?: UploadRequestHeader;
  method: UploadRequestMethod;
}

export interface RcFile extends File {
  uid: string;
}
