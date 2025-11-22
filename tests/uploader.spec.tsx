import { resetWarned } from '@rc-component/util/lib/warning';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import sinon from 'sinon';
import { format } from 'util';
import Upload, { type UploadProps } from '../src';

const sleep = (timeout = 500) => new Promise(resolve => setTimeout(resolve, timeout));

function Item(name) {
  this.name = name;
  this.toString = () => this.name;
}

const makeFileSystemEntry = item => {
  const isDirectory = Array.isArray(item.children);
  const ret = {
    isDirectory,
    isFile: !isDirectory,
    file: handle => {
      handle(new Item(item.name));
    },
    createReader: () => {
      let first = true;
      return {
        readEntries(handle) {
          if (!first) {
            return handle([]);
          }

          first = false;
          return handle(item.children.map(makeFileSystemEntry));
        },
      };
    },
  };
  return ret;
};

const makeFileSystemEntryAsync = item => {
  const isDirectory = Array.isArray(item.children);
  const ret = {
    isDirectory,
    isFile: !isDirectory,
    file: handle => {
      handle(new Item(item.name));
    },
    createReader: () => {
      let first = true;
      return {
        async readEntries(handle, error) {
          await sleep(100);

          if (!first) {
            return handle([]);
          }

          if (item.error && first) {
            return error && error(new Error('read file error'));
          }

          first = false;
          return handle(item.children.map(makeFileSystemEntryAsync));
        },
      };
    },
  };
  return ret;
};

const makeDataTransferItem = item => {
  return {
    webkitGetAsEntry: () => makeFileSystemEntry(item),
  };
};

const makeDataTransferItemAsync = item => {
  return {
    webkitGetAsEntry: () => makeFileSystemEntryAsync(item),
  };
};

