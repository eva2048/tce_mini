// pages/search/search.js

var Util = require('../../utils/util.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchstring:"",
    searchlist:[],
    projectList:[],
    totalResult:''
  },
  //清空输入
  clearText:function(e){
    this.setData({
      searchstring:"",
      searchlist: []
    });
  },
  //获得输入数据
  getText:function(e){
    if (e.detail.value==""){
      this.setData({
        searchlist: []
      });
    }else{
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
    wx.request({
      url: app.globalData.url + "/WeChatProject/serachProjectIndexs.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        Username: Username,
        searchstring: that.data.searchstring,
        type: 1,
      },
      success: function (res) {
        if (res.data.code == 100) {
          var searchlist = res.data.data.Searchlist.slice(0,20);
          that.setData({
            searchlist: searchlist
          });
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true,
          });
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
  getList:function(){
    var that = this;
    var Username = app.globalData.user.id;
    wx.showLoading({
      title: '加载中',
      mask:true
    });
    wx.request({
      url: app.globalData.url + "/WeChatProject/getProjectlist.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        Username: Username,
        searchTxt: that.data.searchstring,
      },
      success: function (res) {
        if (res.data.projects != null) {
          //var searchlist = res.data.data.Searchlist.slice(0, 20);
          var projects = res.data.projects;
          var totalResult = res.data.totalResult;
          that.setData({
            projectList: projects,
            totalResult: totalResult
          })
          that.gotoProjectlist();
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true,
          });
          wx.hideLoading();
        };
      }
    });
  },
  //跳转至项目详情
  searchProject:function(e){
    this.getProjectbyid(e.currentTarget.dataset.id);
  },
  //根据ID获取项目详情
  getProjectbyid:function(projectId){
    var that = this;
    wx.request({
      url: app.globalData.url + "/WeChatProject/queryprojectById.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        id: projectId
      },
      success: function (res) {
        if (res.data.code == "100") {
          var currentproject=res.data.data;
          app.globalData.currentproject = currentproject;
          wx.redirectTo({
            url: "/pages/bug/bug",
          })
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true,
          })
        };
      }
    });
  },
  //跳转至搜索结果页
  gotoProjectlist:function(e){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var nomoredata=false;
    if (this.data.projectList.length == this.data.totalResult){
      nomoredata=true
    }
    prevPage.setData({
      projects: this.data.projectList,
      searchString: this.data.searchstring,
      nomoredata: nomoredata
    })
    wx.navigateBack({
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "项目搜索"
    });
  },
})