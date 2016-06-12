// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var ks3app = angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives','app.filters', 'ngCordova'])

  .run(function ($rootScope, $ionicPlatform, CONSTANT) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });

    //打开文档链接
    $rootScope.open_outer_url = function (url) {
      if (window.cordova && window.cordova.InAppBrowser) {
        //var options = {
        //  location: 'yes',
        //  clearcache: 'yes',
        //  toolbar: 'yes'
        //};
        var options = "location=yes,clearcache=no,toolbar=yes";
        var ref = window.cordova.InAppBrowser.open(url, "_self", options).then(function(event) {
          // success

        }).catch(function(event) {
          // error
          ref.close();
          ref = undefined;
        });
      } else {
        window.open(url, '_system');
      }
    };

    Ks3.config.bucket = CONSTANT.bucket;
    Ks3.config.region = CONSTANT.region;
    Ks3.config.baseUrl = Ks3.ENDPOINT[Ks3.config.region];

    Ks3.config.AK = 'S1guCl0KF/r3cvqa5YHG';
    Ks3.config.SK = 'CVpFTtt+tMlxwkg1PtzmD9p1rxHxAu0enzNBbk3F';


    //sharesdk初始化
    $rootScope.initShareSDK = function () {

      //1、配置平台信息，有开放平台账号系统的平台需要自行去申请账号（平台字段参考：http://wiki.mob.com/社交平台配置项说明/）
      var platformConfig = {};

      //以下是示例
      //新浪微博
      var sinaConf = {};
      sinaConf["app_key"] = "34122121";
      sinaConf["app_secret"] = "1f2b3f17bdd1c3f0e9e7b3e96e559f94";
      sinaConf["redirect_uri"] = "http://ks3.ksyun.com";
      platformConfig[window.$sharesdk.PlatformID.SinaWeibo] = sinaConf;

      //微信
      var weixinConf = {};
      weixinConf["app_id"] = "wx0f1257757a5fce80";
      weixinConf["app_secret"] = "425aa8f9dc020fd5047c50508d85507e";
      platformConfig[window.$sharesdk.PlatformID.WechatPlatform] = weixinConf;

      //QQ
      var qqConf = {};
      qqConf["app_id"] = "1105462710";
      qqConf["app_key"] = "j9uOafVU7cWqbxuW";//"aed9b0303e3ed1e27bae87c33761161d";
      platformConfig[window.$sharesdk.PlatformID.QQPlatform] = qqConf;

      //QQ空间
      //platformConfig[window.$sharesdk.PlatformID.QZone] = qqConf;


      //Mail
      var mailConf = {};
      platformConfig[$sharesdk.PlatformID.Mail] = mailConf;

      //2、初始化ShareSDK
      window.$sharesdk.initSDKAndSetPlatfromConfig("1301300a2e8a8", platformConfig); //first param is appKey   iosv1101
    }

    ionic.Platform.ready(function(){
      // will execute when device is ready, or immediately if the device is already ready.
      var deviceInformation = ionic.Platform.device();
      if(deviceInformation.platform == 'Android') {
        window.$sharesdk.PLATFORM_SHARE = 1;
      }else if( deviceInformation.platform == 'iOS') {
        window.$sharesdk.PLATFORM_SHARE = 2;
      }
      $rootScope.initShareSDK();
    });

  })

var _Constant = {
  dir: 'demoapp/',
  bucket: 'chenjin520',
  region: 'BEIJING',
  //serverHost: 'http://local.ks3.ksyun.com:3000/',
  serverHost: 'http://52.193.207.108/',
  dbPath: 'demoapp/image/',
  //dbHost: 'http://local.ks3.ksyun.com:28017/demoapp/image/'
};


ks3app.constant('CONSTANT', _Constant);
