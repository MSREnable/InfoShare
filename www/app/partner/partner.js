var mod = angular.module('InfoShare.partner', ['firebase', 'common.model']);

mod.controller("partner", ['$scope', '$stateParams', '$timeout', '$firebaseObject', '$firebaseArray', 'model',
    function ($scope, $stateParams, $timeout, $firebaseObject, $firebaseArray, model) {

        // Binding Properties
        $scope.aacuser = model.loadCachedPartner($stateParams.cachedPartnerUid);
        $scope.selectedMsg = 0;
        $scope.isPlaying = false;

        // Display time of message correctly
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $scope.formatTime = function (timestamp) {
            var a = new Date(timestamp);

            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();

            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();

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

                        var msg = new SpeechSynthesisUtterance('This is a test');
                        window.speechSynthesis.speak(msg);
                    }
                    break;

                default:
                    break;
            }
        };

        $scope.states = ["idle", "typing", "talking", "calibrating"];

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
        $scope._filter = function filter(text, char) {
            if (text.slice(-1) === char) {
                return text;
            } else {
                var end = text.lastIndexOf(char);

                if (end > 0)
                    return text.slice(0, end);

                return '';
            }
        };

        $scope.wordsFilter = function (block) {
            if (block.complete) return block.value;

            return $scope._filter(block.value, ' ');
        };

        $scope.sentencesFilter = function (block) {
            if (block.complete) return block.value;

            return $scope._filter(block.value, '.');
        };

        // Start a timer for iterating through the current broadcasts
        var broadcastTimer = null;
        function updateBroadcast() {
            $scope.selectedMsg = ($scope.selectedMsg + 1) % $scope.aacuser.broadcasts.length;
            broadcastTimer = $timeout(updateBroadcast, 10000);
        }
        broadcastTimer = $timeout(updateBroadcast, 10000);

        // Stop updating the broadcasts when the user navigates away
        // function navigatingAway() {
        //     if (broadcastTimer && $timeout.cancel(broadcastTimer)) broadcastTimer = null;
        //     WinJS.Navigation.removeEventListener('navigating', navigatingAway);
        // }
        // WinJS.Navigation.addEventListener('navigating', navigatingAway);
    }
]);