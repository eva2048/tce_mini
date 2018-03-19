//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: "项目列表"
    });
    this.getProjectList();
    var that=this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    }); 
  },
  data: {
    searchString:'',
    projects: [],
    filterShow:false,
    userInfoShow:false,
    pagesize:10,
    currentpage:1,
    nomoredata:false,
    //滚动数据
    scrollHeight:0,//屏幕高度
    refreshHeight:0,//获取高度
    refreshing:false,//是否在刷新中
    loading:false,//是否在加载更多
    filter:[{
      "name":"所有项目",
      "selected":true,
    },{
      "name": "我发起的",
      "selected": false,
    }],
    currentFilter:"所有项目",
    currentpage:1,
    filterId:'',
    categoryId:'',
  },
  /*
  upper:function(e){ 
    if (this.data.refreshing) return;
    this.setData({ 
      refreshing: true,
      currentpage:1,
      nomoredata:false,
      searchString: '',
    });
    var that=this;
    setTimeout(function () {
      that.setData({
        projects: [],
      });
      that.getProjectList();
    }, 300);
    
  },
  lower: function (e) { 
    if (this.data.nomoredata == false && this.data.loading==false){
      var currentpage = this.data.currentpage + 1;
      this.setData({
        currentpage: currentpage,
        loading:true
      })
      this.getProjectList();
      this.setData({
        refreshing: false,
        loading: true
      }) 
    }  
  },
  scroll: function (e) { 
  },
  */
  
  /*改变筛选显示状态*/
  changeFilterShow: function (e) {
    this.setData({
      filterShow: !this.data.filterShow,
      userInfoShow: false
    })
  },
  /*隐藏筛选*/
  hideFilterShow:function(){
    this.setData({
      filterShow:false
    })
  },
  /*改变退出登录显示状态*/
  changeUserInfoShow: function (e) {
    this.setData({
      filterShow: false,
      userInfoShow: !this.data.userInfoShow
    })
  },
  /*隐藏退出登录*/
  hideUserInfoShow:function(e){
    this.setData({
      userInfoShow: false
    })
  },
  /*退出登录*/
  loginout:function(e){
    wx.reLaunch({
      url: '/pages/login/login',
    });
    app.globalData.user='';
    app.globalData.currentproject='';
    app.globalData.currentbug='';
  },
  /*获取数据*/
  getProjectList:function(){
    var that=this;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: app.globalData.url + "/WeChatProject/getProjectlist.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        page: that.data.currentpage,
        pageSize: that.data.pagesize,
        categoryId: that.data.categoryId,
        searchTxt: that.data.searchString
      },
      success: function (res) {
        console.log(res);
        var projects = that.data.projects;
        var nomoredata = that.data.nomoredata;
        if (res.data.projects!=null){
          for (var i = 0; i < res.data.projects.length; i++) {
            projects.push(res.data.projects[i]);
          }
          if (projects.length == res.data.totalResult) {
            nomoredata = true
          }
          that.setData({
            projects: projects,
            refreshing: false,
            refreshHeight: 0,
            loading: false,
            nomoredata: nomoredata
          });
        };
        wx.hideLoading();
      }
    });
  },
  changeFilter:function(e){
    var that=this;
    var filter=this.data.filter;
    if (filter[e.currentTarget.dataset.index].selected==false){
      for (var i = 0; i < filter.length; i++) {
        filter[i].selected = false;
      };
      filter[e.currentTarget.dataset.index].selected = true;
      this.setData({
        filter: filter,
        currentFilter: filter[e.currentTarget.dataset.index].name
      });
      var filterId='';
      if (e.currentTarget.dataset.index==1){
        filterId=0;
      }else{
        filterId='';
      };
      that.setData({
        categoryId: filterId,
        projects: [],
      })
      that.getProjectList();
    };
  },
  /*页面跳转至项目详情*/
  detailLink:function(e){
    var index = e.currentTarget.dataset.index;
    var currentproject = this.data.projects[index];
    app.globalData.currentproject = currentproject;
    wx.navigateTo({
      url: '/pages/bug/bug?',
    })
  },
})  
