export interface UploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onError' | 'onProgress'> {
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  component?: React.JSXElementConstructor<any>;
  action?: string | ((file: File) => string);
  method?: UploadRequestMethod;
  directory?: boolean;
  data?: object | ((file: File | string | Blob) => object);
  headers?: UploadRequestHeader;
  accept?: string;
  multiple?: boolean;
  onStart?: (file: File) => void;
  onError?: (error: Error, ret: object, file: File) => void;
  onSuccess?: (response: object, file: File, xhr: object) => void;
  onProgress?: (event: UploadProgressEvent, file: File) => void;
  beforeUpload?: (file: File, FileList: File[]) => boolean | Promise<File>;
  customRequest?: () => void;
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  transformFile?: (file: File) => string | Blob | File | PromiseLike<string | Blob | File>;
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
  file: File;
  withCredentials?: boolean;
  action: string;
  headers?: UploadRequestHeader;
  method: UploadRequestMethod;
}
