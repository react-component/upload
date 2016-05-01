
import expect from 'expect.js';
import request from '../src/request';
import sinon from 'sinon';

let xhr, requests;

const empty = function() {};
const option = {
  onSuccess: empty,
  action: 'upload.do',
  data: { a: 1, b: 2 },
  filename: 'a.png',
  file: 'foo',
  headers: { from: 'hello' },
};

describe('request', function() {
  beforeEach(function() {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (req) { requests.push(req); };
  });

  afterEach(function() {
    xhr.restore();
  });

  beforeEach(function() {
    option.onError = empty;
    option.onSuccess = empty;
  });

  it('upload request success', function(done) {
    option.onError = done;
    option.onSuccess = function(ret) {
      expect(ret).to.eql({ success: true });
      done();
    };
    request(option);
    requests[0].respond(200, {}, '{"success": true}');
  });

  it('2xx code should be success', function(done) {
    option.onError = done;
    option.onSuccess = function(ret) {
      expect(ret).to.equal('');
      done();
    };
    request(option);
    requests[0].respond(204, {});
  });

  it('30x code should be error', function(done) {
    option.onError = function(e) {
      expect(e.toString()).to.contain('304')
      done();
    };

    option.onSuccess = function(ret) {
      done('304 should throw error');
    };
    request(option);
    requests[0].respond(304, {}, 'Not Modified');
  });

  it('get headers', function() {
    request(option);
    expect(requests[0].requestHeaders).to.eql({
      'X-Requested-With': 'XMLHttpRequest',
      from: 'hello',
    });
  });

  it('can empty X-Requested-With', function() {
    option.headers['X-Requested-With'] = null;
    request(option);
    expect(requests[0].requestHeaders).to.eql({
      from: 'hello',
    });
  });

});
