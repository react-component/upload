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
export default async function asyncPool<T, U>(
  concurrencyLimit: number,
  items: T[],
  asyncTask: (item: T) => Promise<U>,
): Promise<U[]> {
  const tasks: Promise<U>[] = [];
  const pendings: Promise<U>[] = []


  for (const item of items) {
    const task = asyncTask(item);
    tasks.push(task);

    if (concurrencyLimit <= items.length) {
      task.then(() => {
        pendings.splice(pendings.indexOf(task), 1)
      })
      pendings.push(task)

      if (pendings.length >= concurrencyLimit) {
        await Promise.race(pendings)
      }
    }
  }

  return Promise.all(tasks)
}