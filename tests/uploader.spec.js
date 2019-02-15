/* eslint no-console:0 */

import expect from 'expect.js';
import Uploader from '../index';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
const { Simulate } = TestUtils;
import sinon from 'sinon';

function Item(name) {
  this.name = name;
  this.toString = () => this.name;
}

const makeFileSystemEntry = (item) => {
  const isDirectory = Array.isArray(item.children);
  const ret = {
    isDirectory,
    isFile: !isDirectory,
    file: (handle) => {
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

const makeDataTransferItem = (item) => {
  return {
    webkitGetAsEntry: () => makeFileSystemEntry(item),
  };
};

describe('uploader', () => {
  let requests;
  let xhr;

  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = req => requests.push(req);
  });

  afterEach(() => {
    xhr.restore();
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

    beforeEach((done) => {
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

    it('with id', (done) => {
      ReactDOM.render(<Uploader id="bamboo" />, node, function init() {
        expect(TestUtils.findRenderedDOMComponentWithTag(this, 'input').id).to.be('bamboo');
        done();
      });
    });

    it('create works', () => {
      expect(TestUtils.scryRenderedDOMComponentsWithTag(uploader, 'span').length).to.be(1);
    });

    it('upload success', (done) => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

      const files = [{
        name: 'success.png',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).to.eql(file.name);
        expect(file).to.have.property('uid');
        done();
      };

      handlers.onError = (err) => {
        done(err);
      };

      Simulate.change(input, { target: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('upload error', (done) => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

      const files = [{
        name: 'error.png',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];

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

    it('drag to upload', (done) => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

      const files = [{
        name: 'success.png',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];

      handlers.onSuccess = (ret, file) => {
        expect(ret[1]).to.eql(file.name);
        expect(file).to.have.property('uid');
        done();
      };

      handlers.onError = (err) => {
        done(err);
      };

      Simulate.drop(input, { dataTransfer: { files } });

      setTimeout(() => {
        requests[0].respond(200, {}, `["","${files[0].name}"]`);
      }, 100);
    });

    it('drag unaccepted type files to upload will not trigger onStart', (done) => {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');
      const files = [{
        name: 'success.jpg',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];
      Simulate.drop(input, { dataTransfer: { files } });
      const mockStart = jest.fn();
      handlers.onStart = mockStart;
      setTimeout(() => {
        expect(mockStart.mock.calls.length).to.be(0);
        done();
      }, 100);
    });

    it('support action is function returns Promise', (done) => {
      const action = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve('/upload.do');
          }, 1000);
        });
      };
      ReactDOM.render(<Uploader action={action} />, node, function init() {
        uploader = this;
        const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');
        const files = [{
          name: 'success.png',
          toString() {
            return this.name;
          },
        }];
        files.item = (i) => files[i];
        Simulate.change(input, { target: { files } });
        setTimeout(() => {
          expect(requests.length).to.be(0);
          setTimeout(() => {
            console.log(requests);
            expect(requests.length).to.be(1);
            expect(requests[0].url).to.be('/upload.do');
            done();
          }, 1000);
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

    beforeEach((done) => {
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader {...props} />, node, function init() {
        uploader = this;
        done();
      });
    });

    it('unaccepted type files to upload will not trigger onStart', (done) => {
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
});
