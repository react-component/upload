import React, { PropTypes } from 'react';
import AjaxUpload from './AjaxUploader';
import IframeUpload from './IframeUploader';

function empty() {
}

const Upload = React.createClass({
  propTypes: {
    component: PropTypes.string,
    style: PropTypes.object,
    prefixCls: PropTypes.string,
    action: PropTypes.string,
    name: PropTypes.string,
    multipart: PropTypes.bool,
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
  },

  getDefaultProps() {
    return {
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
    };
  },

  getInitialState() {
    return {
      Component: null,
    };
  },

  componentDidMount() {
    if (this.props.supportServerRender) {
      /* eslint react/no-did-mount-set-state:0 */
      this.setState({
        Component: this.getComponent(),
      }, this.props.onReady);
    }
  },
  getComponent() {
    return typeof FormData !== 'undefined' ? AjaxUpload : IframeUpload;
  },

  abort(file) {
    this.refs.inner.abort(file);
  },

  render() {
    if (this.props.supportServerRender) {
      const { Component } = this.state;
      if (Component) {
        return <Component {...this.props} ref="inner"/>;
      }
      return null;
    }
    const Component = this.getComponent();
    return <Component {...this.props} ref="inner"/>;
  },
});

export default Upload;
