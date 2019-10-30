module.exports = {
  data: {
    contact:"",
    mobile:"",
    city:"",
    detailAddress: "",
    zipCode:"",
    // provinceName: "",
    // cityName: "",
    // countyName: "",
    addressType:"company",
    region: ['', '', ''],
    customItem: '全部',
    multiArray: [['全部'], ["全部"], ["全部"]],
    multiIndex: [0, 0, 0],
    provinceObj:{},
    cityObj:{},
    countyObj:{}
  },
  state: {
    addressType: "company",
    addressTypes: [
      {
        text: "公司",
        type: "company"
      },
      {
        text: "家",
        type: "home"
      },
      {
        text: "临时",
        type: "temporary"
      }
    ]
  },
  others: {
    pageUrl: "addressEditPage",
    
  }
}