var mod = angular.module('InfoShare.home', ['common.auth', 'common.model']);

mod.controller('home', [
    '$scope', '$rootScope', '$state', 'auth', 'model',
    function ($scope, $rootScope, $state, auth, model) {
        // Binding Properties
        $scope.me = window.localStorage.getItem('firstName');
        $scope.aacuserCache = model.getPartners(window.localStorage.getItem('uid'));
        $scope.isNew = model.isUserNew();

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name === 'home') {
                $scope.me = window.localStorage.getItem('firstName');
                $scope.aacuserCache = model.getPartners(window.localStorage.getItem('uid'));
                $scope.isNew = model.isUserNew();
            }
        });

        // Event Functions
        $scope.selectUser = function (e) {
            $state.go('partner', { cachedPartnerUid: e.uid });
        };

        $scope.createNew = function (e) {
            $state.go('connect');
        };

        $scope.logout = function () {
            window.localStorage.removeItem('uid');
            window.localStorage.removeItem('firstName');
            window.localStorage.removeItem('lastName');

            model.resetPartnerCache();

            //auth.logout();
            $state.go('init');
        };
    }
]);
