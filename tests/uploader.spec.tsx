import { fireEvent, render } from '@testing-library/react';
import { resetWarned } from 'rc-util/lib/warning';
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
            return [];
          }

          first = false;
          return handle(item.children.map(makeFileSystemEntry));
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

    it('paste to upload', done => {
      const rcUpload = uploader.container.querySelector('.rc-upload')!;
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

      fireEvent.mouseEnter(rcUpload);
      fireEvent.paste(input, {
        clipboardData: { files },
      });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('paste unaccepted type files to upload will not trigger onStart', done => {
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
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });

    it('paste files with multiple false', done => {
      const { container } = render(<Upload {...props} multiple={false} />);
      const rcUpload = container.querySelector('.rc-upload')!;
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

      fireEvent.mouseEnter(rcUpload);
      fireEvent.paste(input, { clipboardData: { files } });

      setTimeout(() => {
        handlers.onSuccess!(['', files[0].name] as any, files[0] as any, null!);
      }, 100);
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

    it('support onMouseEnter and onMouseLeave', async () => {
      const onMouseEnter = jest.fn();
      const onMouseLeave = jest.fn();

      const { container } = render(
        <Upload onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />,
      );
      const rcUpload = container.querySelector('.rc-upload')!;

      fireEvent.mouseEnter(rcUpload);
      fireEvent.mouseLeave(rcUpload);
      expect(onMouseEnter).toHaveBeenCalled();
      expect(onMouseLeave).toHaveBeenCalled();
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
});
