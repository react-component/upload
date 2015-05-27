'use strict';
var React = require('react');
var PropTypes = React.PropTypes;
var AjaxUpload = require('./AjaxUploader');
var IframeUpload = require('./IframeUploader');
var empty = function() {};

var Upload = React.createClass({

  propTypes: {
    action: PropTypes.string,
    name: PropTypes.string,
    multipart: PropTypes.bool,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    onProgress: PropTypes.func,
    data: PropTypes.object,
    accept: PropTypes.string
  },

  getDefaultProps: function() {
    return {
      data: {},
      name: 'file',
      multipart: false,
      onProgress: empty,
      onError: empty,
      onSuccess: empty
    };
  },

  render: function() {
    var props = this.props;
    if (window.FormData) {
      return <AjaxUpload {...props} />;
    }

    return <IframeUpload {...props} />;
  }
});

module.exports = Upload;
