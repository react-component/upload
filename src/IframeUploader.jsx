const React = require('react');
const uid = require('./uid');
const Align = require('rc-align');
let iframeCount = 0;

const IframeUploader = React.createClass({
  propTypes: {
    onStart: React.PropTypes.func,
    getFormContainer: React.PropTypes.func,
    children: React.PropTypes.any,
    formZIndex: React.PropTypes.number,
    data: React.PropTypes.object,
  },

  getInitialState() {
    this.iframeCount = iframeCount++;
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
      zIndex: props.formZIndex,
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
               name={props.name}
               disabled={this.state.loading}
               hideFocus="true"
               style={inputStyle}
               accept={props.accept}
               onChange={this.onChange}
          /><span />
        {iframe}
      </form>
    </Align>);
  },

  updateForm() {
    const component = this;
    React.render(this.getFormElement(), this.getFormContainer(), function save() {
      component.formInstance = this;
    });
  },

  componentDidMount() {
    this.updateForm();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState.uid !== this.state.uid || prevState.loading !== this.state.loading) {
      this.updateForm();
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
      this.file.name = e.target.value;
      this.file.uid = uid();
    } catch (ex) {
      if (typeof console !== 'undefined') {
        console.error(ex);
      }
    }
    this.props.onStart(this.file);
    const formNode = React.findDOMNode(this.formInstance);
    const dataSpan = formNode.childNodes[1];
    let data = this.props.data;
    if (typeof data === 'function') {
      data = data();
    }
    const inputs = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        inputs.push(`<input name="${key}" value="${data[key]}"/>`);
      }
    }
    dataSpan.innerHTML = inputs.join('');
    formNode.submit();
    dataSpan.innerHTML = '';
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
    return 'iframe_uploader_' + this.iframeCount + '_' + this.state.uid;
  },

  render() {
    return (
      <div onMouseEnter={this.updateForm}>
        {this.props.children}
      </div>
    );
  },
});

module.exports = IframeUploader;
