import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AjaxUpload from './AjaxUploader';
import IframeUpload from './IframeUploader';

function empty() {
}

class Upload extends Component {
  static propTypes = {
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    action: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    name: PropTypes.string,
    multipart: PropTypes.bool,
    directory: PropTypes.bool,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    onProgress: PropTypes.func,
    onStart: PropTypes.func,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    headers: PropTypes.object,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    disabled: PropTypes.bool,
    beforeUpload: PropTypes.func,
    customRequest: PropTypes.func,
    onReady: PropTypes.func,
    withCredentials: PropTypes.bool,
    supportServerRender: PropTypes.bool,
    openFileDialogOnClick: PropTypes.bool,
  }

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
    supportServerRender: false,
    multiple: false,
    beforeUpload: null,
    customRequest: null,
    withCredentials: false,
    openFileDialogOnClick: true,
  }

  state = {
    Component: null,
  }

  componentDidMount() {
    if (this.props.supportServerRender) {
      /* eslint react/no-did-mount-set-state:0 */
      this.setState({
        Component: this.getComponent(),
      }, this.props.onReady);
    }
  }

  getComponent() {
    return typeof File !== 'undefined' ? AjaxUpload : IframeUpload;
  }

  abort(file) {
    this.uploader.abort(file);
  }

  saveUploader = (node) => {
    this.uploader = node;
  }

  render() {
    if (this.props.supportServerRender) {
      const ComponentUploader = this.state.Component;
      if (ComponentUploader) {
        return <ComponentUploader {...this.props} ref={this.saveUploader} />;
      }
      return null;
    }
    const ComponentUploader = this.getComponent();
    return <ComponentUploader {...this.props} ref={this.saveUploader} />;
  }
}

export default Upload;
