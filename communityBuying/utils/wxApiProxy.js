// proxy 实现封装wx的所有api

let nullFn = () => {
};
console.log(wx);

function IllegalAPIException(name) {
  this.message = "No Such API [" + name + "]";
  this.name = 'IllegalAPIException';
}
let services = {
  sleep: (time) => {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, time);
    })
  },
  stop: () => {
    return new Promise(function (resolve, reject) {
    })
  },
  taskSequence: () => {
    return new Promise(function (resolve, reject) {
      resolve()
    })
  }
};
// module.exports = new Proxy(services, {
// 这样暴露出去就要被这样引用
// const wsAPI = require("../../utils/wsAPI.js")
export let wsAPI = new Proxy(services, {
  get: function (target, property) {
    if (property in target) {
      return target[property];
    } else if (property in wx) {
      return (obj) => {
        return new Promise(function (resolve, reject) {
          obj = obj || {};
          obj.success = (...args) => {
            resolve(...args)
          };
          obj.fail = (...args) => {
            reject(...args);
          };
          obj.complete = nullFn;
          wx[property](obj);
        });
      }
    } else {
      throw new IllegalAPIException(property);
    }

  }
});