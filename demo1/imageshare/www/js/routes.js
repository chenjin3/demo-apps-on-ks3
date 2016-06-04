angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('camera', {
    url: '/camera',
    templateUrl: 'templates/camera.html',
    controller: 'cameraCtrl'
  })

  .state('tabsController.page3', {
    url: '/me',
    views: {
      'tab3': {
        templateUrl: 'templates/page3.html',
        controller: 'meCtrl'
      }
    }
  })

  .state('tabsController.page4', {
    url: '/show',
    views: {
      'tab1': {
        templateUrl: 'templates/page4.html',
        controller: 'showCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/tabs',
    templateUrl: 'templates/tabsController.html',
    //abstract:true
    controller: 'tabsCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

    .state('pay', {
      url: '/pay',
      templateUrl: 'templates/onepay.html',
      controller: 'payCtrl'
    })
$urlRouterProvider.otherwise('/login')



});
