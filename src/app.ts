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
      templateUrl: 'views/init.tpl.html',
      controller: 'init'
    }).
    state('home', {
      url: '/',
      templateUrl: 'views/home.tpl.html',
      controller: 'home'
    }).
    state('connect', {
      url: '/',
      templateUrl: 'views/connect.tpl.html',
      controller: 'connect'
    }).
    state('partner', {
      url: '/partner?cachedPartnerUid',
      templateUrl: 'views/partner.tpl.html',
      controller: 'partner',
      resolve: {
        model: 'model'
      },
      onEnter: ['$stateParams', 'model', function ($stateParams, model) {
        model.startListening($stateParams.cachedPartnerUid);
      }],
      onExit: ['$stateParams', 'model', function ($stateParams, model) {
        model.stopListening($stateParams.cachedPartnerUid);
      }]
    });
    
  $urlRouterProvider.otherwise("/init");
}]);

app.run(['$rootScope', '$state', '$ionicPlatform', function ($rootScope, $state, $ionicPlatform) {

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.name === 'init' && window.localStorage.getItem('uid')) {
      event.preventDefault();
      $state.go('home');
    }
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}]);
