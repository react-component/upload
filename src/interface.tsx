import * as React from 'react';

export interface UploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onError' | 'onProgress'> {
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  component?: React.JSXElementConstructor<any>;
  action?: string | ((file: RcFile) => string);
  method?: UploadRequestMethod;
  directory?: boolean;
  data?: object | ((file: RcFile | string | Blob) => object);
  headers?: UploadRequestHeader;
  accept?: string;
  multiple?: boolean;
  onStart?: (file: RcFile) => void;
  onError?: (error: Error, ret: object, file: RcFile) => void;
  onSuccess?: (response: object, file: RcFile, xhr: object) => void;
  onProgress?: (event: UploadProgressEvent, file: RcFile) => void;
  beforeUpload?: (file: RcFile, FileList: RcFile[]) => boolean | Promise<RcFile>;
  customRequest?: () => void;
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  transformFile?: (file: RcFile) => string | Blob | RcFile | PromiseLike<string | Blob | RcFile>;
  prefixCls?: string;
  id?: string;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface UploadProgressEvent extends ProgressEvent {
  percent: number;
}

export type UploadRequestMethod = 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';

export interface UploadRequestHeader {
  [key: string]: string;
}

export interface UploadRequestError extends Error {
  status?: number;
  method?: UploadRequestMethod;
  url?: string;
}

export interface UploadRequestOption<T = any> {
  onProgress?: (event: UploadProgressEvent) => void;
  onError?: (event: UploadRequestError | ProgressEvent, body?: T) => void;
  onSuccess?: (body: T, xhr: XMLHttpRequest) => void;
  data?: object;
  filename?: string;
  file: RcFile;
  withCredentials?: boolean;
  action: string;
  headers?: UploadRequestHeader;
  method: UploadRequestMethod;
}

export interface RcFile extends File {
  uid: string;
}
