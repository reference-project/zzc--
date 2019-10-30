//  事件总线对象
var Event = {
  //  触发事件的方法
  // emit(event, ...params) { 
  // 这样传递参数，会在on中，以数组形式接收到
  emit(event, params) {   // 对象形式接收到
    this.eventList[event] && this.eventList[event].forEach((e, index, eventList) => {
      e.callback(params);
      if (e.once) {
        //  如果是一次性事件监听器，则移除
        eventList.splice(index, 1)
      }
    })
  },
  //  注册事件监听器
  on(event, callback, once) {
    //  如果还没有该事件的监听器队列，则创建一个
    if (!this.eventList[event]) {
      this.eventList[event] = [];
    }
    //  新建一个事件监听器对象，并将监听器保存为 callback 属性
    let eObj = {
      callback: callback
    }
    //  如果是一次性的，就添加一个标记
    if (once) {
      eObj.once = true
    }
    //  添加到事件监听器队列中
    this.eventList[event].push(eObj)
  },
  //  注册一次性事件监听器
  once(event, callback) {
    this.on(event, callback, true);
  },
  //  移除事件监听器
  off(event, callback) {
    if (!event) {
      //  如果没有提供参数，则移除所有的事件监听器
      this.eventList = {}
    } else if (!callback) {
      //  如果只提供了事件，则移除该事件所有的监听器
      this.eventList[event] = []
    } else {
      //  如果同时提供了事件与回调，则只移除这个回调的监听器
      let index = this.eventList[event].indexOf(callback);
      this.eventList[event].splice(index, 1)
    }
  },
  //  事件列表
  eventList: {}
}
module.exports = Event;