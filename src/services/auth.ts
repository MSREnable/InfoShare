var mod = angular.module('common.auth', ['firebase']);

mod.factory('auth', ['$firebaseAuth',
  function ($firebaseAuth) {
      var instance = {};

      instance.logout = function () {
        if (instance.auth) {
          instance.auth.$unauth();
        }
      };

      instance.init = function (userID, callback) {
          var ref = new Firebase("https://coconstruct.firebaseio.com/users");
          var auth = $firebaseAuth(ref);

          var tokenGenerator = new FirebaseTokenGenerator("9mxGEBWfOIFvCjXczz04CjG69W0BIKoMJ341Jtf1");

          var token = tokenGenerator.createToken(
            { uid: userID }
          );

          auth.$authWithCustomToken(token).then(function (authdata) {
              console.log("Logged in as: " + authdata.uid);
              if(callback) callback(authdata);
          }).catch(function (error) {
              console.log("Error: Could not log into Firebase");
          });

          instance.auth = auth;
      };

      // Lookup the current user
      var currentUser = window.localStorage.getItem('uid');

      if (!currentUser || currentUser == null) {
          console.log('Auth cannot take place until the current user\'s email address has been set!');
          instance.auth = null;
      } else {
          instance.init(currentUser);
      }

      return instance;
  }
]);