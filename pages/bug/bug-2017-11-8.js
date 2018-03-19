//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app = getApp();
Page({
  /*页面初始化*/
  onLoad: function (e) {
    wx.setNavigationBarTitle({
      title: "项目详情"
    });
    var id = app.globalData.currentproject.id;
    this.getBugList(true);
    this.setData({
      currentproject: app.globalData.currentproject,
      projectId: id
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
    scrollHeight: 0,//屏幕高度
    refreshing: false,//是否在刷新中
    loading: false,//是否在加载更多
    projectId:'',
    searchstring:'',
    filter:[{
      "name":"所有缺陷",
      "selected":true,
      "filterId":3,
      "num":0,
    },{
      "name": "我提交的",
      "selected": false,
      "filterId":1,
      "num": 0,
    }, {
      "name": "待我处理的",
      "filterId": 2,
      "selected": false,
      "num": 0,
    }],
    //sumNum:'',//所有缺陷数
    //dealNum:'',//待我处理的缺陷数
    //submitNum:'',//我提交的缺陷数量
    soft:[{
      "name":"创建时间从早到晚",
      "softId":1,
      "selected":true
    }, {
      "name": "创建时间从晚到早",
      "softId": 2,
      "selected": false
    }, {
      "name": "更新时间从晚到早",
      "softId": 3,
      "selected": false
    }, {
      "name": "更新时间从早到晚",
      "softId": 4,
      "selected": false
    }],
    stateList:"",
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
    currentFilter:"所有缺陷",
    currentFilterId:3,
    currentSoft:"创建时间从早到晚",
    currentSoftId:1,
    statelistChecked:"",
    bugState:"",
    bugLevel:"",
  },
  /**/
  upper: function (e) {
    if (this.data.refreshing) return;
    this.setData({
      refreshing: true,
      currentpage: 1,
      nomoredata: false,
      searchstring: '',
    });
    var that = this;
    setTimeout(function () {
      that.setData({
        bugs: [],
      });
      that.getBugList(true);
    }, 500);

  },
  lower: function (e) {
    if (this.data.nomoredata == false && this.data.loading == false) {
      var currentpage = this.data.currentpage + 1;
      this.setData({
        currentpage: currentpage,
        loading: true
      })
      this.setData({
        refreshing: false,
        loading: true
      })
      this.getBugList(false);
    }
  },
  //跳转至缺陷详情
  gotoDetail:function(e){
    var index = e.currentTarget.dataset.index
    var currentbug = this.data.bugs[index];
    app.globalData.currentbug = currentbug;
    wx.navigateTo({
      url: '/pages/bugdetail/bugdetail',
    })
  },
  //获取缺陷列表
  getBugList: function (clearData) {
    var that=this;
    wx.showLoading({
      title: '加载中',
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
        filterId: that.data.currentFilterId,
        sorftID: that.data.currentSoftId,
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
        }else {
          wx.showToast({
            title: '出错啦',
          })
          wx.reLaunch({
            url: '/pages/login/login',
          })
        };
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
    var filter=this.data.filter;
    var that = this;
    if(filter[e.currentTarget.dataset.index].selected == false){
      for (var i = 0; i < filter.length; i++) {
        filter[i].selected = false;
      };
      filter[e.currentTarget.dataset.index].selected = true;
      this.setData({

        filter: filter,
        currentFilter: filter[e.currentTarget.dataset.index].name,
        currentFilterId: filter[e.currentTarget.dataset.index].filterId
      });
      this.getBugList(true);
    }
  },
  //修改排序
  changeSoft: function (e) {
    var soft = this.data.soft;
    for (var i = 0; i < soft.length; i++) {
      soft[i].selected = false;
    };
    soft[e.currentTarget.dataset.index].selected = true;
    this.setData({
      soft: soft,
      currentSoft: soft[e.currentTarget.dataset.index].name,
      currentSoftId: soft[e.currentTarget.dataset.index].softId
    });
    this.getBugList(true);
  }
  
})
