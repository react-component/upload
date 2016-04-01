import React, { PropTypes } from 'react';
import AjaxUpload from './AjaxUploader';
import IframeUpload from './IframeUploader';

function empty() {
}

const Upload = React.createClass({
  propTypes: {
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
    beforeUpload: PropTypes.func,
    withCredentials: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      data: {},
      headers: {},
      name: 'file',
      multipart: false,
      onProgress: empty,
      onStart: empty,
      onError: empty,
      onSuccess: empty,
      multiple: false,
      beforeUpload: null,
      withCredentials: false,
    };
  },

  getInitialState() {
    return {
      Component: null,
    };
  },

  componentDidMount() {
    /* eslint react/no-did-mount-set-state:0 */
    this.setState({
      Component: typeof FormData !== 'undefined' ? AjaxUpload : IframeUpload,
    });
  },

  render() {
    const { Component } = this.state;
    if (Component) {
      return <Component {...this.props} />;
    }
    return null;
  },
});

export default Upload;
