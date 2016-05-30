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
        window.cordova.InAppBrowser.open(url, "_blank", 'location=no');
      } else {
        window.open(url, '_blank');
      }
    };

    Ks3.config.AK = CONSTANT.AK;
    Ks3.config.bucket = CONSTANT.bucket;
    Ks3.config.region = CONSTANT.region;


    //sharesdk初始化
    $rootScope.initShareSDK = function () {

      //1、配置平台信息，有开放平台账号系统的平台需要自行去申请账号（平台字段参考：http://wiki.mob.com/社交平台配置项说明/）
      var platformConfig = {};

      //以下是示例
      //新浪微博
      var sinaConf = {};
      sinaConf["app_key"] = "568898243";
      sinaConf["app_secret"] = "38a4f8204cc784f81f9f0daaf31e02e3";
      sinaConf["redirect_uri"] = "http://www.sharesdk.cn";
      platformConfig[window.$sharesdk.PlatformID.SinaWeibo] = sinaConf;

      //微信
      var weixinConf = {};
      weixinConf["app_id"] = "wx4868b35061f87885"; //"wx0f1257757a5fce80";
      weixinConf["app_secret"] = "64020361b8ec4c99936c0e3999a9f249"; //"425aa8f9dc020fd5047c50508d85507e";
      platformConfig[window.$sharesdk.PlatformID.WechatPlatform] = weixinConf;

      //QQ
      var qqConf = {};
      qqConf["app_id"] = "100371282";
      qqConf["app_key"] = "aed9b0303e3ed1e27bae87c33761161d";
      platformConfig[window.$sharesdk.PlatformID.QQPlatform] = qqConf;


      //2、初始化ShareSDK
      window.$sharesdk.initSDKAndSetPlatfromConfig("1301300a2e8a8", platformConfig); //first param is appKey
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
  bucket: 'gzz-beijing',
  region: 'BEIJING',
  AK: 'S1guCl0KF/qxO4CElPY/',
  serverHost: 'http://127.0.0.1:3000/',
  dbHost: 'http://127.0.0.1:28017/demoapp/image/'
};


ks3app.constant('CONSTANT', _Constant);
