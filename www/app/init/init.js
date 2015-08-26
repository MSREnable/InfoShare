var mod = angular.module('InfoShare.init', ['common.auth', 'common.model']);

function emailToUid(email) {
    var tmp = email.split('@').join('__at__');
    tmp = tmp.split('.').join('__dot__');
    return tmp;
};

function uidToEmail(uid) {
    var tmp = uid.split('__at__').join('@');
    tmp = tmp.split('__dot__').join('.');
    return tmp;
};

mod.controller('init', ['$scope', '$state', 'auth', 'model',
    function ($scope, $state, auth,  model) {        
        $scope.user = {
          first: "John",
          last: "Doe",
          email: "johnny@doe.com"
        };

        $scope.setUid = function () {
            // Hide the keyboard before navigating away from this page
            //var curr = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            //curr.tryHide();

            // Set this person's uid and save them as a new user if their uid doesn't already exist
            window.localStorage.setItem('uid', emailToUid($scope.user.email));
            window.localStorage.setItem('firstName', $scope.user.first);
            window.localStorage.setItem('lastName', $scope.user.last);

            auth.init(emailToUid($scope.user.email), function (authdata) {
                model.newUser(emailToUid($scope.user.email), {
                    connected: true,
                    first: $scope.user.first,
                    last: $scope.user.last,
                    isAACuser: false,
                    state: 0,
                }).then(function (userID) {
                    $state.go('home');
                }, function (reason) {
                    console.log("Fatal error in initialization...");
                    console.log(reason);
                });
            });
        };
    }
]);