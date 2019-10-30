// components/authorize/authorize.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    imgUrl: {
      type: String,
      value: ""
    }
  },
  methods: {
    userInfoHandler: function (e) {
      this.triggerEvent("getuserinfo",e.detail);
    },
  }
})