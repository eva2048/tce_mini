// pages/projectdescribe/projectdescribe.js
var Util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentdescribe:'',
    describe: '',
    currentlength: 0,
    cursor:0
  },
  gettextarea: function (e) {
    var describe = Util.formatEmoji(e.detail.value);
    this.setData({
      describe: describe,
      currentlength: e.detail.value.length,
    })
  },
  binddescribe: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var describe=Util.formatString(this.data.describe);
    if (describe==""){
      this.wetoast.toast({
        title: '描述不能为空',
        mask: true,
        img: '../images/error.png',
        duration: 1000
      })
    }else{
      prevPage.setData({
        describe: this.data.describe
      })
      wx.navigateBack({
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.WeToast();
    wx.setNavigationBarTitle({
      title: "描述"
    });
    this.setData({
      describe: options.describe,
      currentdescribe: options.describe,
      currentlength: options.describe.length
    })
  },
})