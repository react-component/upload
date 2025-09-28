/* eslint no-console:0 */

import type { Action, RcFile } from '@/interface';
import Upload from '@rc-component/upload';

const props = {
  action: '/upload.do' as Action,
  multiple: true,
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(ret) {
    console.log('onSuccess', ret);
  },
  onError(err) {
    console.log('onError', err);
  },
  beforeUpload(file: RcFile, fileList: RcFile[]) {
    console.log(file, fileList);
    return new Promise<RcFile>(resolve => {
      console.log('start check');
      setTimeout(() => {
        console.log('check finshed');
        resolve(file);
      }, 3000);
    });
  },
};

const Test = () => {
  return (
    <div
      style={{
        margin: 100,
      }}
    >
      <div>
        <Upload {...props}>
          <a>开始上传</a>
        </Upload>
      </div>
    </div>
  );
};

export default Test;
