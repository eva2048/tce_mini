// pages/createproject/createproject.js
var Util = require('../../utils/util.js');
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentname:'',
    project:{
      name: '',
      starttime: '',
      endtime: '',
      mod: [],
      flowIndex: 0,
      flowId:'',
      roleGroupId:''
    },
    describe: '',
    flowList:'',
    flow: [],
    selectStarttime: '',
    addmoduleShow:false,
    newmodule:'',
    currentnewmodule:''
  },
  /*名称修改*/
  getname:function(e){
    var project=this.data.project;
    project.name = Util.formatString(e.detail.value);
    this.setData({
      project: project
    })
  },
  /*时间修改*/
  bindDateChange:function(e){
    var project=this.data.project;
    project.starttime = e.detail.value
    this.setData({
      project: project
    })
  },
  bindDateChange1: function (e) {
    var project = this.data.project;
    project.endtime = e.detail.value
    this.setData({
      project: project
    })
  },
  /*流程修改*/
  bindFlowChange:function(e){
    var project = this.data.project;
    project.flowIndex = e.detail.value;
    project.flowId = this.data.flowList[project.flowIndex].id;
    project.roleGroupId = this.data.flowList[project.flowIndex].roleGroupId;
    this.setData({
      project: project
    })
  },
  /*删除模块*/
  deleteModule:function(e){
    var project = this.data.project;
    var mod = project.mod;
    mod.splice(e.currentTarget.dataset.index,1);
    this.setData({
      project: project
    });
  },
  showAddmodule:function(e){
    this.setData({
      addmoduleShow:true
    })
  },
  hideAddmodule: function (e) {
    this.setData({
      addmoduleShow: false,
      newmodule: '',
      currentnewmodule:''
    })
  },
  addModule:function(e){
    var project = this.data.project;
    var mod = project.mod;
    var newmodule=this.data.newmodule;
    //newmodule = Util.formatString(newmodule);
    for (var i = 0; i < mod.length;i++){
      if(newmodule==mod[i]){
        newmodule='';
        this.wetoast.toast({
          title: '模块不能重复',
          img: '../images/error.png',
          mask: true,
          duration: 400
        })
        break;
      };
    }
    if (newmodule != ''){
      if (newmodule=="null"){
        newmodule = '';
        this.setData({
          newmodule: '',
          currentnewmodule: ''
        });
        this.wetoast.toast({
          title: '模块名不能为特殊字符串',
          img: '../images/error.png',
          mask: true,
          duration: 400
        })
      }else{
        mod.push(newmodule);
        this.setData({
          project: project,
          addmoduleShow: false,
          newmodule: '',
        });
      } 
    }else{
      this.wetoast.toast({
        title: '模块名称不能为空',
        img: '../images/error.png',
        mask: true,
        duration: 400
      });
      this.setData({
        newmodule: '',
        currentnewmodule:''
      });
    };
  },
  bindModuleInput:function(e){
    var newmodule = Util.formatString(e.detail.value);
    this.setData({
      newmodule: newmodule
    })   
  },
  /*提交*/
  submitProject:function(e){
    var that=this;
    var project=this.data.project;
    if (project.name==""){
      that.wetoast.toast({
        title: '项目名称不能为空',
        img: '../images/error.png',
        mask: true,
        duration: 1000
      })
    } else if (this.data.describe==""){
      that.wetoast.toast({
        title: '项目描述不能为空',
        img: '../images/error.png',
        mask: true,
        duration: 1000
      })
    }else{
      var mod=project.mod;
      var modString='';
      for (var i = 0; i < mod.length; i++) {
        if(i!=0){
          modString += "pr_md;"
        }
        modString+=mod[i];
      }
      var today = new Date();
      var todayString = Date.parse(today);
      var aftertoday = new Date(todayString + 86400000);
      var startTime = today;
      var startTimestring = Date.parse(startTime);
      var endtime = aftertoday;
      var endtimestring = Date.parse(endtime);
      if (this.data.project.starttime!=''){
        startTime = new Date(this.data.project.starttime);
        startTimestring = Date.parse(startTime);
      }
      if (this.data.project.endtime != '') {
        endtime = new Date(this.data.project.endtime);
        endtimestring = Date.parse(endtime);
      }
      if (startTimestring == endtimestring){
        that.wetoast.toast({
          title: '开始时间和结束时间不能相同',
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      } else if (this.data.project.starttime != '' && this.data.project.endtime != ''&&startTimestring > endtimestring){
        that.wetoast.toast({
          title: '开始时间不能大于结束时间',
          img: '../images/error.png',
          mask: true,
          duration: 1000
        })
      }else{
        var requestData = {
          proName: this.data.project.name,
          proModel: modString,
          startTime: startTime,
          endTime: endtime,
          proRolesId: this.data.project.roleGroupId,
          processId: this.data.project.flowId,
          remark: this.data.describe
        };
        wx.showLoading({
          title: '提交中 ',
          mask: true
        });
        wx.request({
          url: app.globalData.url + "/WeChatProject/saveOrUpproject.do",
          header: wx.getStorageSync('header'),
          method: "POST",
          data: Util.json2Form(requestData),
          success: function (res) {
            if (res.data.success) {
              wx.showToast({
                title: '创建成功',
                mask: true,
              })
              setTimeout(function () {
                var pages = getCurrentPages();
                var prevPage = pages[pages.length - 2];
                prevPage.onPullDownRefresh();
                wx.navigateBack({
                })
              }, 1000);
            } else {
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
    }  
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new app.WeToast();
    wx.setNavigationBarTitle({
      title: "新建项目"
    });
    var time=Util.formatTime1(new Date());
    this.setData({
      starttime:time,
      selectStarttime:time,
    });
    this.getCreateproject();
  },
  //获取创建项目
  getCreateproject: function () {
    var that = this;
    wx.request({
      url: app.globalData.url + "/WeChatProcess/listProcessDefs.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
      },
      success: function (res) {
        if (res.data.code == 100) {
          var flowList = res.data.data.flow;
          var flow=[];
          var project=that.data.project;
          project.flowId = flowList[project.flowIndex].id;
          project.roleGroupId = flowList[project.flowIndex].roleGroupId;
          for(var i=0;i<flowList.length;i++){
            flow.push(flowList[i].defName);
          }
          that.setData({
            flowList:flowList,
            flow: flow,
            project: project
          })
        } else {
          that.wetoast.toast({
            title: '出错啦',
            img: '../images/error.png',
            mask: true,
            duration: 1000
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
})