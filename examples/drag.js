/* eslint no-console:0 */

import React from 'react';
import ReactDOM from 'react-dom';
import Upload from 'rc-upload';

class Test extends React.Component {
  render() {
    const props = {
      action: '/upload.do',
      type: 'drag',
      accept: '.png',
      beforeUpload(file) {
        console.log('beforeUpload', file.name);
      },
      onStart: (file) => {
        console.log('onStart', file.name);
      },
      onSuccess(file) {
        console.log('onSuccess', file);
      },
      onProgress(step, file) {
        console.log('onProgress', Math.round(step.percent), file.name);
      },
      onError(err) {
        console.log('onError', err);
      },
      style: { display: 'inline-block', width: 200, height: 200, background: '#eee' },
      // openChooseDialogOnClick: false
    };
    return <Upload {...props} />;
  }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));
