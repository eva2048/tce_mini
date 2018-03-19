//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  /*载入*/
  onLoad: function (options) {
    new app.WeToast();
    wx.setNavigationBarTitle({
      title: "新建缺陷"
    });
    var bug = this.data.bug;
    var bugtypelist = app.globalData.bugtypelist;//缺陷类型总表(0-12众测，13-18tce)
    var currentproject = app.globalData.currentproject;//当前项目
    var user = app.globalData.user;//当前用户
    var proType = currentproject.proType;//当前项目类型（1.tce 0.众测项目）
    this.getCreateproject(user.id, currentproject.id);//获取项目模块、项目角色、项目处理人
    if(proType==0){
      bugtypelist = bugtypelist.slice(0,13)
    }else{
      bugtypelist = bugtypelist.slice(14, 19)
    }
    var buglevel = [{ //缺陷等级
      name: "低",
      levelId: 0
    }, {
      name: "中",
      levelId: 5
    }, {
      name: "高",
      levelId: 1
    }, {
      name: "加急",
      levelId: 2
    }];//
    var bug=this.data.bug;
    bug.buglevel=3;
    if (currentproject.testType=='2'){
      buglevel = [{ //缺陷等级
        name: "兼容性缺陷",
        levelId: 3
      }, {
        name: "兼容性日志",
        levelId: 4
      }];
      bug.buglevel=0
    };
    this.setData({
      bug: bug,
      projectName: currentproject.proName,
      bugtypelist: bugtypelist,
      projectType: proType,
      currentProject: currentproject,
      bug: bug
    });
    wx.setNavigationBarTitle({
      title: '新建缺陷'
    })
  },
  onShow:function(options){
  },
  /*提交新建*/
  submitBug:function(e){
    var that = this;
    var bug = that.data.bug;
    if (bug.name == "") {
      this.wetoast.toast({
        title: '缺陷名称不能为空',
        img: '../images/error.png',
        mask: true,
        duration: 1000
      })
    } else if (this.data.describe == "") {
      this.wetoast.toast({
        title: '缺陷描述不能为空',
        img: '../images/error.png',
        mask: true,
        duration: 1000
      })
    }else{
      wx.showLoading({
        title: '提交中',
        mask: true
      });
      var bug=that.data.bug;
      var bugCategory = that.data.bugtypelist[bug.bugtype].value;//缺陷类型
      var bugLevel = that.data.buglevel[bug.buglevel].levelId;//缺陷等级
      var bugFrequency = bug.bugrate+1;//出现频率
      var bugRole = that.data.bugrolelist[bug.bugrole].id;//处理人角色
      var bugAppUsId = that.data.bugrolelist[bug.bugrole].users[bug.bughandle].usId;//处理人ID
      if (that.data.projectType==0){
        bugRole="0";
        bugAppUsId = that.data.currentProject.creUserId;
      };
      var bugModel = that.data.bugmodule[bug.bugmodule];
      var bugState = that.data.startState.sourceStateId;
      var bugStateName = that.data.startState.sourceStateName;
      var bugdevice="";
      //传递设备信息
      var mobId="";
      var mobbrand="";
      var systemVersion="";
      var netType="";
      var carrierperator="";
      var memory="";
      //无设备信息
      var sentdata={
        bugProId: that.data.currentProject.id,
        bugName: that.data.bug.name,               //缺陷名称
        bugCategory: bugCategory,                             //缺陷类型
        bugLevel: bugLevel,                                //缺陷等级
        bugFrequency: bugFrequency,                            //出现频率
        bugRole: bugRole,                               //处理人角色
        bugAppUsId: bugAppUsId,                         //处理人ID
        bugModel: bugModel,                        //项目模块
        bugState: bugState,            //初始流程Id（startNode==1）
        bugStateName: bugStateName,                       //初始流程Id
        bugDesc: that.data.describe,
      };
      //有设备信息
      if (that.data.bugdevice!=0){
        var mobPhones = JSON.parse(that.data.mobPhones);
        bugdevice = mobPhones[that.data.bugdevice-1];
        sentdata.mobId = '';
        sentdata.mobbrand = bugdevice.mobbrand;
        sentdata.typeId = bugdevice.mobCell;
        sentdata.systemVersion = bugdevice.sysVersion;
        sentdata.netType = bugdevice.netType;
        sentdata.carrieroperator = bugdevice.carrieroperator;
        sentdata.memory = bugdevice.capacity;
      };
      wx.request({
        url: app.globalData.url + "/bugApp/saveOrUpBugApp.do",
        header: wx.getStorageSync('header'),
        method: "POST",
        data: Util.json2Form(sentdata),
        success: function (res) {
          if(res.data.code==100){
            var formdata = that.data.formdata;
            formdata.projectId = res.data.data.projectId;
            formdata.bugId = res.data.data.bugId;
            that.setData({
              formdata: formdata
            });
            if (that.data.imageList.length!=0){
              that.uploadimg();
            }else{
              console.log("没有文件");
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2];
              prevPage.onLoad();
              wx.navigateBack({
              })
            }
          }else{
            wx.hideLoading();
            that.wetoast.toast({
              title: res.data.msg,
              img: '../images/error.png',
              mask: true,
              duration: 1000
            })
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
    currentname:'',
    bug: {
      name: "",
      bugtype:0,
      buglevel:3,
      bugrate:0,
      bugrole:0,
      bughandle:0,
      bugmodule:0,
    },
    formdata:{
      projectId:'',
      bugId:''
    },
    startState: '',//缺陷起始流程
    bugdevice: 0,//当前设备
    mobPhones:'',//设备列表
    describe: '',//缺陷描述
    projectName:'',//当前项目名称
    projectType:1,//当前项目类型
    bugtypelist:'',//缺陷类型列表
    buglevel: [{ //缺陷等级
        name: "低",
        levelId: 0
      },{
        name: "中",
        levelId: 5
      },{
        name: "高",
        levelId: 1
      },{
        name: "加急",
        levelId: 2
      }],//
    bugrate:['经常','偶发','无法重现'],
    bugmodule:[],//缺陷模块
    bugrolelist:'',//处理人总表
    bugrole:[],
    bughandle:[],
    imageList: [],
    fileList:[],
    chooseFile:false
  },
  //显示选择图片/视频
  chooseFile:function(){
    this.setData({
      chooseFile:true
    })
  },
  hideUserInfoShow:function(){
    this.setData({
      chooseFile: false
    })
  },
  //获取创建缺陷
  getCreateproject: function (userId, projectId) {
    var that = this;
    wx.request({
      url: app.globalData.url + "/bugApp/getBugInfoPG.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        userId: userId,
        projectId: projectId
      },
      success: function (res) {
        console.log(res);
        if (res.data.code == 100) {
          var bugmodule = res.data.data.bugmodule;//项目模块
          var bugrolelist = res.data.data.bugrole;//项目处理人总列表
          var mobPhones = JSON.stringify(res.data.data.mobPhones);//设备信息
          var startState="";//起始流程
          var states = res.data.data.states;//流程信息
          var bugrole=[];//处理人角色
          var bughandle=[];//处理人
          for (var k = 0; k < states.length;k++){
            if (states[k].startNode==1){
              startState = states[k]
            }
          };
          if (mobPhones == null) {
            mobPhones = [];
          };
          if (bugmodule==null){
            bugmodule=['全部模块'];
          }else{
            bugmodule.splice(0, 0, "全部模块"); 
          };
          if (bugrolelist == null) {
            bugrolelist = [];
          }else{
            for (var i = 0; i < bugrolelist.length;i++){
              var handles=[];
              var rolename = bugrolelist[i].name;
              bugrole.push(rolename);
              for (var j = 0; j < bugrolelist[i].users.length;j++){
                var handlename = bugrolelist[i].users[j].userName;
                handles.push(handlename);
              }
              bughandle.push(handles);
            }
          }
          that.setData({
            bugrolelist:bugrolelist,
            bughandle: bughandle,
            bugrole: bugrole,
            bugmodule: bugmodule,
            mobPhones: mobPhones,
            startState: startState
          })
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true,
          })
          wx.reLaunch({
            url: '/pages/login/login',
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
  /*名称修改*/
  getname: function (e) {
    var bug = this.data.bug;
    bug.name = Util.formatString(e.detail.value);
    this.setData({
      bug: bug
    })
  },
  /*预览图片*/
  previewImage:function(e){
    var current = e.currentTarget.dataset.src;
    wx.previewImage({
      current: current,
      urls:this.data.imageList
    })
  },
  /*选择器修改事件*/
  //缺陷类型
  bindBugtypeChange:function(e){
    var bug = this.data.bug;
    bug.bugtype = e.detail.value;
    var bugtypelist = this.data.bugtypelist;
    var level = bugtypelist[e.detail.value].level;
    switch (level){
      case 0:
        bug.buglevel = 0;
        break;
      case 5:
        bug.buglevel = 1;
        break;
      case 1:
        bug.buglevel = 2; 
        break;
      case 2:
        bug.buglevel = 3;
        break;
      case -1:
        bug.buglevel = bug.buglevel;
        break;
    }
    this.setData({
      bug:bug
    })
  },
  bindBuglevelChange: function (e) {
    var bug = this.data.bug;
    bug.buglevel = e.detail.value;
    this.setData({
      bug: bug
    })
  },
  bindBugrateChange: function (e) {
    var bug = this.data.bug;
    bug.bugrate = e.detail.value;
    this.setData({
      bug: bug
    })
  },
  /*处理人角色*/
  bindBugroleChange: function (e) {
    var bug = this.data.bug;
    bug.bugrole = e.detail.value;
    this.setData({
      bug: bug
    })
  },
  bindBughandleChange: function (e) {
    var bug = this.data.bug;
    bug.bughandle = e.detail.value;
    this.setData({
      bug: bug
    })
  },
  bindBugmoduleChange: function (e) {
    var bug = this.data.bug;
    bug.bugmodule = e.detail.value;
    this.setData({
      bug: bug
    })
  },
  /*删除图片*/
  delImage:function(e){
    var imageList = this.data.imageList;
    var fileList=this.data.fileList;
    imageList.splice(e.currentTarget.dataset.index, 1);
    fileList.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      imageList: imageList,
      fileList: fileList
    })
  },
  /*选择文件*/
  chooseImg:function(e){
    var that=this;
    that.setData({
      chooseFile: false
    });
    wx.chooseImage({
      count:9,
      sizeType: ['original', 'compressed'],
      sourceType:['album','camera'],
      success:function(res){
        var tempFilePaths=res.tempFilePaths;
        var imageList = that.data.imageList;
        var fileList = that.data.fileList;
        var file = {};
        for (var i = 0; i < tempFilePaths.length;i++){
          imageList.push(tempFilePaths[i]);
          file = {};
          file.type="img";
          file.src = tempFilePaths[i];
          fileList.push(file);
        }
        that.setData({
          imageList: imageList,
          fileList: fileList
        })
      },
      fail:function(res){
        /*var errmsg = res.errMsg;
        if (res.errMsg =="chooseImage:fail cancel"){
          errmsg ="未选择文件";
        }*/
        that.wetoast.toast({
          title: "未选择文件",
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      }
    });
  },
  chooseVideo:function(e){
    var that=this;
    that.setData({
      chooseFile: false
    });
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      success:function(res){
        var tempFilePath = res.tempFilePath;
        var imageList = that.data.imageList;
        imageList.push(tempFilePath);
        var fileList = that.data.fileList;
        var file = {};
        file.type = "video";
        file.src = tempFilePath;
        fileList.push(file);
        that.setData({
          fileList: fileList,
          imageList: imageList
        })
      },
      fail: function (res) {
        /*var errmsg = res.errMsg;
        if (res.errMsg == "chooseImage:fail cancel") {
          errmsg = "未选择文件";
        }*/
        that.wetoast.toast({
          title: "未选择文件",
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      }
    })
  },
  playVideo:function(e){
    var src=e.currentTarget.dataset.src;
    wx.navigateTo({
      url: '/pages/video/video?src='+src,
    })
  },
  uploadimg: function () {//这里触发图片上传的方法
    var pics = this.data.imageList;
    app.uploadimg({
      url: app.globalData.url + "/bugApp/saveBugFile.do",//这里是你图片上传的接口
      path: pics,//这里是选取的图片的地址数组
      formData: this.data.formdata,
    });
  },
 
  /*生命周期函数--监听页面显示*/
  onShow:function(){
  }
})
