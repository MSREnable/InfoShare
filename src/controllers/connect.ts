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

mod.filter('emailOrName', function() {
  return function(items, query) {
    var filtered = [];
    
    if(query === '') return filtered;
    
    angular.forEach(items, function(item) {
      if(item.$id !== window.localStorage.getItem('uid') &&
         (item.first.indexOf(query) === 0 ||
          item.last.indexOf(query) === 0 ||
          uidToEmail(item.$id).indexOf(query) === 0)) {
            filtered.push(item);
          }
    });
    
    return filtered;
  }  
});

mod.controller('connect', ['$scope', '$state', '$ionicPopup', 'model',
    function ($scope, $state, $ionicPopup, model) {
        $scope.users = model.getUsers();
        $scope.partners = model.getPartners(window.localStorage.getItem('uid'));
        $scope.pending = model.getPending(window.localStorage.getItem('uid'));
        
        $scope.query = "";
        $scope.sending = false;
        
        $scope.isPartner = function(uid) {
          return _.find($scope.partners, function(p) { return p.uid === uid; })
        };
        
        $scope.isPending = function(uid) {
          return _.find($scope.pending, function(p) { return p.uid === uid; })
        };
        
        function showSuccess(name) {
         var alertPopup = $ionicPopup.alert({
           title: 'Request Sent!',
           template: 'Your request to connect with ' + name + ' has been sent. ' + name +
                      ' will appear in your contacts on the home screen when they respond' +
                      ' to your request.' 
         });
         
         alertPopup.then(function(res) {
           $state.go('home');
         });
       };
       
       function showPendingRemoved(name) {
         $ionicPopup.alert({
           title: 'Request Deleted!',
           template: 'This pending request has been deleted.' 
         });
       };
       
       function showError() {
         $ionicPopup.alert({
           title: 'Error Sending Request!',
           template: 'Please try again later. If this error continues to occur, please contact your Microsoft Enable Team representative!' 
         });
       };
 
        $scope.sendRequest = function (e) {
          $scope.sending = true;

          if(!_.find($scope.partners, function(p) { return p.uid === e.$id; })) {
            // Create a connection request
            model.sendConnectionRequest(e.$id).then(function () {
                $scope.sending = false;
                showSuccess(e.first + ' ' + e.last);
            }, function (error) {
                $scope.sending = false;
                showError();
                console.error(error);
            });
          }
        };
        
        $scope.deleteRequest = function (e, $event) {
          $event.stopPropagation();
          
          // Create a connection request
          model.deleteConnectionRequest(e.$id).then(function () {
              $scope.sending = false;
              showPendingRemoved();
          }, function (error) {
              $scope.sending = false;
              showError();
              console.error(error);
          });
        };
    }
]);