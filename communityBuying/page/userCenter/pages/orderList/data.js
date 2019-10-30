// const app = getApp();
const data = {
  data: {
    allData: {
      all: {
        label: 'all',
        name: '全部',
        orders: []
      },
      waitpay: {
        label: 'waitpay',
        name: '待付款',
        orders: []
      },
      shipping: {
        label: 'shipping',
        name: '待发货',
        orders: []
      },
      shipped: {
        label: 'shipped',
        name: '配送中',
        orders: []
      },
      success: {
        label: 'success',
        name: '交易成功',
        orders: []
      },
    },
    products:[]
  },
  state: {
    selectedLabel: "all",
    filters: [
      { type: "all", label: "全部",value:-2 },
      { type: "waitpay", label: "待付款", num: 0, value: 0,},
      // { type: "grouping", label: "拼团中", num: 0, value: 7, },
      { type: "shipping", label: "待发货", value: 2,},
      { type: "shipped", label: "配送中", value: 3, },
      { type: "success", label: "待自提", value: 6, },
      // { type: "afterSale", label: "退换/售后",}
      // { type: "refund", label: "退款" }
    ],
    selectedFilterItemIndex: 0,
    alertingStatus: false,
    alertingWords: "",
    actionObj:{
      submit:"",
      cancel:"",
      cancelWord:"",
      submitWord:""
    }
  },
  others: {
    pageUrl: "orderListPage"
  }
}
module.exports = data;