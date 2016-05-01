/**
 * only require other specs here
 */

import expect from 'expect.js';
import Uploader from '../index';
const React = require('react');
const ReactDOM = require('react-dom');
const TestUtils = require('react-addons-test-utils');
const Simulate = TestUtils.Simulate;

import './request.spec';

describe('uploader', function() {
  describe('ajax uploader', function() {
    if (typeof FormData === 'undefined') {
      return;
    }

    let node;
    let uploader;
    const handlers = {};

    const props = {
      action: '/test',
      data: {a: 1, b: 2},
      multiple: true,
      onStart(files) {
        const file = files[0];
        console.log('onStart', file, file.name);
        if (handlers.onStart) { handlers.onStart(files); }
      },
      onSuccess(ret, file) {
        console.log('onSuccess', ret);
        if (handlers.onSuccess) { handlers.onSuccess(ret, file); }
      },
      onProgress(step, file) {
        console.log('onProgress', step, file);
      },
      onError(err, result, file) {
        console.log('onError', err);
        if (handlers.onError) { handlers.onError(err, result, file); }
      },
    };

    beforeEach(function(done) {
      node = document.createElement('div');
      document.body.appendChild(node);

      ReactDOM.render(<Uploader {...props} />, node, function() {
        uploader = this;
        done();
      });
    });

    afterEach(function() {
      ReactDOM.unmountComponentAtNode(node);
    });

    it('create works', function() {
      expect(TestUtils.scryRenderedDOMComponentsWithTag(uploader, 'span').length).to.be(1);
    });

    it('upload success', function(done) {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

      const files = [{
        name: 'success.png',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];

      Simulate.change(input, { target: { files } });

      handlers.onSuccess = function(ret, file) {
        expect(ret[1]).to.eql(file.name);
        expect(file).to.have.property('uid');
        done();
      };

      handlers.onError = function(err) {
        done(err);
      };
    });

    it('upload error', function(done) {
      const input = TestUtils.findRenderedDOMComponentWithTag(uploader, 'input');

      const files = [{
        name: 'error.png',
        toString() {
          return this.name;
        },
      }];
      files.item = (i) => files[i];

      Simulate.change(input, { target: { files } });

      handlers.onError = function(err, ret) {
        expect(err instanceof Error).to.equal(true);
        expect(err.status).to.equal(400);
        expect(ret).to.equal('error 400');
        done();
      };
    });
  });
});
