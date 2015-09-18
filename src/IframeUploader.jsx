import React, {PropTypes} from 'react';
import uid from './uid';
const iframeStyle = {
  position: 'absolute',
  top: 0,
  opacity: 0,
  filter: 'alpha(opacity=0)',
  left: 0,
  zIndex: 9999,
};

const IframeUploader = React.createClass({
  propTypes: {
    onStart: PropTypes.func,
    multiple: PropTypes.bool,
    children: PropTypes.any,
    data: PropTypes.object,
    action: PropTypes.string,
    name: PropTypes.string,
  },

  componentDidMount() {
    this.updateIframeWH();
    this.initIframe();
  },

  componentDidUpdate() {
    this.updateIframeWH();
  },

  onLoad() {
    if (!this.loading) {
      return;
    }
    const props = this.props;
    let response;
    const eventFile = this.file;
    try {
      response = this.getIframeDocument().body.innerHTML;
      props.onSuccess(response, eventFile);
    } catch (err) {
      response = 'cross-domain';
      props.onError(err, null, eventFile);
    }
    this.enableIframe();
    this.initIframe();
  },


  onChange() {
    const target = this.getFormInputNode();
    // ie8/9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    const file = this.file = {
      uid: uid(),
      name: target.value,
    };
    this.props.onStart(this.getFileForMultiple(file));
    const formNode = this.getFormNode();
    const dataSpan = this.getFormDataNode();
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
    this.disabledIframe();
  },

  getIframeNode() {
    return React.findDOMNode(this.refs.iframe);
  },

  getIframeDocument() {
    return this.getIframeNode().contentDocument;
  },

  getFormNode() {
    return this.getIframeDocument().getElementById('form');
  },

  getFormInputNode() {
    return this.getIframeDocument().getElementById('input');
  },

  getFormDataNode() {
    return this.getIframeDocument().getElementById('data');
  },

  getFileForMultiple(file) {
    return this.props.multiple ? [file] : file;
  },

  getIframeHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style>
    body,html {padding:0;margin:0;border:0;overflow:hidden;}
    </style>
    </head>
    <body>
    <form method="post"
    encType="multipart/form-data"
    action="${this.props.action}" id="form" style="display:block;height:9999px;position:relative;overflow:hidden;">
    <input id="input" type="file"
     name="${this.props.name}"
     style="position:absolute;top:0;right:0;height:9999px;font-size:9999px;cursor:pointer;"/>
    <span id="data"></span>
    </form>
    </body>
    </html>
    `;
  },

  render() {
    return (
      <span style={{position: 'relative', zIndex: 0}}>
        <iframe ref="iframe"
                onLoad={this.onLoad}
                style={iframeStyle}/>
        {this.props.children}
      </span>
    );
  },

  initIframe() {
    const iframeNode = this.getIframeNode();
    const win = iframeNode.contentWindow;
    const doc = win.document;
    doc.open('text/html', 'replace');
    doc.write(this.getIframeHTML());
    doc.close();
    this.getFormInputNode().onchange = this.onChange;
  },

  enableIframe() {
    this.loading = false;
    this.getIframeNode().style.display = '';
  },

  disabledIframe() {
    this.loading = true;
    this.getIframeNode().style.display = 'none';
  },

  updateIframeWH() {
    const rootNode = React.findDOMNode(this);
    const iframeNode = this.getIframeNode();
    iframeNode.style.height = rootNode.offsetHeight + 'px';
    iframeNode.style.width = rootNode.offsetWidth + 'px';
  },
});

export default IframeUploader;
