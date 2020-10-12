/* eslint react/prop-types:0 */
import React, { Component } from 'react';
import AjaxUpload from './AjaxUploader';
import { UploadProps, RcFile } from './interface';

function empty() {}

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

  private uploader: AjaxUpload;

  abort(file: RcFile) {
    this.uploader.abort(file);
  }

  saveUploader = (node: AjaxUpload) => {
    this.uploader = node;
  };

  render() {
    return <AjaxUpload {...this.props} ref={this.saveUploader} />;
  }
}

export default Upload;
