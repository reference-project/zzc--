// promise 实现封装wx的所有api

let nullFn = () => {
  console.log("complete")
};

function promisify(fn) {
  return function (data = {}) {
    Promise.prototype.finally = function (callback) {
      let P = this.constructor;
      return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
      );
    };
    return new Promise((resolve, reject) => {
      data.success = function (res) {
        resolve(res);
      };
      data.fail = function (res) {
        reject(res);
      };
      data.complete = nullFn;
      fn(data);
    });
  };
}

const wxApi = {};

for (let key in wx) {
  wxApi[key] = promisify(wx[key]);
}

module.exports = wxApi;
