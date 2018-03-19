// pages/choosedevice/choosedevice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices:[],
    deviceselected:0
  },
  changeDevice:function(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      bugdevice: e.currentTarget.dataset.index+1
    });
    wx.navigateBack({
    })
  },
  noDevice:function(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      bugdevice: 0
    });
    wx.navigateBack({
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var mobPhones = JSON.parse(options.mobPhones);
    this.setData({
      devices: mobPhones,
      deviceselected: options.device
    });
    wx.setNavigationBarTitle({
      title: '选择设备'
    })
  },
})