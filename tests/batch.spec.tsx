/* eslint no-console:0 */
import React from 'react';
import { format } from 'util';
import { mount, ReactWrapper } from 'enzyme';
import sinon from 'sinon';
import Upload from '../src';
import { UploadProps, RcFile } from '../src/interface';

describe('Upload.Batch', () => {
  function getFile(name: string): RcFile {
    return {
      name,
      toString: () => name,
    } as RcFile;
  }

  function genProps(props?: {
    onStart: UploadProps['onStart'];
    onProgress: UploadProps['onProgress'];
    onSuccess: UploadProps['onSuccess'];
    onError: UploadProps['onError'];
  }) {
    return {
      action: '/test',
      data: { a: 1, b: 2 },
      multiple: true,
      accept: '.png',
      onStart(file) {
        props?.onStart?.(file);
      },
      onSuccess(res, file, xhr) {
        props?.onSuccess?.(res, file, xhr);
      },
      onProgress(step, file) {
        props?.onProgress?.(step, file);
      },
      onError(err, ret, file) {
        props?.onError?.(err, ret, file);
      },
    };
  }

  describe('onBatchUpload', () => {
    const firstFile = getFile('first.png');
    const secondFile = getFile('second.png');

    function triggerUpload(wrapper: ReactWrapper) {
      const files: RcFile[] = [firstFile, secondFile];
      wrapper.find('input').first().simulate('change', { target: { files } });
    }

    it('should trigger', done => {
      const onBatchUpload = jest.fn();

      const wrapper = mount(<Upload onBatchUpload={onBatchUpload} {...genProps()} />);
      triggerUpload(wrapper);

      setTimeout(() => {
        expect(onBatchUpload).toHaveBeenCalledWith([
          expect.objectContaining(firstFile),
          expect.objectContaining(secondFile),
        ]);
        done();
      }, 10);
    });

    it('beforeUpload return false', done => {
      const onBatchUpload = jest.fn();

      const wrapper = mount(
        <Upload onBatchUpload={onBatchUpload} beforeUpload={() => false} {...genProps()} />,
      );
      triggerUpload(wrapper);

      setTimeout(() => {
        expect(onBatchUpload).toHaveBeenCalledWith([
          expect.objectContaining(firstFile),
          expect.objectContaining(secondFile),
        ]);
        done();
      }, 10);
    });

    it('beforeUpload return promise file', done => {
      const onBatchUpload = jest.fn();

      const wrapper = mount(
        <Upload
          onBatchUpload={onBatchUpload}
          beforeUpload={file => Promise.resolve(file)}
          {...genProps()}
        />,
      );
      triggerUpload(wrapper);

      setTimeout(() => {
        expect(onBatchUpload).toHaveBeenCalledWith([
          expect.objectContaining(firstFile),
          expect.objectContaining(secondFile),
        ]);
        done();
      }, 10);
    });

    it('beforeUpload return promise rejection', done => {
      const onBatchUpload = jest.fn();

      const wrapper = mount(
        <Upload
          onBatchUpload={onBatchUpload}
          beforeUpload={() => Promise.reject()}
          {...genProps()}
        />,
      );
      triggerUpload(wrapper);

      setTimeout(() => {
        expect(onBatchUpload).toHaveBeenCalledWith([]);
        done();
      }, 10);
    });
  });
});
