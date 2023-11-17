/* eslint no-console:0 */
import React from 'react';
import { format } from 'util';
import { resetWarned } from 'rc-util/lib/warning';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Uploader from '../index';

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

    let uploader;
    const handlers = {};

    const props = {
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
          handlers.onSuccess(ret, file);
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
      uploader = mount(<Uploader {...props} />);
    });

    afterEach(() => {
      uploader.unmount();
    });

    it('with id', () => {
      const wrapper = mount(<Uploader id="bamboo" />);
      expect(wrapper.find('input').props().id).toBe('bamboo');
    });

    it('should pass through data & aria attributes', () => {
      const wrapper = mount(
        <Uploader
          data-testid="data-testid"
          data-my-custom-attr="custom data attribute"
          aria-label="Upload a file"
        />,
      );
      expect(wrapper.find('input').props()['data-testid']).toBe('data-testid');
      expect(wrapper.find('input').props()['data-my-custom-attr']).toBe('custom data attribute');
      expect(wrapper.find('input').props()['aria-label']).toBe('Upload a file');
    });

    it('should pass through role attributes', () => {
      const wrapper = mount(<Uploader role="button" />);
      expect(wrapper.find('input').props().role).toBe('button');
    });

    it('should not pass through unknown props', () => {
      const wrapper = mount(<Uploader customProp="This shouldn't be rendered to DOM" />);
      expect(wrapper.find('input').props().customProp).toBeUndefined();
    });

    it('create works', () => {
      expect(uploader.find('span').length).toBeTruthy();
    });

    it('upload success', done => {
      const input = uploader.find('input').first();
      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };
      input.simulate('change', { target: { files } });
      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('upload error', done => {
      const input = uploader.find('input').first();

      const files = [
        {
          name: 'error.png',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];

      handlers.onError = (err, ret) => {
        expect(err instanceof Error).toEqual(true);
        expect(err.status).toEqual(400);
        expect(ret).toEqual('error 400');
        done();
      };

      input.simulate('change', { target: { files } });
      setTimeout(() => {
        requests[0].respond(400, {}, `error 400`);
      }, 100);
    });

    it('drag to upload', done => {
      const input = uploader.find('input').first();

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      input.simulate('drop', { dataTransfer: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('drag unaccepted type files to upload will not trigger onStart', done => {
      const input = uploader.find('input').first();
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];
      input.simulate('drop', { dataTransfer: { files } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });

    it('drag files with multiple false', done => {
      const wrapper = mount(<Uploader {...props} multiple={false} />);
      const input = wrapper.find('input').first();

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
        {
          name: 'filtered.png',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];

      // Only can trigger once
      let triggerTimes = 0;
      handlers.onStart = () => {
        triggerTimes += 1;
      };

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        expect(triggerTimes).toEqual(1);
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      input.simulate('drop', { dataTransfer: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('support action and data is function returns Promise', done => {
      const action = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve('/upload.do');
          }, 1000);
        });
      };
      const data = () => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ field1: 'a' });
          }, 1000);
        });
      };
      const wrapper = mount(<Uploader data={data} action={action} />);
      const input = wrapper.find('input').first();

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];
      input.simulate('change', { target: { files } });
      setTimeout(() => {
        expect(requests.length).toBe(0);
        setTimeout(() => {
          console.log(requests);
          expect(requests.length).toBe(1);
          expect(requests[0].url).toBe('/upload.do');
          expect(requests[0].requestBody.get('field1')).toBe('a');
          done();
        }, 2000);
      }, 100);
    });
  });

  describe('directory uploader', () => {
    if (typeof FormData === 'undefined') {
      return;
    }

    let uploader;
    const handlers = {};

    const props = {
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
          handlers.onSuccess(ret, file);
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
      uploader = mount(<Uploader {...props} />);
    });

    it('unaccepted type files to upload will not trigger onStart', done => {
      const input = uploader.find('input').first();
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
      input.simulate('drop', { dataTransfer: { items: [makeDataTransferItem(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).toBe(0);
        done();
      }, 100);
    });

    it('dragging and dropping a non file with a file does not prevent the file from being uploaded', done => {
      const input = uploader.find('input').first();
      const file = {
        name: 'success.png',
      };
      input.simulate('drop', {
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
      const input = uploader.find('input').first();
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ];
      input.simulate('change', { target: { files } });
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

      uploader.unmount();
      uploader = mount(<Uploader {...props} accept="jpg,png" />);

      const input = uploader.find('input').first();
      const files = [
        {
          name: 'unaccepted.webp',
        },
      ];
      input.simulate('change', { target: { files } });
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

    let uploader;
    const handlers = {};

    const props = {
      action: '/test',
      data: { a: 1, b: 2 },
      directory: true,
      onStart(file) {
        if (handlers.onStart) {
          handlers.onStart(file);
        }
      },
    };

    function test(desc, value, files, expectCallTimes, errorMessage, extraProps) {
      it(desc, done => {
        resetWarned();
        const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        uploader = mount(<Uploader {...props} {...extraProps} accept={value} />);
        const input = uploader.find('input').first();
        input.simulate('change', { target: { files } });
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
    let uploader;
    beforeEach(() => {
      uploader = mount(<Uploader />);
    });

    afterEach(() => {
      uploader.unmount();
    });

    it('noes not affect receive origin file when transform file is null', done => {
      const handlers = {};
      const props = {
        action: '/test',
        onSuccess(ret, file) {
          if (handlers.onSuccess) {
            handlers.onSuccess(ret, file);
          }
        },
        transformFile() {
          return null;
        },
      };
      const wrapper = mount(<Uploader {...props} />);
      const input = wrapper.find('input').first();

      const files = [
        {
          name: 'success.png',
          toString() {
            return this.name;
          },
        },
      ];

      files.item = i => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).toEqual(file.name);
        expect(file).toHaveProperty('uid');
        done();
      };

      input.simulate('change', { target: { files } });

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

    async function testWrapper(props) {
      const onBatchStart = jest.fn();
      const wrapper = mount(<Uploader onBatchStart={onBatchStart} {...props} />);

      wrapper.find('input').simulate('change', {
        target: {
          files,
        },
      });

      // Always wait 500ms to done the test
      await sleep();

      expect(onBatchStart).toHaveBeenCalled();
      wrapper.unmount();

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
      });

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

      return <Uploader beforeUpload={beforeUpload} action={action} />;
    };

    const wrapper = mount(<Test />);
    wrapper.find('input').simulate('change', {
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
    const wrapper = mount(<Uploader />);
    expect(wrapper.find('input').props().style.display).toBe('none');
  });

  it('classNames and styles should work', () => {
    const wrapper = mount(
      <Uploader classNames={{ input: 'bamboo-input' }} styles={{ input: { color: 'red' } }} />,
    );
    expect(wrapper.find('.bamboo-input').length).toBeTruthy();

    expect(wrapper.find('.bamboo-input').props().style.color).toEqual('red');
    expect(wrapper.find('input').props().style.display).toBe('none');
  });

  it('the upload button wrapper span does not have the tabIndex attribute', () => {
    const wrapper = mount(<Uploader />);
    expect(wrapper.find('.rc-upload').props().tabIndex).toBe(undefined);
  });
});
