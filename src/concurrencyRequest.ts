import { ConcurrencyRequestTask, UploadRequestOption } from './interface';
import { prepareData, prepareXHR } from './request';

/**
 * Asynchronously processes an array of items with a concurrency limit.
 *
 * @template T - Type of the input items.
 * @template U - Type of the result of the asynchronous task.
 *
 * @param {number} concurrencyLimit - The maximum number of asynchronous tasks to execute concurrently.
 * @param {T[]} items - The array of items to process asynchronously.
 * @param {(item: T) => Promise<U>} asyncTask - The asynchronous task to be performed on each item.
 *
 * @returns {Promise<U[]>} - A promise that resolves to an array of results from the asynchronous tasks.
 */
async function asyncPool<T, U>(
  concurrencyLimit: number,
  items: T[],
  asyncTask: (item: T) => Promise<U>,
): Promise<U[]> {
  const tasks: Promise<U>[] = [];
  const pendings: Promise<U>[] = [];

  for (const item of items) {
    const task = asyncTask(item);
    tasks.push(task);

    if (concurrencyLimit <= items.length) {
      task.then(() => {
        pendings.splice(pendings.indexOf(task), 1);
      });
      pendings.push(task);

      if (pendings.length >= concurrencyLimit) {
        await Promise.race(pendings);
      }
    }
  }

  return Promise.all(tasks);
}

type DataType = 'form' | 'blob' | 'string';

/**
 * Represents a class for handling concurrent requests with a specified concurrency limit.
 *
 * @template T - The type of data to be uploaded.
 */
export default class ConcurrencyRequester<T> {
  /**
   * The concurrency limit for handling requests simultaneously.
   */
  private concurrencyLimit: number;

  /**
   * An array to store the tasks for concurrent requests.
   */
  private tasks: ConcurrencyRequestTask[] = [];

  /**
   * The type of data to be sent in the request ('form', 'blob', or 'string').
   */
  private dataType: DataType;

  /**
   * Creates an instance of ConcurrencyRequester.
   *
   * @param {number} concurrencyLimit - The concurrency limit for handling requests simultaneously.
   * @param {DataType} [dataType='form'] - The type of data to be sent in the request ('form', 'blob', or 'string').
   */
  constructor(concurrencyLimit: number, dataType: DataType = 'form') {
    this.concurrencyLimit = concurrencyLimit;
    this.dataType = dataType;
  }

  /**
   * Prepares data based on the specified data type.
   *
   * @param {UploadRequestOption<T>} option - The upload request option.
   * @returns {string | Blob | FormData} - The prepared data based on the specified data type.
   * @private
   */
  private prepareData = (option: UploadRequestOption<T>): string | Blob | FormData => {
    if (this.dataType === 'form') {
      return prepareData(option);
    }

    return option.file;
  };

  /**
   * Prepares a task for a concurrent request.
   *
   * @param {UploadRequestOption<T>} option - The upload request option.
   * @returns {ConcurrencyRequestTask} - The prepared task for the concurrent request.
   * @private
   */
  private prepare = (option: UploadRequestOption<T>): ConcurrencyRequestTask => {
    const xhr = prepareXHR(option);

    const data = this.prepareData(option);

    const task: ConcurrencyRequestTask = { xhr, data };

    xhr.onerror = function error(e) {
      task.done?.();
      xhr.onerror(e);
    };

    xhr.onload = function onload(e) {
      task.done?.();
      xhr.onload(e);
    };

    return task;
  };

  /**
   * Appends a new upload request to the tasks array.
   *
   * @param {UploadRequestOption<T>} option - The upload request option.
   * @returns {{ abort: () => void }} - An object with an `abort` function to cancel the request.
   */
  append = (option: UploadRequestOption<T>): { abort: () => void } => {
    const task = this.prepare(option);

    this.tasks.push(task);

    return {
      abort() {
        task.xhr.abort();
      },
    };
  };

  /**
   * Sends all the appended requests concurrently.
   */
  send = (): void => {
    asyncPool(
      this.concurrencyLimit,
      this.tasks,
      item =>
        new Promise<void>(resolve => {
          const xhr = item.xhr;

          item.done = resolve;

          xhr.send(item.data);
        }),
    );
  };
}
