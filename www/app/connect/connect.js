var mod = angular.module('InfoShare.connect', ['common.model']);

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

mod.controller('connect', ['$scope', '$state', 'model',
    function ($scope, $state, model) {

        var lastCalled = Date.now();
        var cache = {};

        $scope.users = model.getUsers();

        $scope.placeholder = "Email Address";
        $scope.email = "";

        $scope.noUsers = false;
        $scope.getSuggestions = function (e) {
            var query = emailToUid(e.detail.queryText).toLowerCase();
            var suggestions = e.detail.searchSuggestionCollection;

            if (query.length === 0) {
                $scope.noUsers = false;
                return;
            }

            var userExists = false;
            _.forEach($scope.users, function (user) {
                if (user.isAACuser && user.$id.substr(0, query.length).toLowerCase() === query) {
                    suggestions.appendResultSuggestion(
                        user.first + ' ' + user.last, 
                        uidToEmail(user.$id),
                        user.$id, null, null
                    );

                    cache[user.$id] = user.first + ' ' + user.last;

                    userExists = true;
                }
            });

            $scope.noUsers = !userExists;
        };

        $scope.sending = false;
        $scope.addConnection = function (e) {
            $scope.sending = true;

            // Temporary work-around for the broken implementation of the search box in WinJS
            // this prevents sendConnectionRequest from firing twice in a row
            if (Date.now() - lastCalled > 1000) {
                lastCalled = Date.now();

                // Create a connection request
                model.sendConnectionRequest(e.detail.tag).then(function () {
                    $scope.sending = false;
                    $state.go('home');
                }, function (error) {
                    $scope.sending = false;
                    console.error('The connection request could not be sent!');
                    console.error(error);
                });
            }
        };
    }
]);