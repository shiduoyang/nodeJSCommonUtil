import os from 'os';
import async from 'async';

export function parallelTask(taskList: { func: any; args?: any[] }[]): Promise<any> {
  return new Promise((res, rej) => {
    async.parallelLimit(
      taskList.map((taskInfo, index) => {
        return function (callback) {
          const promise = taskInfo.func instanceof Promise ? taskInfo.func : Promise.resolve(taskInfo.func(...(taskInfo.args ? taskInfo.args : [])));
          promise.then(resultI => callback(null, resultI)).catch(err => callback(err));
        };
      }),
      os.cpus().length,
      (err, results) => {
        if (err) {
          return rej(err);
        }
        res(results);
      }
    );
  });
}