/* eslint no-console:0 */
import expect from 'expect.js';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { format } from 'util';
import sinon from 'sinon';
import Uploader from '../index';

const { Simulate } = TestUtils;

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

    let node;
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

    beforeEach(done => {
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader {...props} />, node, function init() {
        uploader = this;
        done();
      });
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('with id', done => {
      ReactDOM.render(<Uploader id="bamboo" />, node, function init() {
        expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input').id).to.be('bamboo');
        done();
      });
    });

    it('should pass through data attributes', done => {
      ReactDOM.render(
        (
          <Uploader
            data-testid="data-testid"
            data-my-custom-attr="custom data attribute"
          />
        ),
        node,
        function init() {
          expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input')
            .getAttribute('data-testid'))
            .to.be('data-testid');
          expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input')
            .getAttribute('data-my-custom-attr'))
            .to.be('custom data attribute');
          done();
        }
      );
    });

    it('should pass through aria attributes', done => {
      ReactDOM.render(<Uploader aria-label="Upload a file"/>, node, function init() {
        expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input')
          .getAttribute('aria-label'))
          .to.be('Upload a file');
        done();
      });
    });

    it('should pass through role attributes', done => {
      ReactDOM.render(<Uploader role="button"/>, node, function init() {
        expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input')
          .getAttribute('role'))
          .to.be('button');
        done();
      });
    });

    it('should not pass through unknown props', done => {
      ReactDOM.render(<Uploader customProp="This shouldn't be rendered to DOM"/>,
        node,
        () => {
          // Fails when React reports unrecognized prop is added to DOM in console.error
          done();
        }
      );
    });

    it('create works', () => {
      expect(TestUtils.scryRenderedDOMComponentsWithTag(uploader, 'span').length).to.be(1);
    });

    it('upload success', done => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

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
        expect(ret[1]).to.eql(file.name);
        expect(file).to.have.property('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      Simulate.change(input, { target: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('upload error', done => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

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
        expect(err instanceof Error).to.equal(true);
        expect(err.status).to.equal(400);
        expect(ret).to.equal('error 400');
        done();
      };

      Simulate.change(input, { target: { files } });
      setTimeout(() => {
        requests[0].respond(400, {}, `error 400`);
      }, 100);
    });

    it('drag to upload', done => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

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
        expect(ret[1]).to.eql(file.name);
        expect(file).to.have.property('uid');
        done();
      };

      handlers.onError = err => {
        done(err);
      };

      Simulate.drop(input, { dataTransfer: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('drag unaccepted type files to upload will not trigger onStart', done => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');
      const files = [
        {
          name: 'success.jpg',
          toString() {
            return this.name;
          },
        },
      ];
      files.item = i => files[i];
      Simulate.drop(input, { dataTransfer: { files } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).to.be(0);
        done();
      }, 100);
    });

    it('drag files with multiple false', done => {
      ReactDOM.unmountComponentAtNode(node);

      // Create new one
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader {...props} multiple={false} />, node, function init() {
        uploader = this;

        const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

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
          expect(ret[1]).to.eql(file.name);
          expect(file).to.have.property('uid');
          expect(triggerTimes).to.eql(1);
          done();
        };

        handlers.onError = err => {
          done(err);
        };

        Simulate.drop(input, { dataTransfer: { files } });

        setTimeout(() => {
          requests[0].respond(200, {}, `["","${files[0].name}"]`);
        }, 100);
      });
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
      ReactDOM.render(<Uploader data={ data } action={action} />, node, function init() {
        uploader = this;
        const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');
        const files = [
          {
            name: 'success.png',
            toString() {
              return this.name;
            },
          },
        ];
        files.item = i => files[i];
        Simulate.change(input, { target: { files } });
        setTimeout(() => {
          expect(requests.length).to.be(0);
          setTimeout(() => {
            console.log(requests);
            expect(requests.length).to.be(1);
            expect(requests[0].url).to.be('/upload.do');
            expect(requests[0].requestBody.get('field1')).to.be('a');
            done();
          }, 2000);
        }, 100);
      });
    });
  });

  describe('directory uploader', () => {
    if (typeof FormData === 'undefined') {
      return;
    }

    let node;
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

    beforeEach(done => {
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader {...props} />, node, function init() {
        uploader = this;
        done();
      });
    });

    it('unaccepted type files to upload will not trigger onStart', done => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');
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
      Simulate.drop(input, { dataTransfer: { items: [makeDataTransferItem(files)] } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).to.be(0);
        done();
      }, 100);
    });
  });

  describe('transform file before request', () => {
    let node;
    let uploader;
    beforeEach(done => {
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader />, node, function init() {
        uploader = this;
        done();
      });
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('transform file function should be called before data function', done => {
      const props = {
        action: '/test',
        data (file) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                url: file.url
              })
            }, 500)
          })
        },
        transformFile (file) {
          return new Promise((resolve) => {
            setTimeout(() => {
              file.url = 'this is file url';
              resolve(file);
            }, 500);
          });
        },
      };
      ReactDOM.render(<Uploader {...props} />, node, function init() {
        uploader = this;
        const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

        const files = [
          {
            name: 'success.png',
            toString() {
              return this.name;
            },
          },
        ];

        files.item = i => files[i];

        Simulate.change(input, { target: { files } });

        setTimeout(() => {
          setTimeout(() => {
            expect(requests[0].requestBody.get('url')).to.be('this is file url');
            done();
          }, 1000);
        }, 100);
      });
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
      ReactDOM.render(<Uploader {...props} />, node, function init() {
        uploader = this;
        const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

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
          expect(ret[1]).to.eql(file.name);
          expect(file).to.have.property('uid');
          done();
        };

        Simulate.change(input, { target: { files } });

        setTimeout(() => {
          requests[0].respond(200, {}, `["","${files[0].name}"]`);
        }, 100);
      });
    });
  });
});
