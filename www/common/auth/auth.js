var mod = angular.module('common.auth', ['firebase']);

mod.factory('auth', ['$firebaseAuth', '$q', '$rootScope', 
  function ($firebaseAuth, $q, $rootScope) {
      var instance = {};

      instance.isLoggedIn = function() {
          return instance.auth != null && instance.auth.$getAuth();
      }
      
      instance.logout = function () {
        if (instance.auth) {
          instance.auth.$unauth();
          
          instance.auth = null;
          
          window.localStorage.removeItem('uid');
          window.localStorage.removeItem('firstName');
          window.localStorage.removeItem('lastName');
          
          $rootScope.$broadcast('logout');
        }
      };

      function userExists(uid) {
        var deferred = $q.defer();

        var users = new Firebase("https://aacrobat.firebaseio.com/users");

        users.child(uid).once("value", function (snap) {
            if (!snap.exists()) {
                deferred.reject("Email incorrect!");
            } else {
                deferred.resolve(snap.val());
            }
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
      };
      
      var gen = new FirebaseTokenGenerator("VpkncBQ0KFa7zGKbzegh4wBt1ha8mTMwhKq0hwsO");
        
      instance.login = function (userID) {
          var deferred = $q.defer();
          
          var ref = new Firebase("https://aacrobat.firebaseio.com/");
          instance.auth = $firebaseAuth(ref);

          instance.auth.$authWithCustomToken(gen.createToken({ uid: userID }))
            .then(function (authdata) {
                userExists(userID).then(function(user) {
                    console.log("Logged in as: " + authdata.uid);
                    deferred.resolve(user);
                }, function(reason) {
                    instance.auth.$unauth();
                    deferred.reject();
                });
            }, function (error) {
                console.log("Error: Could not log into Firebase");
                instance.auth = null;
                deferred.reject();
            });
          
          return deferred.promise;
      };

      // Lookup the current user
    //   var currentUser = window.localStorage.getItem('uid');

    //   if (!currentUser || currentUser == null) {
    //       console.log('Auth cannot take place until the current user\'s email address has been set!');
    //       instance.auth = null;
    //   } else {
    //       instance.login(currentUser);
    //   }

      return instance;
  }
]);