//app.js
//多文件上传图片
let { WeToast } = require('component/wetoast/wetoast.js')
App({
  WeToast,
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    user: "",
    currentproject:'',
    currentbug:'',
    url:'https://www.alltesting.cn/TCE',
    header:{
      'Cookie':''
    },
    bugtypelist: [{
      value: 0,
      level: 2,
      name: "系统崩溃"
    }, {
      value: 1,
      level: 2,
      name: "需求未实现或不一致(以测试需求为标准)"
    }, {
      value: 2,
      level: 1,
      name: "页面404错误"
    }, {
      value: 3,
      level: 1,
      name: "系统无法正常安装、卸载或升级"
    }, {
      value: 4,
      level: 5,
      name: "操作系统产生的数据(数值)错误"
    }, {
      value: 5,
      level: 5,
      name: "系统已有功能未实现"
    }, {
      value: 6,
      level: 0,
      name: "页面没有及时刷新(导致数据暂时错误)"
    }, {
      value: 7,
      level: 0,
      name: "需求设计不合理(属于需求建议)"
    }, {
      value: 8,
      level: 0,
      name: "界面错误(显示错误、文字错误、排列错误等)"
    }, {
      value: 9,
      level: 0,
      name: "风格不统一或同字段的名称不统一"
    }, {
      value: 10,
      level: 0,
      name: "数据格式(长度、类型、是否必填项)没有检测限制"
    }, {
      value: 11,
      level: 0,
      name: "提示不明确或者没有提示"
    }, {
      value: 12,
      level: 0,
      name: "其他(可以写在缺陷描述中)"
    }, {
      value: 13,
      level: -1,
      name: "功能缺陷"
    }, {
      value: 14,
      level: -1,
      name: "功能建议"
    }, {
      value: 15,
      level: -1,
      name: "数据错误"
    }, {
      value: 16,
      level: -1,
      name: "界面建议"
    }, {
      value: 17,
      level: -1,
      name: "安全问题"
    }, {
      value: 18,
      level: -1,
      name: "系统崩溃"
    }],
  },
  //多张图片上传
  uploadimg:function(data) {
    var that = this,
    i = data.i ? data.i : 0,
    success = data.success ? data.success : 0,
    fail = data.fail ? data.fail : 0;
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      header: wx.getStorageSync('header'),
      name: 'fileData',
      formData: data.formData,
      success: (resp) => {
        success++;
        console.log(resp)
        console.log(i);
        if(resp.data.code==100){
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          prevPage.onLoad();
          wx.navigateBack({
          })
        }else{
          console.log(resp.data);
        }
        //这里可能有BUG，失败也会执行这里
      },
      fail: (res) => {
        fail++;
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        console.log(i);
        i++;
        if (i == data.path.length) {  //当图片传完时，停止调用     
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          prevPage.onLoad();
          wx.navigateBack({
          })
        } else {//若图片还没有传完，则继续调用函数
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }
      }
    });
  },
  //请求超时
  reLogin:function(){
    wx.showToast({
      title: '请求超时，请重新登录',
      complete:function(){
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    })
  },
})