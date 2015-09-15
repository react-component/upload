const React = require('react');
const PropTypes = React.PropTypes;
const AjaxUpload = require('./AjaxUploader');
const IframeUpload = require('./IframeUploader');

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
    data: PropTypes.object,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      data: {},
      name: 'file',
      multipart: false,
      onProgress: empty,
      onStart: empty,
      onError: empty,
      onSuccess: empty,
      multiple: false,
    };
  },

  render() {
    const props = this.props;
    const isNode = typeof window === 'undefined';
    // node环境或者支持FormData的情况使用AjaxUpload
    if (isNode || typeof FormData !== 'undefined') {
      return <AjaxUpload {...props} />;
    }

    return <IframeUpload {...props} />;
  },
});

module.exports = Upload;
