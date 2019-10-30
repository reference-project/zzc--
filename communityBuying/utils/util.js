const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTimeOblique = (date,type) => {
  var type = type||'';
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  if(type==1){
    return [year, month, day].map(formatNumber).join('/');
  }
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatTimeWithoutYear = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatTimeWithoutYear2 = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return formatNumber(month) + '月' + formatNumber(day)+'日';
}

const formatTimeToDay = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}
const formatTimeToDayWithoutYear = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [month, day].map(formatNumber).join('-')
}
const formatTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isRealObj(obj) {
  return typeof obj === "object" && typeof obj != null && !Array.isArray(obj);
}

function isArray(obj) {
  return Array.isArray(obj);
}

function mixin(source, target) {
  const copy = function(source, obj) {
    let src, target, copyIsArray, clone;
    for (let key in obj) {
      src = source[key];
      target = obj[key];

      if (src == target) continue;

      if (target && (isRealObj(target) || (copyIsArray = isArray(target)))) {
        if (copyIsArray) {
          copyIsArray = false;
          clone = src && isArray(src) ? src : [];
        } else {
          clone = src && isRealObj(src) ? src : {};
        }

        source[key] = copy(clone, target);
      } else if (target !== undefined) {
        source[key] = target;
      }
    }
    return source;
  };

  const targets = [].slice.call(arguments, 1);

  targets.forEach(function(target) {
    source = copy(source, target);
  });

  return source;
}
function splitIntFloat(amount) {
  let reg = /^(\d+)\.?(\d+)?$/;
  let matchArr = amount.toString().match(reg);
  return matchArr;
}
module.exports = {
  formatTime: formatTime, 
  formatTimeWithoutYear2: formatTimeWithoutYear2,
  formatTimeOblique: formatTimeOblique,
  formatTimeWithoutYear: formatTimeWithoutYear,
  formatTime2: formatTime2,
  formatTimeToDay: formatTimeToDay,
  formatTimeToDayWithoutYear:formatTimeToDayWithoutYear,
  mixin: mixin,
  splitIntFloat: splitIntFloat,
}