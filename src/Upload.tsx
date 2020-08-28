/* eslint react/prop-types:0 */
import React, { Component } from 'react';
import AjaxUpload from './AjaxUploader';

function empty() {}

export interface HttpRequestHeader {
  [key: string]: string;
}

export interface UploadProps {
  name?: string;
  style?: React.CSSProperties;
  className?: string;
  disabled?: boolean;
  component?: string;
  action?: string | ((file: File) => string);
  method?: 'POST' | 'PUT' | 'PATCH' | 'post' | 'put' | 'patch';
  directory?: boolean;
  data?: object | ((file: File | string | Blob) => object);
  headers?: HttpRequestHeader;
  accept?: string;
  multiple?: boolean;
  onStart?: (file: File) => void;
  onError?: (error: Error, ret: object, file: File) => void;
  onSuccess?: (response: object, file: File, xhr: object) => void;
  onProgress?: (event: { percent: number }, file: File) => void;
  beforeUpload?: (file: File, FileList: File[]) => boolean | PromiseLike<void>;
  customRequest?: () => void;
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
  transformFile?: (file: File) => string | Blob | File | PromiseLike<string | Blob | File>;
  prefixCls?: string;
  id?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: (e) => void;
}

class Upload extends Component<UploadProps> {
  static defaultProps = {
    component: 'span',
    prefixCls: 'rc-upload',
    data: {},
    headers: {},
    name: 'file',
    multipart: false,
    onStart: empty,
    onError: empty,
    onSuccess: empty,
    multiple: false,
    beforeUpload: null,
    customRequest: null,
    withCredentials: false,
    openFileDialogOnClick: true,
  };

  private uploader: any;

  abort(file) {
    this.uploader.abort(file);
  }

  saveUploader = node => {
    this.uploader = node;
  };

  render() {
    return <AjaxUpload {...this.props} ref={this.saveUploader} />;
  }
}

export default Upload;
