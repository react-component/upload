const React = require('react');
const request = require('superagent');
const uid = require('./uid');

const AjaxUploader = React.createClass({
  propTypes: {
    multiple: React.PropTypes.bool,
    onStart: React.PropTypes.func,
  },

  onChange(e) {
    const files = e.target.files;
    this.uploadFiles(files);
  },

  onClick() {
    const el = React.findDOMNode(this.refs.file);
    if (!el) {
      return;
    }
    el.click();
    el.value = '';
  },

  onFileDrop(e) {
    if (e.type === 'dragover') {
      return e.preventDefault();
    }

    const files = e.dataTransfer.files;
    this.uploadFiles(files);

    e.preventDefault();
  },

  render() {
    const hidden = {display: 'none'};
    const props = this.props;
    return (
      <span onClick={this.onClick} onDrop={this.onFileDrop} onDragOver={this.onFileDrop}>
        <input type="file"
               ref="file"
               style={hidden}
               accept={props.accept}
               multiple={this.props.multiple}
               onChange={this.onChange}/>
        {props.children}
      </span>
    );
  },

  uploadFiles(files) {
    const len = files.length;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const file = files.item(i);
        file.uid = uid();
        this.post(file);
      }
      if (this.props.multiple) {
        this.props.onStart(Array.prototype.slice.call(files));
      } else {
        this.props.onStart(Array.prototype.slice.call(files)[0]);
      }
    }
  },

  post(file) {
    const props = this.props;
    const req = request
      .post(props.action)
      .attach(props.name, file, file.name);

    for (const key in props.data) {
      if (props.data.hasOwnProperty(key)) {
        req.field(key, props.data[key]);
      }
    }

    function progress(e) {
      props.onProgress(e, file);
    }

    req.on('progress', progress);

    req.end((err, ret) => {
      req.off('progress', progress);
      if (err || ret.status !== 200) {
        props.onError(err, ret, file);
        return;
      }

      props.onSuccess(ret.body || ret.text, file);
    });
  },
});

module.exports = AjaxUploader;
