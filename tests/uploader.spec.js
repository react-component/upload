/* eslint no-console:0 */
import React from 'react';
import { format } from 'util';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Uploader from '../index';

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
  });

  describe('transform file before request', () => {
    let uploader;
    beforeEach(() => {
      uploader = mount(<Uploader />);
    });

    afterEach(() => {
      uploader.unmount();
    });

    it('transform file function should be called before data function', done => {
      const props = {
        action: '/test',
        data(file) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                url: file.url,
              });
            }, 500);
          });
        },
        transformFile(file) {
          return new Promise(resolve => {
            setTimeout(() => {
              // eslint-disable-next-line no-param-reassign
              file.url = 'this is file url';
              resolve(file);
            }, 500);
          });
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

      input.simulate('change', { target: { files } });

      setTimeout(() => {
        setTimeout(() => {
          expect(requests[0].requestBody.get('url')).toBe('this is file url');
          done();
        }, 1000);
      }, 100);
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
});
