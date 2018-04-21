/* eslint react/sort-comp:0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import getUid from './uid';
import warning from 'warning';

const IFRAME_STYLE = {
  position: 'absolute',
  top: 0,
  opacity: 0,
  filter: 'alpha(opacity=0)',
  left: 0,
  zIndex: 9999,
};

// diferent from AjaxUpload, can only upload on at one time, serial seriously
class IframeUploader extends Component {
  static propTypes = {
    component: PropTypes.string,
    style: PropTypes.object,
    disabled: PropTypes.bool,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    accept: PropTypes.string,
    onStart: PropTypes.func,
    multiple: PropTypes.bool,
    children: PropTypes.any,
    data: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.func,
    ]),
    action: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
    ]),
    name: PropTypes.string,
  }

  state = { uploading: false }

  file = {}

  onLoad = () => {
    if (!this.state.uploading) {
      return;
    }
    const { props, file } = this;
    let response;
    try {
      const doc = this.getIframeDocument();
      const script = doc.getElementsByTagName('script')[0];
      if (script && script.parentNode === doc.body) {
        doc.body.removeChild(script);
      }
      response = doc.body.innerHTML;
      props.onSuccess(response, file);
    } catch (err) {
      warning(false, 'cross domain error for Upload. Maybe server should return document.domain script. see Note from https://github.com/react-component/upload');
      response = 'cross-domain';
      props.onError(err, null, file);
    }
    this.endUpload();
  }

  onChange = () => {
    const target = this.getFormInputNode();
    // ie8/9 don't support FileList Object
    // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
    const file = this.file = {
      uid: getUid(),
      name: target.value,
    };
    this.startUpload();
    const { props } = this;
    if (!props.beforeUpload) {
      return this.post(file);
    }
    const before = props.beforeUpload(file);
    if (before && before.then) {
      before.then(() => {
        this.post(file);
      }, () => {
        this.endUpload();
      });
    } else if (before !== false) {
      this.post(file);
    } else {
      this.endUpload();
    }
  }

  componentDidMount() {
    this.updateIframeWH();
    this.initIframe();
  }

  componentDidUpdate() {
    this.updateIframeWH();
  }

  getIframeNode() {
    return this.iframe;
  }

  getIframeDocument() {
    return this.getIframeNode().contentDocument;
  }

  getFormNode() {
    return this.getIframeDocument().getElementById('form');
  }

  getFormInputNode() {
    return this.getIframeDocument().getElementById('input');
  }

  getFormDataNode() {
    return this.getIframeDocument().getElementById('data');
  }

  getFileForMultiple(file) {
    return this.props.multiple ? [file] : file;
  }

  getIframeHTML(domain) {
    let domainScript = '';
    let domainInput = '';
    if (domain) {
      const script = 'script';
      domainScript = `<${script}>document.domain="${domain}";</${script}>`;
      domainInput = `<input name="_documentDomain" value="${domain}" />`;
    }
    return `
    <!DOCTYPE html>
    <html>
    <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style>
    body,html {padding:0;margin:0;border:0;overflow:hidden;}
    </style>
    ${domainScript}
    </head>
    <body>
    <form method="post"
    encType="multipart/form-data"
    action="" id="form"
    style="display:block;height:9999px;position:relative;overflow:hidden;">
    <input id="input" type="file"
     name="${this.props.name}"
     style="position:absolute;top:0;right:0;height:9999px;font-size:9999px;cursor:pointer;"/>
    ${domainInput}
    <span id="data"></span>
    </form>
    </body>
    </html>
    `;
  }

  initIframeSrc() {
    if (this.domain) {
      this.getIframeNode().src = `javascript:void((function(){
        var d = document;
        d.open();
        d.domain='${this.domain}';
        d.write('');
        d.close();
      })())`;
    }
  }

  initIframe() {
    const iframeNode = this.getIframeNode();
    let win = iframeNode.contentWindow;
    let doc;
    this.domain = this.domain || '';
    this.initIframeSrc();
    try {
      doc = win.document;
    } catch (e) {
      this.domain = document.domain;
      this.initIframeSrc();
      win = iframeNode.contentWindow;
      doc = win.document;
    }
    doc.open('text/html', 'replace');
    doc.write(this.getIframeHTML(this.domain));
    doc.close();
    this.getFormInputNode().onchange = this.onChange;
  }

  endUpload() {
    if (this.state.uploading) {
      this.file = {};
      // hack avoid batch
      this.state.uploading = false;
      this.setState({
        uploading: false,
      });
      this.initIframe();
    }
  }

  startUpload() {
    if (!this.state.uploading) {
      this.state.uploading = true;
      this.setState({
        uploading: true,
      });
    }
  }

  updateIframeWH() {
    const rootNode = ReactDOM.findDOMNode(this);
    const iframeNode = this.getIframeNode();
    iframeNode.style.height = `${rootNode.offsetHeight}px`;
    iframeNode.style.width = `${rootNode.offsetWidth}px`;
  }

  abort(file) {
    if (file) {
      let uid = file;
      if (file && file.uid) {
        uid = file.uid;
      }
      if (uid === this.file.uid) {
        this.endUpload();
      }
    } else {
      this.endUpload();
    }
  }

  post(file) {
    const formNode = this.getFormNode();
    const dataSpan = this.getFormDataNode();
    let { data } = this.props;
    const { onStart } = this.props;
    if (typeof data === 'function') {
      data = data(file);
    }
    const inputs = document.createDocumentFragment();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.setAttribute('name', key);
        input.value = data[key];
        inputs.appendChild(input);
      }
    }
    dataSpan.appendChild(inputs);
    new Promise(resolve => {
      const { action } = this.props;
      if (typeof action === 'function') {
        return resolve(action(file));
      }
      resolve(action);
    }).then(action => {
      formNode.setAttribute('action', action);
      formNode.submit();
      dataSpan.innerHTML = '';
      onStart(file);
    });
  }

  saveIframe = (node) => {
    this.iframe = node;
  }

  render() {
    const {
      component: Tag, disabled, className,
      prefixCls, children, style,
    } = this.props;
    const iframeStyle = {
      ...IFRAME_STYLE,
      display: this.state.uploading || disabled ? 'none' : '',
    };
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [className]: className,
    });
    return (
      <Tag
        className={cls}
        style={{ position: 'relative', zIndex: 0, ...style }}
      >
        <iframe
          ref={this.saveIframe}
          onLoad={this.onLoad}
          style={iframeStyle}
        />
        {children}
      </Tag>
    );
  }
}

export default IframeUploader;
