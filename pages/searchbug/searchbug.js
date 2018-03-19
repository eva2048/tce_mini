// pages/search/search.js

var Util = require('../../utils/util.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchstring: "",
    searchlist: [],
    bugList:[],
    returnData:"",
    totalResult:''
  },
  //清空输入
  clearText: function (e) {
    this.setData({
      searchstring: "",
      searchlist: []
    });
  },
  //获得输入数据
  getText: function (e) {
    if (e.detail.value == "") {
      this.setData({
        searchlist: []
      });
    } else {
      this.setData({
        searchstring: e.detail.value
      });
      this.getSearchlist();
    }
  },
  //获取搜索数据
  getSearchlist: function () {
    var that = this;
    var Username = app.globalData.user.id;
    var projectId = app.globalData.currentproject.id;
    wx.request({
      url: app.globalData.url + "/bugApp/searchBugs.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        Username: Username,
        projectId: projectId,
        searchstring: that.data.searchstring,
        type: 1,
      },
      success: function (res) {
        if (res.data.code == 100) {
          var searchlist = res.data.data.Searchlist.slice(0, 20);
          that.setData({
            searchlist: searchlist
          });
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true
          })
        };
      },
      fail: function (res) {
        wx.hideLoading();
        that.wetoast.toast({
          title: '出错啦',
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      }
    });
  },
  //获取项目列表
  getList: function () {
    var that = this;
    var Username = app.globalData.user.id;
    var projectId = app.globalData.currentproject.id;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.url + "/bugApp/getBugApps.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        Username: Username,
        projectId: projectId,
        searchstring: that.data.searchstring,
      },
      success: function (res) {
        if (res.data.code==100) {
          //var searchlist = res.data.data.Searchlist.slice(0, 20);
          var bugs = res.data.data.bugs;
          var stateList=res.data.data.stateList;
          var submitNum = res.data.data.submitNum;
          var sumNum = res.data.data.sumNum;
          var total = res.data.data.total;
          var returnData = res.data.data;
          that.setData({
            returnData: returnData
          })
          that.gotoProjectlist();
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '出错啦',
            mask: true
          })
        };
      },
      fail: function (res) {
        wx.hideLoading();
        that.wetoast.toast({
          title: '出错啦',
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      }
    });

  },
  //跳转至项目详情
  searchProject: function (e) {
    var currentbug={
      id: e.currentTarget.dataset.id
    };
    app.globalData.currentbug = currentbug;
    wx.redirectTo({
      url: '/pages/bugdetail/bugdetail',
    })
  },
  //跳转至搜索结果页
  gotoProjectlist: function (e) {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var returnData = this.data.returnData;
    var statelistChecked=[];
    var statelist = returnData.stateList;
    if (statelist != null) {
      for (var i = 0; i < statelist.length; i++) {
        statelistChecked[i] = false;
      };
    }
    var nomoredata=false;
    if (returnData.bugs==null){
      nomoredata=true
    }else if (returnData.bugs.length == returnData.total) {
      nomoredata = true
    }
    console.log(returnData);
    prevPage.setData({
      filterShow: false,
      softShow: false,
      advfilterShow: false,
      nomoredata: nomoredata,
      bugs:[],
      searchstring: this.data.searchstring,
      stateList: returnData.stateList,
      levelList: [{
        name: "加急",
        levelId: 2,
        selected: false
      }, {
        name: "高",
        levelId: 1,
        selected: false
      }, {
        name: "中",
        levelId: 5,
        selected: false
      }, {
        name: "低",
        levelId: 0,
        selected: false
      }],
      currentFilter: 0,
      currentSoft: 0,
      statelistChecked: statelistChecked,//已选中的状态index
      bugState: "",//获取数据传递列表
      bugLevel: "",//获取数据传递列表
    })
    prevPage.turnbugs(returnData.bugs);
    wx.navigateBack({
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "缺陷搜索"
    });
  },
})