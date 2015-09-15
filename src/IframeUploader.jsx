const React = require('react');
const uid = require('./uid');

const formStyle = {
  position: 'absolute',
  overflow: 'hidden',
  top: 0,
};
const boxStyle = {
  position: 'relative',
};
const inputStyle = {
  position: 'absolute',
  filter: 'alpha(opacity=0)',
  outline: 0,
  right: 0,
  top: 0,
  fontSize: 100,
};

const IframeUploader = React.createClass({
  propTypes: {
    onStart: React.PropTypes.func,
  },

  getInitialState() {
    return {
      width: 20,
      height: 12,
      uid: 1,
    };
  },

  componentDidMount() {
    const el = React.findDOMNode(this);
    // Fix render bug in IE
    setTimeout(() => {
      this.setState({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }, 0);
  },

  onLoad(e) {
    // ie8里面render方法会执行onLoad，应该是bug
    if (!this.startUpload || !this.file) {
      return;
    }

    const iframe = e.target;
    const props = this.props;
    let response;
    try {
      response = iframe.contentDocument.body.innerHTML;
      props.onSuccess(response, this.file);
    } catch (err) {
      response = 'cross-domain';
      props.onError(err, null, this.file);
    }

    this.startUpload = false;
    this.file = null;

    this.setState({
      uid: this.state.uid + 1,
    });
  },

  onChange(e) {
    this.startUpload = true;
    this.file = (e.target.files && e.target.files[0]) || e.target;
    // ie8/9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    this.file.name = this.file.name || e.target.value;
    this.file.uid = uid();
    this.props.onStart(this.file);
    React.findDOMNode(this.refs.form).submit();
  },

  getIframe() {
    const name = this.getName();
    const hidden = {display: 'none'};
    return (
      <iframe
        key={name}
        onLoad={this.onLoad}
        style={hidden}
        name={name}>
      </iframe>
    );
  },

  getName() {
    return 'iframe_uploader_' + this.state.uid;
  },

  render() {
    const props = this.props;
    const state = this.state;
    inputStyle.height = state.height;
    inputStyle.fontSize = Math.max(64, state.height * 5);
    formStyle.width = state.width;
    formStyle.height = state.height;

    const iframeName = this.getName();
    const iframe = this.getIframe();

    return (
      <span style={boxStyle}>
        <form action={props.action}
              target={iframeName}
              encType="multipart/form-data"
              ref="form"
              method="post" style={formStyle}>
          <input type="file"
                 style={inputStyle}
                 accept={props.accept}
                 onChange={this.onChange}
            />
        </form>
        {iframe}
        {props.children}
      </span>
    );
  },
});

module.exports = IframeUploader;
