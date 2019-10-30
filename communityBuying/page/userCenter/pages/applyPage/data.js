module.exports = {
  data: {
    region: ['', '', ''],
    multiArray: [['全部'], ["全部"], ["全部"]],
    multiIndex: [0, 0, 0],
    provinceObj: {},
    cityObj: {},
    countyObj: {},
    mobile: "",
    code: "",
    timer: 0,
    agreeStatus: true,
    isTrueStatus: true,
    shopName: "",
    firstStep: false,
    secondStep: false,
    successStatus: false,
    selectCom:{},
    chatName:""
  },
  state: {
    phoneWrongStatus:false,
    codeWrongStatus:false
  },
  others: {
    pageUrl: "applyPage",

  }
}