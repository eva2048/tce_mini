// pages/handle/handle.js
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  //判断是否为驳回
  checkisreject: function (){
    var states = this.data.states;
    var currentstate = this.data.handle.state;
    if (states[currentstate].targetStateName != null){
      if (states[currentstate].targetStateName == "驳回"){
        var handle = this.data.handle;
        handle.rejecttype = 0;
        this.setData({
          isreject: true,
          handle:handle
        })
      }else{
        var handle=this.data.handle;
        handle.rejecttype=-1;
        this.setData({
          handle: handle
        })
      }  
    }
  },
  //转换流程列表
  turnstates:function(stateslist){
    var currentId = this.data.bughandle.currentId;//获取当前状态ID；
    var states=[];//当前可选状态列表；
    var workflowDefId = stateslist[0].workflowDefId;
    for (var i = 0; i < stateslist.length;i++){
      if (stateslist[i].sourceStateId == currentId){
        states.push(stateslist[i]);
      } 
    };
    this.setData({
      states: states,
      workflowDefId: workflowDefId
    });
  },
  //转换处理人角色
  turnhandles:function(){
    var bugrolelist = this.data.bugrolelist;//获取角色总表
    var states = this.data.states;//获取当前状态表
    var currentstate = this.data.handle.state;//获取当前状态节点
    var roleIds = states[currentstate].roleIds;
    var roleNames = states[currentstate].roleNames;
    var role=[];//当前页面需要显示的角色
    roleIds = roleIds.split(",");
    roleNames = roleNames.split(",");
    this.setData({
      role: roleNames,
      roleIds: roleIds
    })
    this.getHandles();
  },
  //获得该处理角色对应处理人
  getHandles:function(){
    var that=this;
    var roleId = that.data.roleIds[that.data.handle.role].toString();
    var bughandle = that.data.bughandle;
    wx.request({
      url: app.globalData.url + "/bugApp/getUserTestByroIdOrProId.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        roId: roleId,
        projectId: bughandle.projectId,
        creUsId: bughandle.creUsId
      },
      success: function (res) {
        if(res.data.success){
          if (res.data.obj != null && res.data.obj.length != 0) {
            var handles = res.data.obj;
            that.setData({
              handles: handles
            });
          } else {
            that.setData({
              handles: []
            });
          };
        }else{
          if (res.data.obj==null){
            that.setData({
              handles: []
            });
          }else{
            wx.showToast({
              title: '出错啦',
              mask: true,
            })
            wx.reLaunch({
              url: '/pages/login/login',
            })
          }
        }
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
  //获取处理缺陷
  gethandle: function (userId, projectId) {
    var that = this;
    var bughandle = that.data.bughandle;
    wx.request({
      url: app.globalData.url + "/bugApp/getBugInfoPG.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        userId: bughandle.userId,
        projectId: bughandle.projectId,
        creUsId: bughandle.creUsId
      },
      success: function (res) {
        if (res.data.code == 100) {
          var bugrolelist=[];
          var stateslist=[];
          if (res.data.data.bugrole!=null){
            bugrolelist = res.data.data.bugrole;//处理人角色总表
          }
          if (res.data.data.states!=null){
            stateslist = res.data.data.states;//流程总表
          }
          that.turnstates(stateslist);//获取当前状态列表
          that.setData({
            bugrolelist: bugrolelist,
          });
          that.checkisreject();//判断是否为驳回
          that.turnhandles();
        } else {
          wx.showToast({
            title: '出错啦',
          })
        };
      }
    });
  },
  //提交处理缺陷
  submitHandle:function(){
    var that = this;
    var handle = that.data.handle;
    if (that.data.isreject == true && that.data.describe == "") {
      that.wetoast.toast({
        title: '驳回原因不能为空',
        mask: true,
        img: '../images/error.png',
        duration: 1000
      })
    } else if (that.data.states == "" || that.data.role == "" || that.data.handles==""){
      that.wetoast.toast({
        title: '状态/角色/处理人均不能为空',
        mask: true,
        img: '../images/error.png',
        duration: 1000
      })
    }else {
      wx.showLoading({
        title: '提交中',
        mask:true,
      })
      var handle = that.data.handle;
      var state = that.data.states[handle.state];
      var role = that.data.roleIds[handle.role];
      var user = that.data.handles[handle.handler];
      if (handle.rejecttype==-1){
        var rejecttype="";
      }else{
        var rejecttype = that.data.rejecttype[handle.rejecttype];
      }
      wx.request({
        url: app.globalData.url + "/bugApp/getApproveBug.do",
        header: wx.getStorageSync('header'),
        method: "POST",
        data: Util.json2Form({
          userId: that.data.bughandle.userId,
          projectId: that.data.bughandle.projectId,
          bugId: that.data.bughandle.bugId,
          processId: that.data.bughandle.processId,
          workflowDefId: that.data.workflowDefId,
          currentId: that.data.bughandle.currentId,
          targetId: state.targetStateId,
          targetName: state.targetStateName,
          bugRole:role,
          bugAppUsId: user.id,
          rejectType: handle.rejecttype+1,
          rejectTypeName: rejecttype,
          rejectRemark: that.data.describe,
        }),
        success: function (res) {
          if (res.data.code == 100) {
            var pages = getCurrentPages();
            var prevPage = pages[pages.length - 2];
            prevPage.setData({
              bughandle: {
                userId: '',//用户ID
                projectId: '',//项目ID
                creUsId: '',//缺陷创建人ID
                currentId: '',//当前缺陷状态
                bugId: ''//缺陷Id
              }
            });
            prevPage.onLoad();
            wx.navigateBack({ 
            }) 
          } else {
            that.wetoast.toast({
              title: res.data.msg,
              img: '../images/error.png',
              mask: true,
              duration: 1000
            })
            setTimeout(function () {
              wx.navigateBack({
              })
            }, 300);
          }

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
      })
    }
  },
  data: {
    handle:{
      state:0,
      role:0,
      handler:0,
      rejecttype:-1, 
    },
    workflowDefId:'',
    bughandle: '',//获取处理页面数据所需参数（userId，projectId，creUsId,currentId,bugId,processId）
    states: [],//缺陷状态
    role: [],
    roleIds:[],
    handles:[],//处理人 
    isreject: false,//是否为驳回
    rejecttype: ['缺陷重复', '级别过高', '其他', '无法重现','不是缺陷'],//驳回类型
    describe: '',//驳回原因
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.WeToast();
    wx.setNavigationBarTitle({
      title: "处理缺陷"
    });
    var handle=this.data.handle;
    var bughandle = JSON.parse(options.bughandle);
    this.setData({
      handle: handle,
      bughandle: bughandle
    });
    this.gethandle();
  },
  /*选择器修改事件*/
  //流程状态修改
  bindstateChange: function (e) {
    var handle = this.data.handle;
    handle.state = e.detail.value;
    this.setData({
      handle: handle
    });
    this.turnhandles();
    this.checkisreject();
  },
  bindroleChange: function (e) {
    var handle = this.data.handle;
    handle.role = e.detail.value;
    this.setData({
      handle: handle
    });
    this.getHandles();
  },
  bindhandlerChange: function (e) {
    var handle = this.data.handle;
    handle.handler = e.detail.value;
    this.setData({
      handle: handle
    })
  },
  bindrejecttypeChange: function (e) {
    var handle = this.data.handle;
    handle.rejecttype = e.detail.value;
    this.setData({
      handle: handle
    })
  },
})