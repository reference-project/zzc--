function utilActions() {

  // 倒计时函数
  this.onSetTimeDesc = function (startTime,endTime,callBack) {
    let _this = this;
    // 2019-1-10 审查代码，好像发现这个清除定时器代码没用，每次调用函数，_this.interval 应该都是undefined
    // 有空得优化下
    _this.interval && clearInterval(_this.interval);
    var totalSecond = (endTime - startTime) / 1000;
    
    if (totalSecond < 0) {
      callBack && callBack(false)
      return;
    }

    _this.interval = setInterval(function () {
      // 秒数   
      var second = totalSecond;

      // 天数位   
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位   
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位   
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位   
      var sec = Math.floor(second - day * 3600 * 24 - hr * 3600 - min * 60);
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr
      callBack && callBack("true", { countDownDay: dayStr, countDownHour: hrStr, countDownMinute: minStr, countDownSecond: secStr})
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(_this.interval);
        callBack && callBack(false)
      }
    }.bind(this), 1000);
  },

  // 弹窗提示框事件
  this.alertHandler = function (alertText) {
    const _this = this;
    _this.setData({
      "state.alertingStatus": true,
      "state.alertingWords": alertText?alertText:""
    })
    setTimeout(function () {
      _this.setData({
        "state.alertingStatus": false
      })
    }, 2000)
  },

  // 隐藏字符串中间部分函数
  this.formateToShadowText = function(startlength,endLength,startString){
    // startlength 需要被替换为*号的首下标
    // endLength 结束下标距离字符串最尾的长度
    let ShadowText = ""
    if(startString.length>2){
      ShadowText = startString.substr(0, startlength) + "*".repeat(startString.length - startlength - endLength) + startString.substr(startString.length - endLength);
    } else if (startString.length == 2){
      ShadowText = startString.substr(0, 1) + "*".repeat(1);
    }else{
      ShadowText = startString;
    }
    // console.log(Array(21).join('x'));
    // console.log('x'.repeat(20));
    return ShadowText;
  }
}
module.exports = utilActions;