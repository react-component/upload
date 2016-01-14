import React, {PropTypes} from 'react';
import AjaxUpload from './AjaxUploader';
import IframeUpload from './IframeUploader';

function empty() {
}

const Upload = React.createClass({
  propTypes: {
    forceAjax: PropTypes.bool,
    action: PropTypes.string,
    name: PropTypes.string,
    multipart: PropTypes.bool,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    onProgress: PropTypes.func,
    onStart: PropTypes.func,
    data: PropTypes.object,
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
      forceAjax: false,
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

  render() {
    const props = this.props;
    // node 渲染根据 ua 强制设置 forceAjax 或者支持FormData的情况使用AjaxUpload
    if (props.forceAjax || typeof FormData !== 'undefined') {
      return <AjaxUpload {...props} />;
    }

    return <IframeUpload {...props} />;
  },
});

export default Upload;