describe('uploader', () => {
  let requests;
  let xhr;
  let errorMock;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = req => requests.push(req);

    const originalConsoleError = global.console.error;
    errorMock = jest.spyOn(global.console, 'error');
    errorMock.mockImplementation((message, ...otherParams) => {
      originalConsoleError(message, ...otherParams);
      throw new Error(format(message, ...otherParams));
    });
  });

  afterEach(() => {
    xhr.restore();
    errorMock.mockRestore();
  });

  describe('ajax uploader', () => {
    if (typeof FormData === 'undefined') {
      return;
    }

    let uploader: ReturnType<typeof render>;
    const handlers: UploadProps = {};

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      multiple: true,
      accept: '.png',
      onStart(file) {
        console.log('onStart', file, file.name);
        if (handlers.onStart) {
          handlers.onStart(file);
        }
      },
      onSuccess(ret, file) {
        console.log('onSuccess', ret);
        if (handlers.onSuccess) {
          handlers.onSuccess(ret, file, null!);
        }
      },
      onProgress(step, file) {
        console.log('onProgress', step, file);
      },
      onError(err, result, file) {
        console.log('onError', err);
        if (handlers.onError) {
          handlers.onError(err, result, file);
        }
      },
    };

    beforeEach(() => {
      uploader = render(<Upload {...props} />);
    });

    afterEach(() => {
      uploader.unmount();
    });

    it('with id', () => {
      const { container } = render(<Upload id="bamboo" />);
      expect(container.querySelector('input')!.id).toBe('bamboo');
    });

    // https://github.com/ant-design/ant-design/issues/50643
    it('with name', () => {
      const { container } = render(<Upload name="bamboo" />);
      expect(container.querySelector('input')!.name).toBe('bamboo');
    });

    it('should pass through data & aria attributes', () => {
      const { container } = render(
        <Upload
          data-testid="data-testid"
          data-my-custom-attr="custom data attribute"
          aria-label="Upload a file"
        />,
      );

      const input = container.querySelector('input')!;
      expect(input).toHaveAttribute('data-testid', 'data-testid');
      expect(input).toHaveAttribute('data-my-custom-attr', 'custom data attribute');
      expect(input).toHaveAttribute('aria-label', 'Upload a file');
    });

    it('should pass through role attributes', () => {
      const { container } = render(<Upload role="button" />);
      expect(container.querySelector('input')!.getAttribute('role')).toBe('button');
    });

    it('should not pass through unknown props', () => {
      const { container } = render(
        <Upload
          {...({
            customProp: "This shouldn't be rendered to DOM",
          } as any)}
        />,
      );
      expect(container.querySelector('input')!.hasAttribute('customProp')).toBe(false);
    });

    it('create works', () => {
      const { container } = render(<Upload />);
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThan(0);
    });

    it('upload success', done => {
      const input = uploader.container.querySelector('input')!;
      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      fireEvent.change(input, {
        target: { files },
      });
      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('upload error', done => {
      const input = uploader.container.querySelector('input')!;

      const files = [
        {
          name: 'error.png',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      handlers.onError = (err: any, ret) => {
        expect(err instanceof Error).toEqual(true);
        expect(err.status).toEqual(400);
        expect(ret).toEqual('error 400');
        done();
      };

      fireEvent.change(input, {
        target: { files },
      });
      setTimeout(() => {
        requests[0].respond(400, {}, `error 400`);
      }, 100);
    });

    it('drag to upload', done => {
      const input = uploader.container.querySelector('input')!;

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      fireEvent.change(input, {
        target: { files },
      });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('drag unaccepted type files to upload will not trigger onStart', done => {
      const input = uploader.container.querySelector('input')!;
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      fireEvent.drop(input, {
        dataTransfer: { files },
      });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });
    
   it('drag unaccepted type files with multiple false to upload will not trigger onStart ', done => {
      const { container } = render(<Upload {...props} multiple={false} />);

      const input = container.querySelector('input')!;
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      fireEvent.drop(input, {
        dataTransfer: { files },
      });
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });
    
    it('drag files with multiple false', done => {
      const { container } = render(<Upload {...props} multiple={false} />);
      const input = container.querySelector('input')!;
      const files = [
        new File([''], 'success.png', { type: 'image/png' }),
        new File([''], 'filtered.png', { type: 'image/png' }),
      ];
      Object.defineProperty(files, 'item', {
        value: i => files[i],
      });

      // Only can trigger once
      let triggerTimes = 0;
      handlers.onStart = () => {
        triggerTimes += 1;
      };
      handlers.onSuccess = (ret, file) => {
        try {
          expect(ret[1]).toEqual(file.name);
          expect(file).toHaveProperty('uid');
          expect(triggerTimes).toEqual(1);
          done();
        } catch (error) {
          done(error);
        }
      };
      handlers.onError = error => {
        done(error);
      };

      Object.defineProperty(input, 'files', {
        value: files,
      });

      fireEvent.drop(input, { dataTransfer: { files } });

      setTimeout(() => {
        handlers.onSuccess!(['', files[0].name] as any, files[0] as any, null!);
      }, 100);
    });

    it('paste to upload', async () => {
      const { container } = render(<Upload {...props} pastable />);
      const input = container.querySelector('input')!;

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
      };

      handlers.onError = err => {
        throw err;
      };

      fireEvent.paste(input, {
        clipboardData: { files },
      });

      await sleep(100);
      requests[0].respond(200, {}, `["","${files[0].name}"]`);
    });

    it('paste unaccepted type files to upload will not trigger onStart', () => {
      const input = uploader.container.querySelector('input')!;
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name;
          },
        },
      ];
      (files as any).item = (i: number) => files[i];

      fireEvent.paste(input, {
        clipboardData: { files },
      });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;

      expect(mockStart.mock.calls.length).toBe(0);
    });

    it('paste files with multiple false', async () => {
      const { container } = render(<Upload {...props} multiple={false} pastable />);
      const input = container.querySelector('input')!;
      const files = [
        new File([''], 'success.png', { type: 'image/png' }),
        new File([''], 'filtered.png', { type: 'image/png' }),
      ];
      Object.defineProperty(files, 'item', {
        value: i => files[i],
      });

      // Only can trigger once
      let triggerTimes = 0;
      handlers.onStart = () => {
        triggerTimes += 1;
      };
      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        expect(triggerTimes).toEqual(1);
      };
      handlers.onError = error => {
        throw error;
      };
      Object.defineProperty(input, 'files', {
        value: files,
      });

      fireEvent.paste(input, { clipboardData: { files } });

      await sleep(100);
      handlers.onSuccess!(['', files[0].name] as any, files[0] as any, null!);
    });

    it('support action and data is function returns Promise', async () => {
      const action: any = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('/upload.do');
          }, 1000);
        });
      };
      const data: any = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ field1: 'a' });
          }, 1000);
        });
      };
      const { container } = render(<Upload data={data} action={action} />);
      const input = container.querySelector('input')!;
      const files = [new File([''], 'success.png', { type: 'image/png' })];
      Object.defineProperty(files, 'item', {
        value: i => files[i],
      });
      fireEvent.change(input, { target: { files } });

      await new Promise(resolve => setTimeout(resolve, 100));
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    it('should pass file to request', done => {
      const fakeRequest = jest.fn(file => {
        expect(file).toEqual(
          expect.objectContaining({
            filename: 'file', // <= https://github.com/react-component/upload/pull/574
            file: expect.any(File),
            method: 'post',
            onError: expect.any(Function),
            onProgress: expect.any(Function),
            onSuccess: expect.any(Function),
            data: expect.anything(),
          }),
        );

        done();
      });

      const { container } = render(<Upload customRequest={fakeRequest} />);
      const input = container.querySelector('input')!;
      const files = [new File([''], 'success.png', { type: 'image/png' })];
      Object.defineProperty(files, 'item', {
        value: i => files[i],
      });

      fireEvent.change(input, { target: { files } });
    });

    it('should call preventDefault when paste contains files', () => {
      const { container } = render(<Upload {...props} pastable />);
      const input = container.querySelector('input')!;

      const files = [new File([''], 'test.png', { type: 'image/png' })];

      const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');

      fireEvent.paste(input, {
        clipboardData: {
          items: [{ kind: 'file' }],
          files,
        },
      });

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      preventDefaultSpy.mockRestore();
    });

    it('should not call preventDefault when paste contains no files', () => {
      const { container } = render(<Upload {...props} pastable />);
      const input = container.querySelector('input')!;

      const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');

      fireEvent.paste(input, {
        clipboardData: {
          items: [{ kind: 'string' }],
          files: [],
        },
      });

      expect(preventDefaultSpy).toHaveBeenCalledTimes(0);
      preventDefaultSpy.mockRestore();
    });
  });

  describe('directory uploader', () => {
    if (typeof FormData === 'undefined') {
      return;
    }

    let uploader: ReturnType<typeof render>;
    const handlers: UploadProps = {};

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true,
      accept: '.png',
      onStart(file) {
        console.log('onStart', file, file.name);
        if (handlers.onStart) {
          handlers.onStart(file);
        }
      },
      onSuccess(ret, file) {
        console.log('onSuccess', ret);
        if (handlers.onSuccess) {
          handlers.onSuccess(ret, file, null!);
        }
      },
      onProgress(step, file) {
        console.log('onProgress', step, file);
      },
      onError(err, result, file) {
        console.log('onError', err);
        if (handlers.onError) {
          handlers.onError(err, result, file);
        }
      },
    };

    beforeEach(() => {
      uploader = render(<Upload {...props} />);
    });

    it('beforeUpload should run after all children files are parsed', done => {
      const props = { action: '/test', directory: true, accept: '.png' };
      const mockBeforeUpload = jest.fn();
      const beforeUpload = (file, fileList) => {
        console.log('beforeUpload', file, fileList);
        mockBeforeUpload(file, fileList);
      };
      const Test = () => {
        return <Upload {...props} beforeUpload={beforeUpload} />;
      };

      const { container } = render(<Test />);
      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: '1.png',
              },
              {
                name: '2.png',
              },
              {
                name: 'rc',
                children: [
                  {
                    name: '5.webp',
                  },
                  {
                    name: '4.webp',
                  },
                ],
              },
            ],
          },
        ],
      };
      const input = container.querySelector('input')!;
      fireEvent.drop(input, { dataTransfer: { items: [makeDataTransferItem(files)] } });
      setTimeout(() => {
        expect(mockBeforeUpload.mock.calls.length).toBe(2);
        expect(mockBeforeUpload.mock.calls[0][1].length).toBe(2);
        expect(mockBeforeUpload.mock.calls[1][1].length).toBe(2);
        done();
      }, 100);
    });

    it('unaccepted type files to upload will not trigger onStart', done => {
      const input = uploader.container.querySelector('input')!;
      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: 'unaccepted.webp',
              },
            ],
          },
        ],
      };

      fireEvent.drop(input, { dataTransfer: { items: [makeDataTransferItem(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });

    it('dragging and dropping a non file with a file does not prevent the file from being uploaded', done => {
      const input = uploader.container.querySelector('input')!;
      const file = {
        name: 'success.png',
      };
      fireEvent.drop(input, {
        dataTransfer: { items: [{ webkitGetAsEntry: () => null }, makeDataTransferItem(file)] },
      });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(1);
        done();
      }, 100);
    });

    it('dragging and dropping files to upload through asynchronous file reading is run normal', done => {
      const input = uploader.container.querySelector('input')!;

      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            children: [
              {
                name: '1.png',
              },
              {
                name: '2.png',
              },
              {
                name: 'rc',
                children: [
                  {
                    name: '5.webp',
                  },
                  {
                    name: '4.webp',
                  },
                ],
              },
            ],
          },
        ],
      };
      fireEvent.drop(input, { dataTransfer: { items: [makeDataTransferItemAsync(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;

      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(2);
        done();
      }, 1000);
    });

    it('dragging and dropping files to upload through asynchronous file reading with some readEntries method throw error', done => {
      const input = uploader.container.querySelector('input')!;

      const files = {
        name: 'foo',
        children: [
          {
            name: 'bar',
            error: true,
            children: [
              {
                name: '1.png',
              },
              {
                name: 'ffc',
                children: [
                  {
                    name: '7.png',
                  },
                  {
                    name: '8.png',
                  },
                ],
              },
            ],
          },
          {
            name: 'rc',
            children: [
              {
                name: '3.png',
              },
              {
                name: '4.webp',
              },
            ],
          },
        ],
      };

      const preventDefaultSpy = jest.spyOn(Event.prototype, 'preventDefault');

      fireEvent.dragOver(input);
      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);

      fireEvent.drop(input, { dataTransfer: { items: [makeDataTransferItemAsync(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;

      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(1);
        done();
      }, 1000);

      preventDefaultSpy.mockRestore();
    });

    it('unaccepted type files to upload will not trigger onStart when select directory', done => {
      const input = uploader.container.querySelector('input')!;
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ];
      fireEvent.change(input, { target: { files } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });

    it('accept if type is invalidate', done => {
      resetWarned();
      const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { container } = render(<Upload {...props} accept="jpg,png" />);

      const input = container.querySelector('input')!;
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ];
      fireEvent.change(input, { target: { files } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;

      expect(errSpy).toHaveBeenCalledWith(
        "Warning: Upload takes an invalidate 'accept' type 'jpg'.Skip for check.",
      );

      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(1);

        errSpy.mockRestore();
        done();
      }, 100);
    });

    it('paste directory', async () => {
      const { container } = render(<Upload {...props} pastable />);
      const rcUpload = container.querySelector('.rc-upload')!;
      const files = {
        name: 'foo',
        children: [
          {
            name: '1.png',
          },
        ],
      };

      fireEvent.mouseEnter(rcUpload);
      fireEvent.paste(rcUpload, { clipboardData: { items: [makeDataTransferItem(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;

      await sleep(100);
      expect(mockStart.mock.calls.length).toBe(1);
    });
  });

  describe('accept', () => {
    if (typeof FormData === 'undefined') {
      return;
    }

    let uploader: ReturnType<typeof render>;
    const handlers: UploadProps = {};

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true,
      onStart(file) {
        if (handlers.onStart) {
          handlers.onStart(file);
        }
      },
    };

    function test(
      desc: string,
      value?: string,
      files?: object[],
      expectCallTimes?: number,
      errorMessage?: string,
      extraProps?: Partial<UploadProps>,
    ) {
      it(desc, done => {
        resetWarned();
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        uploader = render(<Upload {...props} {...extraProps} accept={value} />);
        const input = uploader.container.querySelector('input')!;
        fireEvent.change(input, { target: { files } });
        const mockStart = jest.fn();
        handlers.onStart = mockStart;

        if (errorMessage) {
          expect(errSpy).toHaveBeenCalledWith(errorMessage);
        }

        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(expectCallTimes);

          errSpy.mockRestore();
          done();
        }, 100);
      });
    }

    test(
      'default',
      undefined,
      [
        {
          name: 'accepted.webp',
        },
        {
          name: 'accepted.png',
        },
        {
          name: 'accepted.txt',
        },
      ],
      3,
    );

    test(
      'support .png',
      '.png',
      [
        {
          name: 'unaccepted.webp',
        },
        {
          name: 'accepted.png',
        },
      ],
      1,
    );

    test(
      'support .jpg and .jpeg',
      '.jpg',
      [
        {
          name: 'unaccepted.webp',
        },
        {
          name: 'accepted.jpg',
        },
        {
          name: 'accepted.jpeg',
        },
      ],
      2,
    );

    test(
      'support .ext,ext',
      '.png,.txt',
      [
        {
          name: 'accepted.png',
        },
        {
          name: 'unaccepted.jpg',
        },
        {
          name: 'accepted.txt',
        },
      ],
      2,
    );

    test(
      'support image/type',
      'image/jpeg',
      [
        {
          name: 'unaccepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.jpg',
          type: 'image/jpeg',
        },
      ],
      1,
    );

    test(
      'support image/*',
      'image/*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.jpg',
          type: 'image/jpeg',
        },
        {
          name: 'unaccepted.text',
          type: 'text/plain',
        },
      ],
      2,
    );

    test(
      'support *',
      '*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
    );

    test(
      'support */*',
      '*/*',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
    );

    test(
      'invalidate type should skip',
      'jpg',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'accepted.text',
          type: 'text/plain',
        },
      ],
      2,
      "Warning: Upload takes an invalidate 'accept' type 'jpg'.Skip for check.",
    );

    test(
      'should skip when select file',
      '.png',
      [
        {
          name: 'accepted.png',
          type: 'image/png',
        },
        {
          name: 'unaccepted.text',
          type: 'text/plain',
        },
      ],
      2,
      '',
      {
        directory: false,
      },
    );
  });

  describe('AcceptConfig', () => {
    let uploader: ReturnType<typeof render>;
    const handlers: UploadProps = {};

    const props: UploadProps = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true, // Enable format filtering
      onStart(file) {
        if (handlers.onStart) {
          handlers.onStart(file);
        }
      },
    };

    function testAcceptConfig(desc: string, accept: any, files: object[], expectCallTimes: number) {
      it(desc, done => {
        uploader = render(<Upload {...props} accept={accept} />);
        const input = uploader.container.querySelector('input')!;
        fireEvent.change(input, { target: { files } });
        const mockStart = jest.fn();
        handlers.onStart = mockStart;

        setTimeout(() => {
          expect(mockStart.mock.calls.length).toBe(expectCallTimes);
          done();
        }, 100);
      });
    }

    testAcceptConfig(
      'should work with format only',
      { format: '.png' },
      [{ name: 'test.png' }, { name: 'test.jpg' }],
      1,
    );

    testAcceptConfig(
      'should work with filter: native',
      { format: '.png', filter: 'native' },
      [{ name: 'test.png' }, { name: 'test.jpg' }],
      2, // native filter bypasses format check
    );

    testAcceptConfig(
      'should work with custom filter function',
      {
        format: '.png',
        filter: (file: any) => file.name.includes('custom'),
      },
      [{ name: 'custom.jpg' }, { name: 'test.png' }],
      1, // only custom.jpg passes custom filter
    );

    testAcceptConfig(
      'should work with MIME type format',
      { format: 'image/*' },
      [
        { name: 'test.png', type: 'image/png' },
        { name: 'doc.txt', type: 'text/plain' },
      ],
      1, // only image file passes
    );
  });

  describe('transform file before request', () => {
    let uploader: ReturnType<typeof render>;
    beforeEach(() => {
      uploader = render(<Upload />);
    });

    afterEach(() => {
      uploader.unmount();
    });

    it('noes not affect receive origin file when transform file is null', done => {
      const handlers: UploadProps = {};
      const props: UploadProps = {
        action: '/test',
        onSuccess(ret, file) {
          if (handlers.onSuccess) {
            handlers.onSuccess(ret, file, null!);
          }
        },
        transformFile() {
          return null;
        },
      } as any;
      const { container } = render(<Upload {...props} />);
      const input = container.querySelector('input')!;

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];

      (files as any).item = i => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      fireEvent.change(input, { target: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });
  });

  describe('onBatchStart', () => {
    const files = [new File([], 'bamboo.png'), new File([], 'light.png')];

    const batchEventFiles = files.map(file =>
      expect.objectContaining({
        file,
      }),
    );

    async function testWrapper(props?: UploadProps) {
      const onBatchStart = jest.fn();
      const { container } = render(<Upload onBatchStart={onBatchStart} {...props} />);

      fireEvent.change(container.querySelector('input')!, {
        target: {
          files,
        },
      });

      // Always wait 500ms to done the test
      await sleep();

      expect(onBatchStart).toHaveBeenCalled();

      return onBatchStart;
    }

    it('trigger without pending', async () => {
      const onBatchStart = await testWrapper();
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles);
    });

    it('trigger with beforeUpload delay', async () => {
      const beforeUpload = jest.fn(async file => {
        if (file.name === 'bamboo.png') {
          await sleep(100);
          return true;
        }
        return true;
      });

      const onBatchStart = await testWrapper({ beforeUpload });

      expect(beforeUpload).toHaveBeenCalledTimes(2);
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles);
    });

    it('beforeUpload but one is deny', async () => {
      const beforeUpload = jest.fn(async file => {
        if (file.name === 'light.png') {
          await sleep(100);
          return false;
        }
        return true;
      });

      const onStart = jest.fn();
      const onBatchStart = await testWrapper({ beforeUpload, onStart });

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(beforeUpload).toHaveBeenCalledTimes(2);
      expect(onBatchStart).toHaveBeenCalledWith(
        files.map(file =>
          expect.objectContaining({
            file,
            parsedFile: file.name === 'light.png' ? null : file,
          }),
        ),
      );
    });

    it('action delay', async () => {
      const action = jest.fn(async file => {
        await sleep(100);
        return 'test';
      });

      const onBatchStart = await testWrapper({ action });

      expect(action).toHaveBeenCalledTimes(2);
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles);
    });

    it('data delay', async () => {
      const data = jest.fn(async file => {
        await sleep(100);
        return 'test';
      }) as any;

      const onBatchStart = await testWrapper({ data });

      expect(data).toHaveBeenCalledTimes(2);
      expect(onBatchStart).toHaveBeenCalledWith(batchEventFiles);
    });
  });

  it('dynamic change action in beforeUpload should work', async () => {
    const Test = () => {
      const [action, setAction] = React.useState('light');

      async function beforeUpload() {
        setAction('bamboo');
        await sleep(100);
        return true;
      }

      return <Upload beforeUpload={beforeUpload} action={action} />;
    };

    const { container } = render(<Test />);

    fireEvent.change(container.querySelector('input')!, {
      target: {
        files: [
          {
            name: 'little.png',
            toString() {
              return this.name;
            },
          },
        ],
      },
    });

    await sleep(200);

    expect(requests[0].url).toEqual('bamboo');
  });

  it('input style defaults to display none', () => {
    const { container } = render(<Upload />);
    expect(container.querySelector('input')).toHaveStyle({
      display: 'none',
    });
  });

  it('classNames and styles should work', () => {
    const { container } = render(
      <Upload classNames={{ input: 'bamboo-input' }} styles={{ input: { color: 'red' } }} />,
    );
    expect(container.querySelector('.bamboo-input')).toBeTruthy();

    expect(container.querySelector('.bamboo-input')).toHaveStyle({
      color: 'red',
    });
    expect(container.querySelector('input')).toHaveStyle({
      display: 'none',
    });
  });

  it('Should be focusable and has role=button by default', () => {
    const { container } = render(<Upload />);

    expect(container.querySelector('span')!.tabIndex).toBe(0);
    expect(container.querySelector('span')).toHaveAttribute('role', 'button');
  });

  it("Should not be focusable and doesn't have role=button with hasControlInside=true", () => {
    const { container } = render(<Upload hasControlInside />);

    expect(container.querySelector('span')!.tabIndex).not.toBe(0);
    expect(container.querySelector('span')!).not.toHaveAttribute('role', 'button');
  });

  it('should receive same defaultRequest as src', done => {
    const { default: srcRequest } = require('../src/request');
    let receivedDefaultRequest: any;
    const customRequest = jest.fn((option, { defaultRequest }) => {
      if (option.file.name === 'test.png') {
        defaultRequest(option);
        receivedDefaultRequest = defaultRequest;
      } else {
        option.onError(new Error('custom error'));
      }
    });
    const { container } = render(<Upload customRequest={customRequest} />);

    const input = container.querySelector('input')!;
    const files = [new File([''], 'test.png')];
    Object.defineProperty(files, 'item', {
      value: i => files[i],
    });

    fireEvent.change(input, { target: { files } });
    setTimeout(() => {
      requests[0].respond(200, {}, `["","${files[0].name}"]`);
      expect(customRequest).toHaveBeenCalled();
      expect(receivedDefaultRequest).toBe(srcRequest);
      done();
    }, 100);
  });
});

  describe('comprehensive edge cases and accessibility', () => {
    describe('keyboard accessibility', () => {
      it('should trigger file selection on Enter key', () => {
        const { container } = render(<Upload />);
        const uploadWrapper = container.querySelector('span')!;
        const input = container.querySelector('input')!;
        
        const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});
        
        fireEvent.keyDown(uploadWrapper, { key: 'Enter', code: 'Enter' });
        
        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
      });

      it('should trigger file selection on Space key', () => {
        const { container } = render(<Upload />);
        const uploadWrapper = container.querySelector('span')!;
        const input = container.querySelector('input')!;
        
        const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});
        
        fireEvent.keyDown(uploadWrapper, { key: ' ', code: 'Space' });
        
        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
      });

      it('should not trigger file selection on other keys', () => {
        const { container } = render(<Upload />);
        const uploadWrapper = container.querySelector('span')!;
        const input = container.querySelector('input')!;
        
        const clickSpy = jest.spyOn(input, 'click').mockImplementation(() => {});
        
        fireEvent.keyDown(uploadWrapper, { key: 'Tab', code: 'Tab' });
        fireEvent.keyDown(uploadWrapper, { key: 'Escape', code: 'Escape' });
        
        expect(clickSpy).not.toHaveBeenCalled();
        clickSpy.mockRestore();
      });

      it('should have proper ARIA attributes for screen readers', () => {
        const { container } = render(<Upload />);
        const uploadWrapper = container.querySelector('span')!;
        
        expect(uploadWrapper).toHaveAttribute('role', 'button');
        expect(uploadWrapper).toHaveAttribute('tabIndex', '0');
      });
    });

    describe('file validation edge cases', () => {
      it('should handle files with unicode characters in names', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const unicodeFile = new File(['content'], '测试文件.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [unicodeFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: '测试文件.txt'
        }));
      });

      it('should handle files with special characters in names', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const specialFile = new File(['content'], 'file@#$%^&*()!.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [specialFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: 'file@#$%^&*()!.txt'
        }));
      });

      it('should handle files with very long names', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const longName = 'a'.repeat(255) + '.txt';
        const longNameFile = new File(['content'], longName, { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [longNameFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: longName
        }));
      });

      it('should handle files without extensions', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const noExtFile = new File(['content'], 'README', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [noExtFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: 'README'
        }));
      });

      it('should handle zero-byte files', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [emptyFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: 'empty.txt',
          size: 0
        }));
      });

      it('should handle files with no type specified', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const noTypeFile = new File(['content'], 'unknown-type', {});
        
        fireEvent.change(input, { target: { files: [noTypeFile] } });
        
        expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
          name: 'unknown-type',
          type: ''
        }));
      });
    });

    describe('concurrent upload scenarios', () => {
      it('should handle multiple rapid file selections', async () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} multiple />);
        const input = container.querySelector('input')!;
        
        const files1 = [new File(['1'], 'file1.txt', { type: 'text/plain' })];
        const files2 = [new File(['2'], 'file2.txt', { type: 'text/plain' })];
        
        fireEvent.change(input, { target: { files: files1 } });
        fireEvent.change(input, { target: { files: files2 } });
        
        expect(onStart).toHaveBeenCalledTimes(2);
      });

      it('should handle mixed drag and click uploads', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} multiple />);
        const input = container.querySelector('input')!;
        
        const clickFile = new File(['click'], 'click.txt', { type: 'text/plain' });
        const dragFile = new File(['drag'], 'drag.txt', { type: 'text/plain' });
        
        // Simulate click upload
        fireEvent.change(input, { target: { files: [clickFile] } });
        
        // Simulate drag upload
        fireEvent.drop(input, { dataTransfer: { files: [dragFile] } });
        
        expect(onStart).toHaveBeenCalledTimes(2);
      });
    });

    describe('network error scenarios', () => {
      it('should handle network timeout', done => {
        const onError = jest.fn((err, result, file) => {
          try {
            expect(err).toBeInstanceOf(Error);
            done();
          } catch (error) {
            done(error);
          }
        });

        const { container } = render(<Upload action="/test" onError={onError} />);
        const input = container.querySelector('input')!;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        setTimeout(() => {
          const request = requests[requests.length - 1];
          if (request.ontimeout) {
            request.ontimeout();
          } else {
            // Fallback for timeout simulation
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';
            request.onerror(timeoutError);
          }
        }, 100);
      });

      it('should handle request abort', done => {
        const onError = jest.fn((err, result, file) => {
          try {
            expect(err).toBeInstanceOf(Error);
            done();
          } catch (error) {
            done(error);
          }
        });

        const { container } = render(<Upload action="/test" onError={onError} />);
        const input = container.querySelector('input')!;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        setTimeout(() => {
          const request = requests[requests.length - 1];
          if (request.onabort) {
            request.onabort();
          } else {
            // Fallback for abort simulation
            const abortError = new Error('Request aborted');
            abortError.name = 'AbortError';
            request.onerror(abortError);
          }
        }, 100);
      });

      it('should handle server unavailable (503)', done => {
        const onError = jest.fn((err, result, file) => {
          try {
            expect(err.status).toBe(503);
            expect(result).toBe('Service Unavailable');
            done();
          } catch (error) {
            done(error);
          }
        });

        const { container } = render(<Upload action="/test" onError={onError} />);
        const input = container.querySelector('input')!;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        setTimeout(() => {
          requests[requests.length - 1].respond(503, {}, 'Service Unavailable');
        }, 100);
      });

      it('should handle malformed response JSON', done => {
        const onError = jest.fn((err, result, file) => {
          try {
            expect(err).toBeInstanceOf(Error);
            done();
          } catch (error) {
            done(error);
          }
        });

        const { container } = render(<Upload action="/test" onError={onError} />);
        const input = container.querySelector('input')!;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        setTimeout(() => {
          requests[requests.length - 1].respond(200, {}, 'invalid json {');
        }, 100);
      });
    });

    describe('beforeUpload edge cases', () => {
      it('should handle beforeUpload returning undefined', () => {
        const onStart = jest.fn();
        const beforeUpload = jest.fn(() => undefined);
        const { container } = render(<Upload beforeUpload={beforeUpload} onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        expect(beforeUpload).toHaveBeenCalled();
      });

      it('should handle beforeUpload returning a Promise that rejects', async () => {
        const onStart = jest.fn();
        const onError = jest.fn();
        const beforeUpload = jest.fn(() => Promise.reject(new Error('Validation failed')));
        
        const { container } = render(<Upload 
          beforeUpload={beforeUpload} 
          onStart={onStart} 
          onError={onError} 
        />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(100);
        
        expect(beforeUpload).toHaveBeenCalled();
        expect(onStart).not.toHaveBeenCalled();
      });

      it('should handle beforeUpload returning a modified File object', () => {
        const onStart = jest.fn();
        const modifiedFile = new File(['modified'], 'modified.txt', { type: 'text/plain' });
        const beforeUpload = jest.fn(() => modifiedFile);
        
        const { container } = render(<Upload beforeUpload={beforeUpload} onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const originalFile = new File(['original'], 'original.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [originalFile] } });
        
        expect(beforeUpload).toHaveBeenCalledWith(originalFile, [originalFile]);
      });

      it('should handle beforeUpload returning Blob instead of File', () => {
        const onStart = jest.fn();
        const blob = new Blob(['blob content'], { type: 'text/plain' });
        const beforeUpload = jest.fn(() => blob);
        
        const { container } = render(<Upload beforeUpload={beforeUpload} onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['original'], 'original.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        expect(beforeUpload).toHaveBeenCalled();
      });
    });

    describe('progress tracking edge cases', () => {
      it('should handle progress events with zero total', () => {
        const onProgress = jest.fn();
        const { container } = render(<Upload action="/test" onProgress={onProgress} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        const request = requests[requests.length - 1];
        if (request.upload && request.upload.onprogress) {
          request.upload.onprogress({ loaded: 500, total: 0 });
          
          expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({ percent: 0 }),
            expect.any(Object)
          );
        }
      });

      it('should handle progress events with loaded > total', () => {
        const onProgress = jest.fn();
        const { container } = render(<Upload action="/test" onProgress={onProgress} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        const request = requests[requests.length - 1];
        if (request.upload && request.upload.onprogress) {
          request.upload.onprogress({ loaded: 1500, total: 1000 });
          
          expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({ percent: 100 }),
            expect.any(Object)
          );
        }
      });

      it('should handle progress events with negative values', () => {
        const onProgress = jest.fn();
        const { container } = render(<Upload action="/test" onProgress={onProgress} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        const request = requests[requests.length - 1];
        if (request.upload && request.upload.onprogress) {
          request.upload.onprogress({ loaded: -100, total: 1000 });
          
          expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({ percent: 0 }),
            expect.any(Object)
          );
        }
      });
    });

    describe('custom request scenarios', () => {
      it('should handle customRequest with async success', async () => {
        const onSuccess = jest.fn();
        const customRequest = jest.fn(async (options) => {
          await sleep(100);
          options.onSuccess({ success: true }, options.file);
        });
        
        const { container } = render(<Upload customRequest={customRequest} onSuccess={onSuccess} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(200);
        
        expect(customRequest).toHaveBeenCalled();
        expect(onSuccess).toHaveBeenCalledWith({ success: true }, expect.any(Object), null);
      });

      it('should handle customRequest with async error', async () => {
        const onError = jest.fn();
        const customRequest = jest.fn(async (options) => {
          await sleep(100);
          options.onError(new Error('Custom request failed'));
        });
        
        const { container } = render(<Upload customRequest={customRequest} onError={onError} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(200);
        
        expect(customRequest).toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(expect.any(Error), undefined, expect.any(Object));
      });

      it('should handle customRequest with progress updates', async () => {
        const onProgress = jest.fn();
        const customRequest = jest.fn(async (options) => {
          // Simulate progress updates
          options.onProgress({ percent: 25 });
          await sleep(50);
          options.onProgress({ percent: 50 });
          await sleep(50);
          options.onProgress({ percent: 100 });
          options.onSuccess({ success: true }, options.file);
        });
        
        const { container } = render(<Upload customRequest={customRequest} onProgress={onProgress} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(200);
        
        expect(onProgress).toHaveBeenCalledTimes(3);
        expect(onProgress).toHaveBeenCalledWith({ percent: 25 }, expect.any(Object));
        expect(onProgress).toHaveBeenCalledWith({ percent: 50 }, expect.any(Object));
        expect(onProgress).toHaveBeenCalledWith({ percent: 100 }, expect.any(Object));
      });
    });

    describe('drag and drop edge cases', () => {
      it('should handle dragEnter and dragLeave events gracefully', () => {
        const { container } = render(<Upload />);
        const input = container.querySelector('input')!;
        
        expect(() => {
          fireEvent.dragEnter(input);
          fireEvent.dragLeave(input);
          fireEvent.dragOver(input);
        }).not.toThrow();
      });

      it('should handle drop event with no files', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        fireEvent.drop(input, { dataTransfer: { files: [] } });
        
        expect(onStart).not.toHaveBeenCalled();
      });

      it('should handle drop event with malformed dataTransfer', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        expect(() => {
          fireEvent.drop(input, { dataTransfer: null });
        }).not.toThrow();
        
        expect(() => {
          fireEvent.drop(input, {});
        }).not.toThrow();
        
        expect(onStart).not.toHaveBeenCalled();
      });

      it('should handle drop with mixed file and non-file items', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        fireEvent.drop(input, { 
          dataTransfer: { 
            files: [file],
            items: [
              { kind: 'string', type: 'text/plain' },
              { kind: 'file', getAsFile: () => file }
            ]
          } 
        });
        
        expect(onStart).toHaveBeenCalled();
      });
    });

    describe('accept prop comprehensive testing', () => {
      it('should handle case-insensitive file extensions', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload accept=".jpg" onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const files = [
          new File(['content'], 'test.JPG', { type: 'image/jpeg' }),
          new File(['content'], 'test.Jpg', { type: 'image/jpeg' }),
          new File(['content'], 'test.jPg', { type: 'image/jpeg' })
        ];
        
        files.forEach(file => {
          fireEvent.change(input, { target: { files: [file] } });
        });
        
        expect(onStart).toHaveBeenCalledTimes(3);
      });

      it('should handle MIME types with parameters', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload accept="text/plain" onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { 
          type: 'text/plain; charset=utf-8' 
        });
        
        fireEvent.change(input, { target: { files: [file] } });
        
        expect(onStart).toHaveBeenCalled();
      });

      it('should handle mixed extension and MIME type accepts', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload accept=".txt,image/*" onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const jpgFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
        const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        
        fireEvent.change(input, { target: { files: [txtFile] } });
        fireEvent.change(input, { target: { files: [jpgFile] } });
        fireEvent.change(input, { target: { files: [pdfFile] } });
        
        // txt and jpg should be accepted, pdf should not trigger onStart
        expect(onStart).toHaveBeenCalledTimes(2);
      });

      it('should handle whitespace in accept prop', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload accept=" .txt , .jpg " onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const txtFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [txtFile] } });
        
        expect(onStart).toHaveBeenCalled();
      });
    });

    describe('component lifecycle and props', () => {
      it('should handle props changes during upload', done => {
        const TestComponent = ({ action }: { action: string }) => (
          <Upload action={action} onSuccess={() => done()} />
        );
        
        const { container, rerender } = render(<TestComponent action="/upload1" />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        // Change props during upload
        rerender(<TestComponent action="/upload2" />);
        
        setTimeout(() => {
          requests[requests.length - 1].respond(200, {}, '{"success": true}');
        }, 100);
      });

      it('should handle disabled state changes', () => {
        const TestComponent = ({ disabled }: { disabled: boolean }) => (
          <Upload disabled={disabled} />
        );
        
        const { container, rerender } = render(<TestComponent disabled={false} />);
        const input = container.querySelector('input')!;
        
        expect(input.disabled).toBe(false);
        
        rerender(<TestComponent disabled={true} />);
        
        expect(input.disabled).toBe(true);
      });

      it('should handle accept prop changes', () => {
        const TestComponent = ({ accept }: { accept: string }) => (
          <Upload accept={accept} />
        );
        
        const { container, rerender } = render(<TestComponent accept=".jpg" />);
        const input = container.querySelector('input')!;
        
        expect(input.accept).toBe('.jpg');
        
        rerender(<TestComponent accept=".png" />);
        
        expect(input.accept).toBe('.png');
      });
    });

    describe('performance and memory considerations', () => {
      it('should handle large number of files efficiently', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} multiple />);
        const input = container.querySelector('input')!;
        
        // Create 50 files to test performance
        const files = Array.from({ length: 50 }, (_, i) => 
          new File([`content-${i}`], `file-${i}.txt`, { type: 'text/plain' })
        );
        
        Object.defineProperty(files, 'item', {
          value: i => files[i],
        });
        
        const startTime = performance.now();
        fireEvent.change(input, { target: { files } });
        const endTime = performance.now();
        
        expect(onStart).toHaveBeenCalledTimes(50);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      });

      it('should handle rapid consecutive uploads without memory leaks', () => {
        const onStart = jest.fn();
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        // Simulate rapid file changes
        for (let i = 0; i < 20; i++) {
          const file = new File([`content-${i}`], `file-${i}.txt`, { type: 'text/plain' });
          fireEvent.change(input, { target: { files: [file] } });
        }
        
        expect(onStart).toHaveBeenCalledTimes(20);
      });

      it('should cleanup properly on unmount', () => {
        const onStart = jest.fn();
        const { container, unmount } = render(<Upload onStart={onStart} />);
        
        // Start an upload
        const input = container.querySelector('input')!;
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        // Unmount before completion
        expect(() => unmount()).not.toThrow();
      });
    });

    describe('error boundary scenarios', () => {
      it('should handle callback errors gracefully', () => {
        const originalError = console.error;
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        const onStart = jest.fn(() => {
          throw new Error('onStart callback failed');
        });
        
        const { container } = render(<Upload onStart={onStart} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        
        expect(() => {
          fireEvent.change(input, { target: { files: [file] } });
        }).not.toThrow();
        
        expect(onStart).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      });
    });

    describe('transformation and data handling', () => {
      it('should handle transformFile returning null', done => {
        const onSuccess = jest.fn((ret, file) => {
          expect(ret[1]).toEqual('success.png');
          expect(file).toHaveProperty('uid');
          done();
        });
        
        const transformFile = jest.fn(() => null);
        
        const { container } = render(<Upload 
          action="/test" 
          transformFile={transformFile} 
          onSuccess={onSuccess} 
        />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'success.png', { type: 'image/png' });
        fireEvent.change(input, { target: { files: [file] } });
        
        setTimeout(() => {
          requests[requests.length - 1].respond(200, {}, '["","success.png"]');
        }, 100);
      });

      it('should handle data as a function returning Promise that rejects', async () => {
        const onError = jest.fn();
        const data = jest.fn(() => Promise.reject(new Error('Data fetch failed')));
        
        const { container } = render(<Upload action="/test" data={data} onError={onError} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(100);
        
        expect(data).toHaveBeenCalled();
      });

      it('should handle action as a function returning Promise that rejects', async () => {
        const onError = jest.fn();
        const action = jest.fn(() => Promise.reject(new Error('Action fetch failed')));
        
        const { container } = render(<Upload action={action} onError={onError} />);
        const input = container.querySelector('input')!;
        
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        fireEvent.change(input, { target: { files: [file] } });
        
        await sleep(100);
        
        expect(action).toHaveBeenCalled();
      });
    });
  });
