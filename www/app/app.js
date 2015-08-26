// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('InfoShare', ['ionic', 'InfoShare.init', 'InfoShare.home', 'InfoShare.connect', 'InfoShare.partner', 'ui.gravatar']);

angular.module('ui.gravatar').config([
  'gravatarServiceProvider', function (gravatarServiceProvider) {
      gravatarServiceProvider.defaults = {
          size: 70,
          "default": 'mm'
      };

      // Use https endpoint
      gravatarServiceProvider.secure = true;
  }
]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.
    state('init', {
      url: '/init',
      templateUrl: 'app/init/init.tpl.html',
      controller: 'init'
    }).
    state('home', {
      url: '/',
      templateUrl: 'app/home/home.tpl.html',
      controller: 'home'
    }).
    state('connect', {
      url: '/',
      templateUrl: 'app/connect/connect.tpl.html',
      controller: 'connect'
    }).
    state('partner', {
      url: '/partner?cachedPartnerUid',
      templateUrl: 'app/partner/partner.tpl.html',
      controller: 'partner'
    });
    
    $urlRouterProvider.otherwise("/init");
}]);

app.run(['$state', '$ionicPlatform', function($state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}]);
