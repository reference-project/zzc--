class AddressActions {
  bindMultiPickerColumnChange(e) {
    let _this = this;
    let regions = this.data.data.regions;
    console.log(e)
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

    switch (e.detail.column) {
      case 0:
        let currentIndex = e.detail.value;
        // if(currentIndex < 1) {
        //   _this.data.data.multiArray = [_this.data.data.multiArray[0], ["全部"], ["全部"]];
        //   _this.data.data.multiIndex = [0, 0, 0];
        //   this.setData({
        //     data: _this.data.data
        //   })
        //   return;
        // };
        let selectWord = regions[0].children[currentIndex].name;
        let childrens = regions[0].children[currentIndex].children;
        let arr = childrens.map(item => {
          return item.name
        });
        // arr.unshift("全部")
        let arrThird = []
        arrThird = childrens[0].children.map(item => {
          return item.name
        })

        _this.data.data.multiArray = [_this.data.data.multiArray[0], arr, arrThird];
        _this.data.data.multiIndex = [currentIndex, 0, 0];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log(arr)
        console.log("第一列")
        break;
      case 1:
        let firstIndex = _this.data.data.multiIndex[0];
        currentIndex = e.detail.value;
        // if (currentIndex < 1) {

        //   _this.data.data.multiArray = [_this.data.data.multiArray[0], _this.data.data.multiArray[1], ["全部"]];
        //   _this.data.data.multiIndex = [_this.data.data.multiIndex[0], currentIndex, 0];
        //   console.log(currentIndex)
        //   this.setData({
        //     data: _this.data.data
        //   })
        //   return;

        // }
        console.log(currentIndex)
        // console.log(regions[0].children[firstIndex ])
        selectWord = regions[0].children[firstIndex].children[currentIndex].name;
        childrens = regions[0].children[firstIndex].children[currentIndex].children;
        arr = childrens.map(item => {
          return item.name
        });
        // arr.unshift("全部")
        _this.data.data.multiArray = [_this.data.data.multiArray[0], _this.data.data.multiArray[1], arr];
        _this.data.data.multiIndex = [_this.data.data.multiIndex[0], currentIndex, 0];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log(arr)
        console.log("第二列")
        break;
      case 2:
        firstIndex = _this.data.data.multiIndex[0];
        currentIndex = e.detail.value;
        _this.data.data.multiIndex = [_this.data.data.multiIndex[0], _this.data.data.multiIndex[1], currentIndex];
        // this.setData({
        //   data: _this.data.data
        // })
        console.log("第三列")
        break;
    }
    this.setData({
      data: _this.data.data
    })
  }
  bindMultiPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    let indexs = e.detail.value;
    const lastChooseIndex = this.data.data.lastChooseIndex;
    if(lastChooseIndex == indexs.join("")) return;
    this.setData({
      "data.lastChooseIndex":indexs.join(""),
    })
    let provinces = this.data.data.regions[0].children;
    let selectProvinceObj = provinces[indexs[0]];
    let citys = selectProvinceObj.children;
    let selectCityObj = citys[indexs[1]];
    let countys = selectCityObj.children;
    let selectCountyObj = countys[indexs[2]];

    this.data.data.provinceObj = {
      name: selectProvinceObj.name,
      id: selectProvinceObj.id,
      code:selectProvinceObj.code
    }
    this.data.data.cityObj = {
      name: selectCityObj.name,
      id: selectCityObj.id,
      code: selectCityObj.code
    }
    this.data.data.countyObj = {
      name: selectCountyObj.name,
      id: selectCountyObj.id,
      code: selectCountyObj.code
    }
    this.setData({
      data: this.data.data
    })
    this.changeAddressCallback && this.changeAddressCallback();
  }
}
module.exports = AddressActions;