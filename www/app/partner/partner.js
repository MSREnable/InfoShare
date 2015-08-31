var mod = angular.module('InfoShare.partner', ['firebase', 'common.model', 'ionic.contrib.ui.cards']);

mod.controller("partner", ['$scope', '$rootScope', '$stateParams', '$timeout', '$firebaseObject', '$firebaseArray', 'model',
    function ($scope, $rootScope, $stateParams, $timeout, $firebaseObject, $firebaseArray, model) {
        // Binding Properties
        $scope.aacuser = model.loadCachedPartner($stateParams.cachedPartnerUid);
        $scope.isPlaying = false;
        $scope.model = {
            suggestion: ""
        };

        $scope.cards = [];
        
        $scope.cardSwiped = function() {
          $scope.cards.splice(0, 1);
          
          if($scope.aacuser.broadcasts.length !== 0)
            $scope.cards.push({ broadcast: nextBroadcast()});
        };
        
        var index = -1;
        
        function nextBroadcast() {          
          index++;
          
          if(index === $scope.aacuser.broadcasts.length) index = 0;
          
          return $scope.aacuser.broadcasts[index];
        }
        
        $scope.aacuser.broadcasts.loaded.then(function(){
          $scope.cardSwiped();
        });
        
        $scope.conditionalClasses = function(filtered) {
          if(filtered) {
            if(($scope.aacuser.permissions.speech < 4 && $scope.aacuser.info.state < 3) ||
               ($scope.aacuser.permissions.speech === 4 && $scope.aacuser.info.state < 2)) {
                return 'block-card';
              }
          }
              
          return '';
        };
        
        $scope.sendSuggestion = function () {
            console.log("Suggestion: " + $scope.model.suggestion);
            var blockID = $scope.aacuser.blocks[0].$id;
            model.sendSuggestion($scope.aacuser.uid, blockID, $scope.model.suggestion);
            $scope.model.suggestion = "";
        };
        
        // Display time of message correctly
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.formatTime = function (timestamp) {
            var a = new Date(timestamp);

            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();

            var hour = a.getHours();
            var min = ('00' + a.getMinutes()).slice(-2);

            var ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            hour = hour ? hour : 12;

            return date + ' ' + month + ' ' + year + ' - ' + hour + ':' + min + ' ' + ampm;
        };

        // Handle state updates
        $scope.hasPlayed = false;
        $scope._onStateChange = function (state) {
            switch (state) {
                case 0:
                    $scope.hasPlayed = false;
                    break;

                case 2:
                    if (!$scope.hasPlayed) {
                        $scope.isPlaying = true;
                        $scope.hasPlayed = true;

                        if(ionic.Platform.isWindowsPhone()) {
                            var msg = new SpeechSynthesisUtterance($scope.aacuser.blocks[0].value);
                            window.speechSynthesis.speak(msg);
                        } else {
                            TTS.speak($scope.aacuser.blocks[0].value, function() {
                                console.log('Done speaking');
                            }, function (error) {
                                console.log(error);
                            })
                        }
                    }
                    break;

                default:
                    break;
            }
        };

        $scope.states = ["Idle", "Typing", "Talking", "Calibrating"];

        $scope.getStateString = function (state) {
            $scope._onStateChange(state);
            return $scope.states[state];
        };

        // Time filter for displaying information based on history settings
        $scope.inTimeRange = function (timestamp) {
            console.log(timestamp);
            var diff = Date.now() - timestamp;

            return diff < (1000 * 60 * 5);
        };

        // Filters for displaying information based on privacy settings
        $scope.filter = function(block) {
          switch($scope.aacuser.permissions.speech) {
            case 0:
              return block.value;
            case 1:
              return wordsFilter(block);
            case 2:
              return sentencesFilter(block);
            case 3:
              return fullBlocksFilter(block);
            case 4:
              return null;//audioOnlyFilter(block);
          }
        };
        
        $scope._filter = function filter(text, char) {
            if (text.slice(-1) === char) {
                return text;
            } else {
                var end = text.lastIndexOf(char);

                if (end > 0)
                  return text.slice(0, end);

                // if ($scope.aacuser.info.state !== 0)
                //   return $scope.aacuser.info.first + ' is typing...';
                  
                return null;
            }
        };

        function wordsFilter(block) {
            if (block.complete) return block.value;

            return $scope._filter(block.value, ' ');
        };

        function sentencesFilter(block) {
            if (block.complete) return block.value;

            return $scope._filter(block.value, '.');
        };
        
        function fullBlocksFilter(block) {
          if(block.complete) return block.value;

          // if ($scope.aacuser.info.state !== 0)
          //   return $scope.aacuser.info.first + ' is typing...';
          
          return null;
        };
        
        function audioOnlyFilter(block) {
          if($scope.isPlaying) 
            return $scope.aacuser.info.first + ' is speaking...';

          // if ($scope.aacuser.info.state !== 0)
          //   return $scope.aacuser.info.first + ' is typing...';
          
          return null;
        };
    }
]);