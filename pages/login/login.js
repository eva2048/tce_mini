// pages/login/login.js
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  onLoad: function () {
    new app.WeToast();
    wx.setNavigationBarTitle({
      title: "登录"
    });
    var username = wx.getStorageSync("tceUsername");
    var password = wx.getStorageSync("tcePassword");
    if (username != null && password != null && username != "" && password != ""){
      this.setData({
        name: username,
        password: password,
        currentname: username,
        currentpassword: password,
      })
    }
  },
  data: {
    placehold: "请输入用户名",
    placehold1:"请输入密码",
    content:'自定义toast组件',
    //name:'lizq@spasvo.com',
    //password:'111111',
    //name: '2283797877@qq.com',
    //password: '111111',
    name: '',
    password: '',
    currentname: '',
    currentpassword: '',
    //name:'shyani@163.com',
    //password:'5829876597',
    seepwd:false
  },
  /*清空输入*/
  clearInput:function(e){
    this.setData({
      name:'',
      currentname:''
    })
  },
  getname:function(e){
    this.setData({
      name:e.detail.value
    })
  },
  getpwd: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  changepwd: function (e) {
    this.setData({
      currentpassword:this.data.password,
      seepwd: !this.data.seepwd
    })
  },
  loginclick:function(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var that=this;
    var url="";
    //正则表达式判断
    var test = new RegExp("^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$");
    var result = test.test(that.data.name);
    if (that.data.name==''||that.data.password==''){
      wx.hideLoading();
      that.wetoast.toast({
        title: '用户名或密码不能为空',
        mask: true,
        img: '../images/error.png',
        duration: 1000
      })
    } else if (result==false){
      wx.hideLoading();
      that.wetoast.toast({
        title: '用户名必须为邮箱格式',
        mask: true,
        img: '../images/error.png',
        duration: 1000
      })
    }else{
      wx.request({
        url: app.globalData.url + "/userApp/getUserLogin.do",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "POST",
        data: Util.json2Form({
          username: that.data.name,
          password: that.data.password
        }),
        success: function (res) {
          if (res.data.code === "100") {
            var user = res.data.data.user;
            app.globalData.user = user;
            var session_id = res.data.data.sessionId;//本地取存储的sessionID  
            if (session_id != "" && session_id != null) {
              var header = { 'content-type': 'application/x-www-form-urlencoded', 'Cookie': 'JSESSIONID=' + session_id }
            } else {
              var header = { 'content-type': 'application/x-www-form-urlencoded' }
            };
            wx.setStorage({
              key: 'header',
              data: header,
            });
            wx.setStorageSync("tceUsername", that.data.name);
            wx.setStorageSync("tcePassword", that.data.password);
            wx.redirectTo({
              url: '/pages/main/main',
            })
          } else {
            wx.hideLoading();
            that.wetoast.toast({
              title: '用户名或密码错误',
              img: '../images/error.png',
              mask:true,
              duration: 1000
            })
          };
        },
        fail:function(res){
          wx.hideLoading();
          console.log(res);
          that.wetoast.toast({
            title: res.errMsg,
            img: '../images/error.png',
            mask: true,
            duration: 1000
          })
        }
      });
    }
    
    
  },
})