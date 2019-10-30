const wxApi = require("../utils/wxApi.js");
const eventListener = require("../utils/event.js");
const eventType = require("../eventType.js");
const env = require("../config/env.js");
const envConstant = require("../config/constant.js");
const appName = envConstant.ONLINE;  // 正式环境
//const appName = envConstant.TEST;  // 测试环境
// const appName = envConstant.DEV;  // 开发环境
// const appName = envConstant.LOCAL_NETWORK //本地环境
const envConfig = env.getEnv(appName);

function UserClass ()  {
  this.config = {
    ApiRoot: envConfig.ApiRoot,
    ApiPath: "/v1",
    // AppId: envConfig.AppId,
    isDEV: envConfig.isDEV,
    qiniuDomain: "https://static.newkr.net/",
    preFix:envConfig.preFix
  }

  this.state = {
    token: "",
    userId: "",
    isManager: null,
    isLogining: false,
    // showPublishBtn: false,
    // haveAvatarAndName: false,

    // publishData: [],
    // publistContent: ""
  }
  this.setState = (options, callback)=> {
    const prevState = this.state;
    this.state = {
      ...this.state,
      ...options
    };

    // !!callback && callback(this.state);

    // event.emit(eventType.GLOBAL_STATE_CHANGED, {
    //   state: this.state,
    //   prevState
    // });
  }
  this.login = ()=> {
    const _this = this;
    const config = this.config;

    eventListener.off(eventType.LOGIN_SUCCESS);
    this.setState({
      isLogining: true
    });
    //这里逻辑说明：
    // 后台人员说，登录后台验证，需要先login拿到code，再拿用户授权拿到的iv跟encryptedData
    // 所以这里逻辑为这样
    return wxApi.login()
      .then(res => {
        this.setState({code:res.code})
        return wxApi.getUserInfo()
      }
      ).then(res=>{
       // console.log('登录接口',res);
        return wxApi.request({
          url: `${config.ApiRoot}/auth/login`,
          method: "POST",
          data: {
            // appId: config.AppId,
            code: _this.state.code,
            iv: res.iv,
            encryptedData: res.encryptedData,
            channel_id: wx.getStorageSync('channel_id') ? wx.getStorageSync('channel_id'): "1"
          }
        })
      })

      .then(res => {
       
        const { code, data, msg } = res.data;
        if (code == 10000) {

          // 新用户在页面登录，需要全局拿一次个人数据，存在全局
          this.onFetchUserData();

         // console.log('登录数据', data);

          this.setState({
            token: data.access_token,
            // userId: res.data.data.id,
            // isManager: res.data.data.isManager
          });
          eventListener.emit("indexLoginCallBack");
          eventListener.emit(eventType.LOGIN_SUCCESS, data);
          // 这里不引用 utils/localStorage.js
          // 因为 utils/localStorage.js 调用了 app(),造成循环引用了，导致页面报错
          // 这里只能这样使用了
          wxApi.setStorage({
            key: `${this.config.preFix}token`,
            data: data.access_token
          });
          // wxApi.setStorage({
          //   key: "mobileFlag",
          //   data: data.mobileFlag
          // });
          // wxApi.setStorage({
          //   key: "isGuestStatus",
          //   data: false
          // });
        } else {
          throw res;
        }

        this.setState({
          isLogining: false
        });
      })
      .catch(error => {
        console.log(error);
      });
  }
  this.PLogin =()=>{
    return new Promise((resolve,reject) =>{
      const _this = this;
      const config = this.config;

      eventListener.off(eventType.LOGIN_SUCCESS);
      this.setState({
        isLogining: true
      });
      //这里逻辑说明：
      // 后台人员说，登录后台验证，需要先login拿到code，再拿用户授权拿到的iv跟encryptedData
      // 所以这里逻辑为这样
      return wxApi.login()
        .then(res => {
          this.setState({ code: res.code })
          return wxApi.getUserInfo()
        }
        ).then(res => {
         // console.log('登录接口',res);
          return wxApi.request({
            url: `${config.ApiRoot}/auth/login`,
            method: "POST",
            data: {
              // appId: config.AppId,
              code: _this.state.code,
              iv: res.iv,
              encryptedData: res.encryptedData,
              channel_id: wx.getStorageSync('channel_id') ? wx.getStorageSync('channel_id'): "1"
            }
          })
        })

        .then(res => {

          const { code, data, msg } = res.data;
          if (code == 10000) {

            // 新用户在页面登录，需要全局拿一次个人数据，存在全局
            this.onFetchUserData();
            eventListener.emit("indexLoginCallBack");

            this.setState({
              token: data.access_token,
              // userId: res.data.data.id,
              // isManager: res.data.data.isManager
            });

            // eventListener.emit(eventType.LOGIN_SUCCESS, data);

            // wxApi.setStorage({
            //   key: "mobileFlag",
            //   data: data.mobileFlag
            // });
            wxApi.setStorage({
              key: `${this.config.preFix}token`,
              data: data.access_token
            });
            // wxApi.setStorage({
            //   key: "token",
            //   data: data.access_token
            // });
            // wxApi.setStorage({
            //   key: "isGuestStatus",
            //   data: false
            // });
            resolve(res)
          } else {
            throw res;
          }

          this.setState({
            isLogining: false
          });
        })
        .catch(error => {
          console.log(error);
          reject(error)
        });
    })
  }
  this.getUserInfo = () => {
    return new Promise((resolve,reject) =>{
      wxApi.getUserInfo().then(res => {
        this.setState(res)
        // console.log(this.state)
        resolve(res)
      }).catch(
        err=>{
          reject(err)
        }
      )
    })

    
  }
  this.checkSession = () => {
    
    const _this = this;
    const config = this.config;
    // console.log(this.state);
    
    // const { token, userId, isManager } = this.state;
    const { token } = this.state;
    
    // mock
    // if (this.config.isLocalNetwork) {
    //   wxApi.checkSession = () => {
    //     return new Promise(resolve => resolve());
    //   };
    // }
    
    // 当state中已经有token、userId、isManager等数据时，只检测微信授权是否过期
    // if (!!token && !!userId && isManager !== null) {
    if (!!token) {
      return wxApi.checkSession().catch(e => {
        // 未登录且当前没有真正运行的登录请求
        if (!this.state.isLogining) {
            return _this.login();
        }
      });
    }
    
    //this.state.islogining可以避免触发多次login
    return new Promise(resolve => {
      wxApi.checkSession()
        .then(res => {

          // 先检测localStorage中是否已经存有数据了
          return Promise.all([
            wxApi.getStorage({ key: `${this.config.preFix}token` }),
            // wxApi.getStorage({ key: 'userId' }),
            // wxApi.getStorage({ key: 'isManager' })
          ]);
        })
        .then(values => {
          // 从localStorage中获取数据
          console.log(values)
          _this.setState({
            token: values[0].data,
            // userId: values[1].data,
            // isManager: values[2].data
          });
          console.log(_this.state);
            resolve();
        })
        .catch(e => {
          // 通过登录获取数据, 判断isLogining状态，避免重复登录请求
          if (!this.state.isLogining) {
               resolve(_this.login());
          } else {
             eventListener.on(eventType.LOGIN_SUCCESS, () => {
              resolve();
            });
          }
        });
    });
  }
  this.request = (options) => {
    const _this = this;

    const _setToken = function (data, token) {
      data.header ={
        "Authorization": 'Bearer '+token,
        "version":'1'
      }
      // if (data.method === "GET" || !data.method) {
      //   if (!data.data) data.data = {};
      //   data.data._token = token;
      // } else if (data.method === "POST") {
      //   const url = data.url;
      //   data.url = `${url}${/\?/.test(url) ? "&" : "?"}_token=${token}`;
      // }
    }
    options.data = options.data || {};

    // promise 是给当有几个请求返回值都为400001时，能够挂载起代码，不让代码继续执行下去
    return new Promise(resolve => {
      _this.checkSession().then(res => {
      
        _setToken(options, _this.state.token);

        return wxApi.request(options).then(res => {
          const { code, data, errMsg } = res.data;

          if (code === 10001) {
             // console.log("重新登录");
            // 如果遇到token error,则重新登录，获取token
            if (!this.state.isLogining) {
              _this.login().then(() => {
                setTimeout(()=>{
                  _setToken(options, _this.state.token);
                  wxApi.request(options).then(res => resolve(res));
                },100);
              });
             // console.log("未登录");
            } else {
              eventListener.on(eventType.LOGIN_SUCCESS, data => {
                setTimeout(()=>{
                  _setToken(options, _this.state.token);
                  wxApi.request(options).then(res => resolve(res));
                },100)
               
              });
             // console.log("登录");
            }
          } else {
          
            setTimeout(()=>{
                resolve(res);
            },100)
         
           // console.log("直接请求数据");
          
          }
        }).catch(err => { console.log(err) });
      });
    });
  }
  // this.formAction = (formId) => {
  //   let currentDate = new Date();
  //   let formIdObj = wx.getStorageSync("formIdObj");
  //   let url = `${this.config.ApiRoot}/user/form-id/save`;
  //   let queryObj = {
  //     url,
  //     method: "POST",
  //     data: {
  //       form_id: formId
  //     }

  //   }
  //   if (!formIdObj) {
  //     formIdObj = {
  //       form_id: formId,
  //       time: currentDate.getTime()
  //     }

  //     this.request(queryObj).then(res => {
  //       console.log("formId success");
  //     }).catch(err => {
  //       console.log(err)
  //     })
  //     wx.setStorageSync("formIdObj", JSON.stringify(formIdObj))
  //   } else {
  //     formIdObj = JSON.parse(formIdObj);
  //     let duringTime = currentDate.getTime() - formIdObj.time;
  //     if (duringTime >= 1000 * 60 * 60 * (this.state.form_id_update_interval || 3)) {
  //       this.request(queryObj).then(res => {
  //         console.log("formId success");
  //       }).catch(err => {
  //         console.log(err)
  //       })
  //       formIdObj = {
  //         form_id: formId,
  //         time: currentDate.getTime()
  //       }
  //       wx.setStorageSync("formIdObj", JSON.stringify(formIdObj))
  //     }
  //   }
  // },
  this.getDefaultData = function () {
    let url = `${this.config.ApiRoot}/configure/list`;
    let queryObj = {
      url
    }
    wxApi.request(queryObj).then(res => {
      const { code, data, msg } = res.data;
      if (code === 10000) {
        // this.setState(data)
        this.config = {
          ...this.config,
          ...data
        }
        console.log(this.config)
      }
    }).catch(err => {
      console.log(err)
    })
  },

  this.onFetchUserData = function () {
    let _this = this;
    let url = `${this.config.ApiRoot}/auth/me`;
    let data = {
      url,
      method: "POST"
    };
    this.request(data).then(res => {
      const { data, code } = res.data;
      if (code === 10000) {
        if (data.merchant && data.merchant.stores && data.merchant.stores[0] && data.merchant.stores[0].status == 1){
          wx.removeStorageSync("last_user_store_id");
          wx.setStorageSync("self_store_id", data.merchant.stores[0].id);
        }else{
          // console.log(this.config.storeId)
          wx.removeStorageSync("self_store_id");
          // 如果不是店主，从卡片点进来，覆盖下地址
          // this.config.storeId && wx.setStorageSync("last_user_store_id", this.config.storeId)
          // this.config.locationObj && wx.setStorageSync("locationObj", JSON.stringify(this.config.locationObj))
        }

        // 判断本地是否已经保存了头像 避免多次缓存 2019-1-29 注释掉
        // let localAvatatPicPath;
        // this.config && this.config.userInfo && this.config.userInfo.avatarPath && (localAvatatPicPath=this.config.userInfo.avatarPath);


        // this.config = {
        //   ...this.config,
        //   isonLunchStatus: true,
        //   userInfo:{
        //     ...data
        //   }
        // }
        // 上面这种写法会导致config 被存储为另一片地址
        // 虽然都是this.config,但是是改了地址的
        // 使用下面写法
        // 页面可以通过config.key获取值，而不用 userMs.config.key 获取
        this.config.isonLunchStatus=true;
        this.config.userInfo = data;

        // 2019-1-29 注释掉
        // localAvatatPicPath && (this.config.userInfo.avatarPath = localAvatatPicPath);
        // let _this = this;

        // 这里把头像地址转换为本地地址，是为了让canvas 绘图使用
        

        // 保存头像的第二种api
        // wx.downloadFile({
        //   url: data.avatar, //仅为示例，并非真实的资源
        //   success(res) {
        //     // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        //     if (res.statusCode === 200) {
        //       // wx.playVoice({
        //       //   filePath: res.tempFilePath
        //       // })
        //       _this.config.userInfo.avatarPath = res.tempFilePath
        //       console.log("头像保存本地成功")
        //     }
        //   }
        // })

        // 2019-1-29 注释掉，现在不需要保存个人头像了
        // console.log("头像保存中。。。")
        // if(!localAvatatPicPath){
        //   wx.getImageInfo({
        //     src: data.avatar,
        //     success: function (res) {
        //       _this.config.userInfo.avatarPath = res.path
        //       console.log("头像保存本地成功")
        //     }
        //   })
        // }
        
      } else {
        throw res;
      }
    })
    .catch(
      err => {
        console.log(err)
      }
    ).finally(() => wx.hideLoading());
  },
  // 获取七牛上传token
  this._getQNToken = function() {
    const _this = this;
    const url = `${this.config.ApiRoot}${this.config.ApiPath}/media/upload/token`;

    return this.request({
      url,
      data: {
        appId: this.config.AppId
      }
    }).then(res => {
      return res.data;
    });
  }

  // 上传文件至七牛
  this.uploadFile=function(srcList) {
    const _this = this;

    const functions = srcList.map((srcItem, index) => {
      // const key = `${filename}-${index}`
      return wxApi.uploadFile({
        header:{
          Authorization: `Bearer ${wx.getStorageSync(`${this.config.preFix}token`)}`
        },
        url: "https://api.newkr.net/file/upload",
        filePath: srcItem,
        name: 'image',
        // formData: {
        //   'token': qiniuToken,
        //   'key': key
        // },
      }).then(res => {
        const { statusCode, data, errMsg } = res;
        if (statusCode === 200) {
          // const { data } = data
          return JSON.parse(data).data.key;
        } else {
          throw res;
        }
      });
    });

    return Promise.all(functions).then(res => {
      wx.hideLoading();
      return res;
    });


    // return _getQNToken.call(this).then(res => {
    //   const { status, data, errMsg } = res;

    //   if (status === 0) {
    //     const { token: qiniuToken, filename, domainName } = data;

    //     wx.showLoading({
    //       title: '文件上传中...',
    //       mask: true
    //     });

    //     if (typeof srcList === 'string') {
    //       srcList = [srcList];
    //     }

    //     if (!Array.isArray(srcList)) {
    //       throw "\"src\" should be Array";
    //     }

    //     const functions = srcList.map((srcItem, index) => {
    //       const key = `${filename}-${index}`
    //       return wxApi.uploadFile({
    //         url: domainName,
    //         filePath: srcItem,
    //         name: 'file',
    //         formData: {
    //           'token': qiniuToken,
    //           'key': key
    //         },
    //       }).then(res => {
    //         const { statusCode, data, errMsg } = res;
    //         if (statusCode === 200) {
    //           return JSON.parse(data).key;
    //         } else {
    //           throw res;
    //         }
    //       });
    //     });

    //     return Promise.all(functions).then(res => {
    //       wx.hideLoading();
    //       return res;
    //     });

    //   } else {
    //     throw errMsg;
    //   }
    // });
  }
}
module.exports = UserClass;