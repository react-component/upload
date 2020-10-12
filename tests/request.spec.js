/* eslint no-console:0 */
import sinon from 'sinon';
import request from '../src/request';

let xhr;
let requests;

const empty = () => {};
const option = {
  onSuccess: empty,
  action: 'upload.do',
  data: { a: 1, b: 2, c: [3, 4] },
  filename: 'a.png',
  file: 'foo',
  headers: { from: 'hello' },
  method: 'post',
};

describe('request', () => {
  beforeEach(() => {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = req => requests.push(req);
  });

  afterEach(() => {
    xhr.restore();
  });

  beforeEach(() => {
    option.onError = empty;
    option.onSuccess = empty;
  });

  it('upload request success', done => {
    option.onError = done;
    option.onSuccess = ret => {
      expect(ret).toEqual({ success: true });
      expect(requests[0].requestBody.getAll('c[]')).toEqual(['3', '4']);
      done();
    };
    request(option);
    requests[0].respond(200, {}, '{"success": true}');
  });

  it('40x code should be error', done => {
    option.onError = e => {
      expect(e.toString()).toContain('404');
      done();
    };

    option.onSuccess = () => done('404 should throw error');
    request(option);
    requests[0].respond(404, {}, 'Not found');
  });

  it('2xx code should be success', done => {
    option.onError = done;
    option.onSuccess = ret => {
      expect(ret).toEqual('');
      done();
    };
    request(option);
    requests[0].respond(204, {});
  });

  it('get headers', () => {
    request(option);
    expect(requests[0].requestHeaders).toEqual({
      'X-Requested-With': 'XMLHttpRequest',
      from: 'hello',
    });
  });

  it('can empty X-Requested-With', () => {
    option.headers['X-Requested-With'] = null;
    request(option);
    expect(requests[0].requestHeaders).toEqual({ from: 'hello' });
  });
});
