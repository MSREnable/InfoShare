var mod = angular.module('InfoShare.home', ['common.model']);

mod.controller('home', ['$scope', '$state', 'model',
    function ($scope, $state, model) {
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
    }
]);