const React = require('react');
const uid = require('./uid');
const Align = require('rc-align');
const getComputedStyle = require('./getComputedStyle');

function findZIndex(n) {
  let node = n;
  let zIndex = 0;
  while (node.nodeName.toLowerCase() !== 'body') {
    if (getComputedStyle(node, 'position') !== 'static') {
      zIndex = parseInt(getComputedStyle(node, 'zIndex'), 10) || zIndex;
    }
    node = node.parentNode;
  }
  return zIndex;
}

const IframeUploader = React.createClass({
  propTypes: {
    onStart: React.PropTypes.func,
    getFormContainer: React.PropTypes.func,
    children: React.PropTypes.any,
  },

  getInitialState() {
    return {
      uid: 1,
      loading: false,
    };
  },

  getFormContainer() {
    const props = this.props;
    if (props.getFormContainer) {
      return props.getFormContainer();
    }
    if (this.formContainer) {
      return this.formContainer;
    }
    this.formContainer = document.createElement('div');
    document.body.appendChild(this.formContainer);
    return this.formContainer;
  },

  getFormElement() {
    const props = this.props;
    const trigger = React.findDOMNode(this);
    const width = trigger.offsetWidth;
    const height = trigger.offsetHeight;
    const iframeName = this.getIframeName();
    const iframe = this.getIframe();
    const cursor = this.state.loading ? 'default' : 'pointer';
    const formStyle = {
      position: 'absolute',
      overflow: 'hidden',
      width: width,
      height: height,
      cursor,
      opacity: 0,
      filter: 'alpha(opacity=0)',
      zIndex: findZIndex(trigger) + 1,
    };
    const inputStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      opacity: 0,
      filter: 'alpha(opacity=0)',
      outline: 0,
      cursor,
      height: height,
      fontSize: Math.max(64, height * 5),
    };
    return (<Align monitorWindowResize={true} align={{
      points: ['tl', 'tl'],
    }} target={this.getDOMNode}>
      <form action={props.action}
            target={iframeName}
            encType="multipart/form-data"
            method="post" style={formStyle}>
        <input type="file"
               disabled={this.state.loading}
               hideFocus="true"
               style={inputStyle}
               accept={props.accept}
               onChange={this.onChange}
          />
        {iframe}
      </form>
    </Align>);
  },

  componentDidMount() {
    const component = this;
    React.render(this.getFormElement(), this.getFormContainer(), function save() {
      component.formInstance = this;
    });
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.uid !== this.state.uid || prevState.loading !== this.state.loading) {
      const component = this;
      React.render(this.getFormElement(), this.getFormContainer(), function save() {
        component.formInstance = this;
      });
    }
  },

  componentWillUnmount() {
    if (this.formContainer) {
      React.unmountComponentAtNode(this.formContainer);
      document.body.removeChild(this.formContainer);
      this.formContainer = null;
    } else if (this.getFormContainer) {
      React.unmountComponentAtNode(this.getFormContainer());
    }
  },

  onLoad(e) {
    // ie8里面render方法会执行onLoad，应该是bug
    if (!this.state.loading || !this.file) {
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

    this.file = null;

    React.findDOMNode(this.formInstance).reset();

    this.setState({
      uid: this.state.uid + 1,
      loading: false,
    });
  },

  onChange(e) {
    this.setState({
      loading: true,
    });
    this.file = (e.target.files && e.target.files[0]) || e.target;
    // ie8/9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    try {
      this.file.name = this.file.name || e.target.value;
      this.file.uid = uid();
    } catch (ex) {
      if (typeof console !== 'undefined') {
        console.error(ex);
      }
    }
    this.props.onStart(this.file);
    React.findDOMNode(this.formInstance).submit();
  },

  getIframe() {
    const name = this.getIframeName();
    return (
      <iframe
        key={name}
        onLoad={this.onLoad}
        style={{display: 'none'}}
        name={name}/>
    );
  },

  getIframeName() {
    return 'iframe_uploader_' + this.state.uid;
  },

  render() {
    return this.props.children;
  },
});

module.exports = IframeUploader;
