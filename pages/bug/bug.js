//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app = getApp();
Page({
  /*页面初始化*/
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: "缺陷列表"
    });
    var id = app.globalData.currentproject.id;
    var isDoing = true;
    if (app.globalData.currentproject.state != "进行中") {
      isDoing = false;
    }
    this.getBugList(true);
    this.setData({
      currentproject: app.globalData.currentproject,
      projectId: id,
      isDoing: isDoing
    });
    var that = this;
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
    bugs:[],
    currentproject:'',
    filterShow:false,
    softShow:false,
    advfilterShow:false,
    pagesize: 10,
    currentpage: 1,
    nomoredata: false,
    //滚动数据
    isDoing:true,//是否在进行中，判断能否新建缺陷
    refreshing: false,//是否在刷新中
    loading: false,//是否在加载更多
    projectId:'',
    searchstring:'',
    filter:[{
      "name":"所有缺陷",
      "filterId":3,
      "num":0,
    },{
      "name": "我提交的",
      "filterId":1,
      "num": 0,
    }, {
      "name": "待我处理的",
      "filterId": 2,
      "num": 0,
    }],
    soft:[{
      "name":"创建时间从早到晚",
      "softId":1,
    }, {
      "name": "创建时间从晚到早",
      "softId": 2,
    }, {
      "name": "更新时间从早到晚",
      "softId": 3,
    }, {
      "name": "更新时间从晚到早",
      "softId": 4,
    }],
    stateList:"",//状态列表
    //缺陷等级列表
    levelList: [{
      name: "加急",
      levelId:2,
      selected: false
    }, {
      name: "高",
      levelId:1,
      selected: false
    }, {
      name: "中",
      levelId:5,
      selected: false
    }, {
      name: "低",
      levelId:0,
      selected: false
    }],
    currentFilter:0,
    currentSoft:0,
    statelistChecked:"",//已选中的状态index
    bugState:"",//获取数据传递列表
    bugLevel:"",//获取数据传递列表
  },
  /**/
  onPullDownRefresh: function (){
    if (this.data.refreshing) return;
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    this.setData({
      loading: false,//是否在加载更多
      refreshing: true,
      currentpage: 1,
      nomoredata: false,
      searchstring: '',
      currentFilter: 0,
      currentSoft: 0,
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
      statelistChecked: "",//已选中的状态index
      bugState: "",//获取数据传递列表
      bugLevel: "",//获取数据传递列表
    });
    var that = this;
    that.getBugList(true);
  },
  onReachBottom: function (e) {
    if (this.data.nomoredata == false && this.data.loading == false) {
      var currentpage = this.data.currentpage + 1;
      this.setData({
        currentpage: currentpage,
        loading: true,
        refreshing: false,
      })
      this.getBugList(false);
    }
  },
  //跳转至缺陷详情
  gotoDetail:function(e){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var index = e.currentTarget.dataset.index
    var currentbug = this.data.bugs[index];
    app.globalData.currentbug = currentbug;
    wx.navigateTo({
      url: '/pages/bugdetail/bugdetail',
    });
    setTimeout(function () {
      wx.hideLoading()
    }, 2000);
  },
  //获取缺陷列表
  getBugList: function (clearData) {
    var that=this;
    wx.showLoading({
      title: '加载中',
      mask:true
    });
    if(clearData==true){
      that.setData({
        bugs: [],
        currentpage: 1,
      })
    }
    wx.request({
      url: app.globalData.url + "/bugApp/getBugApps.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        projectId: app.globalData.currentproject.id,
        filterId: that.data.filter[that.data.currentFilter].filterId,
        sorftID: that.data.soft[that.data.currentSoft].softId,
        bugState: that.data.bugState,
        bugLevel: that.data.bugLevel,
        page: that.data.currentpage,
        searchstring: this.data.searchstring,
      },
      success: function (res) {
        if (res.data.code == 100) {
          if(res.data.data.bugs!=null){
            that.turnbugs(res.data.data.bugs);
            var nomoredata = that.data.nomoredata;
            if (res.data.data.bugs.length < that.data.pagesize) {
              nomoredata = true
            }else{
              nomoredata=false
            }
            that.setData({
              refreshing: false,
              refreshHeight: 0,
              loading: false,
              nomoredata: nomoredata
            });
            var statelist = res.data.data.stateList;
            var statelistChecked = [];
            var filter = that.data.filter;
            if (statelist != null && that.data.statelistChecked == "") {
              for (var i = 0; i < statelist.length; i++) {
                statelistChecked[i] = false;
              };
              filter[0].num = res.data.data.sumNum;
              filter[1].num = res.data.data.submitNum;
              filter[2].num = res.data.data.dealNum;
              that.setData({
                stateList: statelist,
                statelistChecked: statelistChecked,
                filter: filter
              })
            }
          }else{
            nomoredata = true
            that.setData({
              refreshing: false,
              loading: false,
              nomoredata: nomoredata
            });
          }
          wx.hideLoading();
          wx.stopPullDownRefresh();//停止下拉刷新
          wx.hideNavigationBarLoading(); //在标题栏中隐藏加载
        }else {
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
  //转换缺陷列表
  turnbugs:function(bugs) {
    if(bugs==null){
      bugs='';
    };
    var bugslist=this.data.bugs;
    for (var i = 0; i < bugs.length; i++) {
      var bug = bugs[i];
      bug.bugCreateTimeStr = Util.turnTime(bug.bugCreateTime.time, 'Y-M-D h:m');
      var bugLevel = bug.bugLevel;
      switch (bugLevel) {
        case "0":
          bug.bugLevelName = "低级";
          break;
        case "5":
          bug.bugLevelName = "中级";
          break;
        case "1":
          bug.bugLevelName = "高级";
          break;
        case "2":
          bug.bugLevelName = "加急";
          break;
        case "3":
          bug.bugLevelName = "兼容性缺陷";
          break;
        case "4":
          bug.bugLevelName = "兼容性日志";
          break;
      }
      bugslist.push(bug);
    };
    this.setData({
      bugs: bugslist
    })
  },
  /*改变筛选显示状态*/
  changeFilterShow: function (e) {
    this.setData({
      softShow: false,
      advfilterShow: false,
      filterShow: !this.data.filterShow,
    })
  },
  /*隐藏筛选*/
  hideFilterShow:function(){
    this.setData({
      filterShow:false
    })
  },
  /*改变排序显示状态*/
  changesoftShow: function (e) {
    this.setData({
      filterShow: false,
      advfilterShow: false,
      softShow: !this.data.softShow
    })
  },
  /*隐藏排序显示*/
  hidesoftShow:function(e){
    this.setData({
      softShow: false
    })
  },
  /*改变高级筛选显示状态*/
  changeadvfilterShow: function (e) {
    this.setData({
      filterShow: false,
      softShow: false,
      advfilterShow: !this.data.advfilterShow
    })
  },
  /*隐藏排序显示*/
  hideadvfilterShow: function (e) {
    this.setData({
      advfilterShow: false
    })
  },
  /*高级筛选*/
  //缺陷状态修改
  changeAdvstate:function(e){
    var statelistChecked = this.data.statelistChecked;
    statelistChecked[e.currentTarget.dataset.index] = !statelistChecked[e.currentTarget.dataset.index];
    this.setData({
      statelistChecked: statelistChecked
    })
  },
  //缺陷等级修改
  changeAdvlevel: function (e) {
    var levelList = this.data.levelList;
    levelList[e.currentTarget.dataset.index].selected = !levelList[e.currentTarget.dataset.index].selected;
    this.setData({
      levelList: levelList
    })
  },
  //执行高级筛选
  submitAdvfilter:function(e){
    var statelistChecked = this.data.statelistChecked;
    var bugState="";
    var stateList = this.data.stateList;
    for (var i = 0; i < statelistChecked.length;i++){
      if (statelistChecked[i]){
        if (bugState != "") {
          bugState += ","
        };
        bugState += stateList[i].id;
      }
    };
    var bugLevel = "";
    var levelList = this.data.levelList;
    for (var j = 0; j < levelList.length;j++){
      if (levelList[j].selected){
        if (bugLevel!=""){
          bugLevel+=","
        };
        bugLevel += levelList[j].levelId;
      }
    };
    this.setData({
      bugState: bugState,
      bugLevel: bugLevel
    });
    this.getBugList(true);
  },
  /*清除高级筛选*/
  clearAdvfilter:function(e){
    var statelistChecked = this.data.statelistChecked;
    var levelList = this.data.levelList;
    for (var i = 0; i < statelistChecked.length; i++) {
      statelistChecked[i] = false;
    };
    for (var i = 0; i < levelList.length; i++) {
      levelList[i].selected = false;
    };
    this.setData({
      statelistChecked: statelistChecked,
      levelList: levelList
    })
  },
  //修改筛选
  changeFilter:function(e){
    if (this.data.currentFilter != e.currentTarget.dataset.index){
      this.setData({
        currentFilter: e.currentTarget.dataset.index,
      });
      this.getBugList(true);
    }
  },
  //修改排序
  changeSoft: function (e) {
    if (this.data.currentSoft != e.currentTarget.dataset.index) {
      this.setData({
        currentSoft: e.currentTarget.dataset.index,
      });
      this.getBugList(true);
    }
  },
  /*页面跳转*/
  gotoPage: function (e) {
    wx.showLoading({
      title: '加载中',
      mask: true
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
