//index.js
//获取应用实例
var Util = require('../../utils/util.js');
var app = getApp(); 
//转换文件地址
var turnFilesrc= function(beforepath, url) {
  url = url.replace(/\\/g, "/");
  var path = beforepath + "/UpTCEFile/" + url;
  return path;
};
var turnFileList = function (bugFiles){
  for(var i=0;i<bugFiles.length;i++){
    var file=bugFiles[i];
    //文档文件
    if(file.fltype=="1"){
      var filename=file.oldFlName;
      var filetype=filename.substring(filename.lastIndexOf('.'));
      //判断是否为可预览文件格式(支持格式：doc, xls, ppt, pdf, docx, xlsx, pptx)
      var docTypelist=[".doc",".xls",".ppt",".pdf",".docx",".xlsx",".pptx"];
      var videoTypelist=[".mp4"];
      //重定义文件格式（1.文档文件 2.图片 3.视频 4.非常规）
      if (docTypelist.indexOf(filetype)>-1){
        file.fltype="1";
      } else if (videoTypelist.indexOf(filetype) > -1){
        file.fltype = "3";
      }else{
        file.fltype = "4";
      }
    }else{
      var filename = file.oldFlName;
      var filetype = filename.substring(filename.lastIndexOf('.'));
      var videoTypelist = [".gif"];
      if (videoTypelist.indexOf(filetype) > -1){
        file.fltype = "4";
      }
    }
  }
  return bugFiles;
};
Page({
  data: {
    bug: '',
    imageList: [],
    preImageList:[],
    isHandle:false,
    loadingFile:false,
    hasSetdata:false,//是否显示测试环境
    bughandle:{
      userId:'',//用户ID
      projectId:'',//项目ID
      creUsId:'',//缺陷创建人ID
      currentId: '',//当前缺陷状态
      bugId:''//缺陷Id
    }
  },
  /*预览图片*/
  previewImage:function(e){
    var current=e.target.dataset.src;
    wx.previewImage({
      current:current,
      urls:this.data.preImageList
    })
  },
  /*预览视频*/
  playVideo: function (e) {
    var src = e.currentTarget.dataset.src;
    wx.navigateTo({
      url: '/pages/video/video?src=' + src,
    })
  },
  /*预览文件*/
  downloadFile:function(e){
    var that=this;
    if (that.data.loadingFile) return;
    var src = turnFilesrc(app.globalData.url, e.target.dataset.src);
    that.setData({
      loadingFile: true
    })
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.downloadFile({
      url:src,
      success:function(res){
        var filePath=res.tempFilePath;
        that.setData({
          loadingFile: false
        })
        wx.openDocument({
          filePath:filePath,
          success:function(res){
            wx.hideLoading();
          }
        })
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
  },
  /*生命周期函数--监听页面显示*/
  onShow:function(){ 
  },
  onLoad: function (e) {
    this.refreshData();
    wx.setNavigationBarTitle({
      title: "缺陷详情"
    });  
  },
  refreshData:function(e){
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: app.globalData.url + "/bugApp/getBugAppDetail.do",
      method: "GET",
      header: wx.getStorageSync('header'),
      data: {
        bugId: app.globalData.currentbug.id
      },
      success: function (res) {
        var imageList = [];
        var preImageList = [];
        if (res.data.code == 100) {
          if (res.data.data != '' && res.data.data != null) {
            var bug = res.data.data;
            var bughandle = that.data.bughandle;
            bughandle.userId = app.globalData.user.id;
            bughandle.projectId = bug.bugProId;
            bughandle.creUsId = bug.bugCreUsId;
            bughandle.currentId = bug.bugState;
            bughandle.bugId = bug.id;
            bughandle.processId = bug.processId;
            bughandle = JSON.stringify(bughandle);
            var bugFiles = bug.bugFiles;
            bugFiles=turnFileList(bugFiles);
            for (var i = 0; i < bugFiles.length; i++) {
              if (bugFiles[i].fltype == "2" || bugFiles[i].fltype=="3") {
                var src = turnFilesrc(app.globalData.url, bugFiles[i].flpath);
                bugFiles[i].flpath=src;
                imageList.push(bugFiles[i]);
                if (bugFiles[i].fltype == "2"){
                  preImageList.push(src);
                }
              }
            }
            //转换缺陷等级
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
            };
            //转换缺陷类型
            var bugCategory = bug.bugCategory;
            if (bugCategory == null) {
              bugCategory = "无"
            } else {
              bugCategory = parseInt(bug.bugCategory);
              bugCategory = app.globalData.bugtypelist[bugCategory].name;
              bug.category = bugCategory;
            }
            bug.bugCreateTime = Util.turnTime(bug.bugCreateTime, 'Y-M-D h:m');//转换创建时间
            //转换历史操作
            var histories = bug.histories;
            if (histories == null) {
              histories = ""
            }
            for (var i = 0; i < histories.length; i++) {
              histories[i].createtimeStr = Util.turnTime(histories[i].createTime, 'Y-M-D h:m');
              switch (histories[i].opertype) {
                case "追加描述":
                  histories[i].iconName = "history_describe.png";
                  break;
                case "修改处理人":
                  histories[i].iconName = "history_manager.png";
                  break;
                case "编辑":
                  histories[i].iconName = "history_edit.png";
                  break;
                default:
                  histories[i].iconName = "history_handle.png";
                  break;
              }
            }
            //判断是否为缺陷处理人
            var bugAppusId = bug.bugAppUsId;//缺陷处理人ID
            var isHandle = that.data.isHandle;
            var projectstate = app.globalData.currentproject.state;
            if (app.globalData.user.id == bugAppusId && projectstate != "已结项") {
              isHandle = true;
            } else {
              isHandle = false;
            }
            //判断是否为众测项目
            var projectType = app.globalData.currentproject.proType;
            var hasSetdata = false;//是否显示测试环境
            if (projectType == "0") {//0.众测项目，1为tce项目
              if (bug.moblie != null && bug.moblie.systemVersion != null && bug.moblie.systemVersion != '') {
                hasSetdata = true;
              }
            }
            that.setData({
              bug: bug,
              imageList: imageList,
              preImageList: preImageList,
              bughandle: bughandle,
              isHandle: isHandle,
              hasSetdata: hasSetdata
            })
          }
          wx.hideLoading();
        } else {
          wx.showToast({
            title: '出错啦',
            mask: true
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
  handleLink:function(e){
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.navigateTo({
      url: '/pages/handle/handle?bughandle=' + this.data.bughandle,
    })
    setTimeout(function () {
      wx.hideLoading();
    }, 1000);
    
  }
})
