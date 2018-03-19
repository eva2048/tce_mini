// pages/chart/chart.js
var Util = require('../../utils/util.js');
var app = getApp();
var wxCharts=require('../../utils/wxcharts.js');
var columnChart = null;
Page({
  //获取图表数据
  getChart: function () {
    var that = this;
    var projectId = app.globalData.currentproject.id;
    var Username = app.globalData.user.id;
    var chartdata = that.data.chartdata;
    var series = that.data.series[that.data.seriesIndex].id;
    wx.request({
      url: app.globalData.url + "/bugApp/getAnalysisBug.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        Username: Username,
        projectId: projectId,
        series: series,
      },
      success: function (res) {
        if (res.data.code == 100) {
          var item="";
          var category = res.data.data.category;
          for (var i = 0; i < category.length;i++){
            item = category[i];
            if(item.length>10){
              category[i]=item.slice(0,10);
            }
          }
          chartdata.categories = category;
          chartdata.series = res.data.data.data;
          chartdata.xTitle = res.data.data.xTitle;
          chartdata.yTitle = res.data.data.yTitle;
          that.setData({
            chartdata: chartdata
          });
          that.initChart();
        } else {
          wx.showToast({
            title: '出错啦',
          })
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }, 300);
        };
      },
      fail: function (res) {
        wx.hideLoading();
        that.wetoast.toast({
          title: '出错啦',
          img: '../images/error.png',
          mask: true,
          duration: 1000
        });
        setTimeout(function () {
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }, 300);
      }
    });
  },
  //初始化图表
  initChart:function(){
    //初始化图表
    var chartdata = this.data.chartdata;
    columnChart = new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: chartdata.categories,
      series: chartdata.series,
      yAxis: {
        title: chartdata.yTitle,
      },
      xAxis: {
        type: 'calibration',
        minRange:0
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: this.data.windowWidth,
      height: 200,
    });
  },
  //图表切换
  tabClick:function(e){
    if (this.data.seriesIndex!= e.currentTarget.dataset.index){
      console.log("111");
      this.setData({
        seriesIndex: e.currentTarget.dataset.index
      });
      this.getChart();
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    seriesIndex:0,
    series:[
      {
        id:"bugState",
        name:"缺陷状态"
      },{
        id: "bugLevel",
        name: "缺陷等级"
      },{
        id: "bugModel",
        name: "项目模块"
      }
    ],
    chartdata:{
      categories:'',
      series:'',
      xTitle:'',
      yTitle:''
    },
    windowWidth:320,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this.getChart();
    wx.setNavigationBarTitle({
      title: "缺陷报表"
    });
    var windowWidth = this.data.windowWidth;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    this.setData({
      windowWidth: windowWidth,
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})