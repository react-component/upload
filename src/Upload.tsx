import React from 'react';
import AjaxUpload from './AjaxUploader';
import type { UploadProps } from './interface';

function empty() {}

const Upload: React.FC<Readonly<UploadProps>> = props => {
  const {
    component = 'span',
    prefixCls = 'rc-upload',
    data = {},
    headers = {},
    name = 'file',
    onStart = empty,
    onError = empty,
    onSuccess = empty,
    multiple = false,
    beforeUpload = null,
    customRequest = null,
    withCredentials = false,
    openFileDialogOnClick = true,
    hasControlInside = false,
    ...rest
  } = props;
  return (
    <AjaxUpload
      component={component}
      prefixCls={prefixCls}
      data={data}
      headers={headers}
      name={name}
      onStart={onStart}
      onError={onError}
      onSuccess={onSuccess}
      multiple={multiple}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      withCredentials={withCredentials}
      openFileDialogOnClick={openFileDialogOnClick}
      hasControlInside={hasControlInside}
      {...rest}
    />
  );
};

if (process.env.NODE_ENV !== 'production') {
  Upload.displayName = 'Upload';
}

export default Upload;
