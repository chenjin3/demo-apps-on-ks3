// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var ks3app = angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.directives','ngCordova'])

.run(function($ionicPlatform, CONSTANT) {
  $ionicPlatform.ready(function() {
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

    Ks3.config.AK = CONSTANT.AK;
    Ks3.config.bucket = CONSTANT.bucket;
    Ks3.config.region = CONSTANT.region;
})

var _Constant = {
  bucket: 'gzz-beijing',
  region: 'BEIJING',
  AK: 'S1guCl0KF/qxO4CElPY/',
  serverHost: 'http://127.0.0.1:3000/'
};


ks3app.constant('CONSTANT', _Constant);
