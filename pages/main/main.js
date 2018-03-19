//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  onLoad: function () {
    new app.WeToast();
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
  onShow:function(){
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
    refreshing:false,//是否在刷新中
    loading:false,//是否在加载更多
    filter:[{
      name:"所有项目",
      selected:true,
      categoryId: '',
    },{
      name: "我发起的",
      selected: false,
      categoryId: 0,
    }],
    currentFilter:"所有项目",
    categoryId:'',
  },
  //下拉刷新
  onPullDownRefresh: function () {
    if (this.data.refreshing) return;
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.setData({
      refreshing: true,
      currentpage: 1,
      nomoredata: false,
      searchString: '',
      currentFilter: "所有项目",
      filter: [{
        name: "所有项目",
        selected: true,
        categoryId: '',
      }, {
        name: "我发起的",
        selected: false,
        categoryId: 0,
      }],
      projects: [],
      categoryId: '',
    });
    var that = this;
    that.getProjectList();
  },
  //加载更多
  onReachBottom:function(){
    if (this.data.nomoredata == false && this.data.loading == false) {
      var currentpage = this.data.currentpage + 1;
      this.setData({
        refreshing: false,
        currentpage: currentpage,
        loading: true
      })
      this.getProjectList();
    }  
  },
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
      mask: true
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
          wx.hideLoading();
          wx.stopPullDownRefresh();//停止下拉刷新
          wx.hideNavigationBarLoading(); //在标题栏中显示加载
        }else{
          wx.showToast({
            title: '出错啦',
            mask:true
          })
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }, 300);
        };
      },
      fail:function (res) {
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
        currentFilter: filter[e.currentTarget.dataset.index].name,
        categoryId: filter[e.currentTarget.dataset.index].categoryId,
        projects: [],
        nomoredata:false,
        currentpage: 1,
      });
      that.getProjectList();
    };
  },
  /*页面跳转至项目详情*/
  detailLink:function(e){
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    var index = e.currentTarget.dataset.index;
    var currentproject = this.data.projects[index];
    app.globalData.currentproject = currentproject;
    if (currentproject.proType == '1' && currentproject.proCategory=='2'){
      var dueTime = currentproject.dueTime.time;//到期时间
      var today=Date.parse(new Date());//当前日期
      if(dueTime<today){
        this.wetoast.toast({
          title: '项目到期啦，请至PC端续费',
          mask: true,
          img: '../images/error.png',
          duration: 1000
        })
      }else{
        wx.navigateTo({
          url: '/pages/bug/bug',
        })
      }
    }else{
      wx.navigateTo({
        url: '/pages/bug/bug',
      })
    };
    setTimeout(function () {
      wx.hideLoading()
    }, 2000);
  },
  /*页面跳转至新建项目页*/
  gotoPage:function(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    });
    var linkname = e.currentTarget.dataset.link;
    var url = "/pages/" + linkname + "/" + linkname;
    wx.navigateTo({
      url: url,
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 2000);
  },
})  
