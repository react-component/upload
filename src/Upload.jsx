/* eslint react/prop-types:0 */
import React, { Component } from 'react';
import AjaxUpload from './AjaxUploader';

function empty() {
}

class Upload extends Component {
  static defaultProps = {
    component: 'span',
    prefixCls: 'rc-upload',
    data: {},
    headers: {},
    name: 'file',
    multipart: false,
    onReady: empty,
    onStart: empty,
    onError: empty,
    onSuccess: empty,
    multiple: false,
    beforeUpload: null,
    beforeMultipleUpload: null,
    customRequest: null,
    withCredentials: false,
    openFileDialogOnClick: true,
  }

  componentDidMount() {
    this.props.onReady();
  }

  abort(file) {
    this.uploader.abort(file);
  }

  saveUploader = (node) => {
    this.uploader = node;
  }

  render() {
    return <AjaxUpload {...this.props} ref={this.saveUploader} />;
  }
}

export default Upload;
