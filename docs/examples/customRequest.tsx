/* eslint no-console:0 */
import React from 'react';
import axios from 'axios';
import Upload from '@rc-component/upload';
import { UploadRequestOption } from '@/interface';

const uploadProps = {
  action: '/upload.do',
  multiple: false,
  data: { a: 1, b: 2 },
  headers: {
    Authorization: '$prefix $token',
  },
  onStart(file) {
    console.log('onStart', file, file.name);
  },
  onSuccess(res, file) {
    console.log('onSuccess', res, file.name);
  },
  onError(err) {
    console.log('onError', err);
  },
  onProgress({ percent }, file) {
    console.log('onProgress', `${percent}%`, file.name);
  },
  customRequest({
    action,
    data,
    file,
    filename,
    headers,
    onError,
    onProgress,
    onSuccess,
    withCredentials,
  }: UploadRequestOption) {
    // EXAMPLE: post form-data with 'axios'
    // eslint-disable-next-line no-undef
    const formData = new FormData();
    if (data) {
      Object.keys(data).forEach(key => {
        formData.append(key, data[key] as string);
      });
    }
    formData.append(filename, file);

    axios
      .post(action, formData, {
        withCredentials,
        headers,
        onUploadProgress: ({ total, loaded }) => {
          onProgress({ percent: Number(Math.round((loaded / total) * 100).toFixed(2)) }, file);
        },
      })
      .then(({ data: response }) => {
        onSuccess(response, file);
      })
      .catch(onError);

    return {
      abort() {
        console.log('upload progress is aborted.');
      },
    };
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
        <Upload {...uploadProps}>
          <button type="button">开始上传</button>
        </Upload>
      </div>
    </div>
  );
};

export default Test;
