// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('InfoShare', ['ionic', 'InfoShare.init', 'InfoShare.home', 'InfoShare.connect', 'InfoShare.partner', 'common.auth', 'ui.gravatar']);

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

var db = null;

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
    
//   db = $cordovaSQLite.openDB("my.db");
//   $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS userinfo (id integer primary key, uid text)");
  
//   var query = "SELECT uid FROM userinfo";
//   $cordovaSQLite.execute(db, query).then(function(res) {
//       if(res.rows.length > 0) {
//           console.log("SELECTED -> " + res.rows.item(0).uid);
//           $urlRouterProvider.otherwise("/");
//       } else {
//           console.log("No results found");
//           $urlRouterProvider.otherwise("/init");
//       }
//   }, function (err) {
//       console.error(err);
//       $urlRouterProvider.otherwise("/init");
//   });
        
  $urlRouterProvider.otherwise("/init");
}]);

app.run(['$rootScope', '$state', 'auth', '$ionicPlatform', function ($rootScope, $state, auth, $ionicPlatform) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if(toState.name !== 'init' && !auth.isLoggedIn()) {
        console.log('User must log in to access the app!');
        event.preventDefault();
        $state.go('init');
    } else if (toState.name === 'init' && auth.isLoggedIn()) {
        console.log('User is logged in. Redirecting to home page');
        event.preventDefault();
        $state.go('home');
    } else if (toState.name === 'init' && !auth.isLoggedIn() && window.localStorage.getItem('uid')) {
        console.log('User is not logged in but is known. Logging user in.');
        event.preventDefault();
        auth.login(window.localStorage.getItem('uid')).then(function() {
            $state.go('home');
        }, function(reason) {
            $state.go('init');
        });
    } else {
        console.log('Other navigation occurred');
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
