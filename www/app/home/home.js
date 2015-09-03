var mod = angular.module('InfoShare.home', ['common.auth', 'common.model']);

mod.controller('home', ['$scope', '$state', 'auth', 'model',
    function ($scope, $state, auth, model) {
        // Binding Properties
        $scope.me = window.localStorage.getItem('firstName');
        $scope.aacuserCache = model.getPartners(window.localStorage.getItem('uid'));
        $scope.isNew = model.isUserNew();
        
        // Event Functions
        $scope.selectUser = function (e) {
          $state.go('partner', {cachedPartnerUid: e.uid});
        };

        $scope.createNew = function (e) {
          $state.go('connect');
        };

        $scope.reset = function () {
          function emailToUid(email) {
            var tmp = email.split('@').join('__at__');
            tmp = tmp.split('.').join('__dot__');
            return tmp;
          };

          window.localStorage.setItem('uid', emailToUid('phugheswest@gmail.com'));
          window.localStorage.setItem('firstName', 'Patra');
          window.localStorage.setItem('lastName', 'West');

          auth.init(emailToUid('phugheswest@gmail.com'), function (authdata) {
            model.newUser(emailToUid('phugheswest@gmail.com'), {
              connected: true,
              first: 'Patra',
              last: 'West',
              isAACuser: false,
              state: 0,
            }).then(function (userID) {
              $state.go('home');
            }, function (reason) {
              console.log("Fatal error in initialization...");
              console.log(reason);
            });
          });
        }
    }
]);