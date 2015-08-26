var mod = angular.module('common.model', ['firebase', 'common.auth']);

mod.factory('model', ['$rootScope', '$q', '$firebaseObject', '$firebaseArray', 'auth',
    function ($rootScope, $q, $firebaseObject, $firebaseArray, auth) {
        var currentUser = window.localStorage.getItem('uid');

        var blocks = new Firebase("https://coconstruct.firebaseio.com/blocks");
        var users = new Firebase("https://coconstruct.firebaseio.com/users");
        var partners = new Firebase("https://coconstruct.firebaseio.com/partners");
        var requests = new Firebase("https://coconstruct.firebaseio.com/requests");
        var listeners = new Firebase("https://coconstruct.firebaseio.com/listeners");
        var permissions = new Firebase("https://coconstruct.firebaseio.com/permissions");
        var broadcasts = new Firebase("https://coconstruct.firebaseio.com/broadcasts");

        var partnerCache = [];

        var isNewUser = { val: false };

        var partnerRef = null;

        var broadcastCache = [];

        var dataCache = {
            user: null,
            broadcasts: broadcastCache,
            current: 'Loading...',
            timestamp: Date.now(),
            complete: false,
            permissions: {
                speech: 4
            }
        };

        function _uidToEmail (uid) {
            var tmp = uid.split('__at__').join('@');
            tmp = tmp.split('__dot__').join('.');
            return tmp;
        };

        function _getBroadcasts(uid) {
            //Get the general messages
            var generalMsgs = [];
            var gen = $q.defer();
            broadcasts.child('general').child(uid).once('value', function (snap) {
                var messages = snap.val();

                _.forEach(messages, function (message) {
                    generalMsgs.push(message);
                });

                gen.resolve();
            });

            //Get the default messages
            var defaultMsgs = [];
            var def = $q.defer();
            broadcasts.child('viewers').child(uid).once('value', function(snap) {
                if (!snap.child(currentUser).exists()) {
                    broadcasts.child('default').child(uid).once('value', function (snap) {
                        var messages = snap.val();

                        _.forEach(messages, function (message) {
                            defaultMsgs.push(message);
                        });

                        def.resolve();

                        broadcasts.child('viewers').child(uid).child(currentUser).set(true);
                    });
                } else {
                    def.resolve();
                }
            });
                

            $q.all([gen.promise, def.promise]).then(function () {
                broadcastCache.length = 0;

                var i = 0;
                _.forEach(defaultMsgs, function (data) {
                    broadcastCache.push({
                        id: i,
                        type: 'default',
                        msg: data
                    });

                    i++;
                });

                _.forEach(generalMsgs, function (data) {
                    broadcastCache.push({
                        id: i,
                        type: 'general',
                        msg: data
                    });

                    i++;
                });
            });

            return broadcastCache;
        }

        return {
            connect: function() {
                if (currentUser) {
                    users.child(currentUser).child('connected').set(true);
                }
            },

            disconnect: function () {
                var deferred = $q.defer();

                if (currentUser) {
                    users.child(currentUser).child('connected').set(false, function (error) {
                        if (error) {
                            deferred.reject(error)
                        } else {
                            deferred.resolve();
                        }
                    });
                } else {
                    deferred.reject();
                }

                return deferred.promise;
            },

            startListening: function (id) {
                listeners.child(id).child(currentUser).set(true);
            },

            stopListening: function (id) {
                listeners.child(id).child(currentUser).set(null);
            },

            getUsers: function () {
                return $firebaseArray(users);
            },

            isUserNew: function() {
                return isNewUser;
            },

            getPartners: function(uid) {
                if (!partnerRef) {
                    partnerRef = partners.child(uid);

                    partnerRef.once('value', function (partners) {
                        isNewUser.val = !partners.exists();
                    });
                    
                    partnerRef.on('child_added', function (added) {
                        var partner = $firebaseObject(users.child(added.key()));

                        partner.$loaded().then(function () {
                            partnerCache.push({
                                info: partner,
                                uid: added.key(),
                                email: _uidToEmail(added.key()),
                                level: $firebaseObject(added.ref()),
                                permissions: null,
                                blocks: null
                            });
                        });
                    });

                    partnerRef.on('child_removed', function (old) {
                        _.remove(partnerCache, function (partner) {
                            return partner.uid === old.key();
                        });

                        $rootScope.$apply();
                    });
                }

                return partnerCache;
            },

            loadCachedPartner: function (uid) {
                var partner = _.find(partnerCache, function (p) {
                    return p.uid === uid;
                });

                if(!partner.permissions) partner.permissions = $firebaseObject(permissions.child(uid).child(partner.level.$value + ''));
                if(!partner.blocks) partner.blocks = $firebaseArray(blocks.child(uid).orderByKey().limitToLast(1));

                // Always update the broadcasts?
                partner.broadcasts = _getBroadcasts(partner.uid);

                return partner;
            },
            
            sendConnectionRequest: function (uid) {
                console.log('Sending partner request...');

                var deferred = $q.defer();

                var person = requests.child(uid).child(currentUser).set(Firebase.ServerValue.TIMESTAMP, function (error) {
                    if (error) {
                        deferred.reject(error)
                    } else {
                        deferred.resolve();
                    }
                });

                return deferred.promise;
            },

            newUser: function (uid, info) {
                var deferred = $q.defer();

                var ref = users.child(uid);

                ref.once("value", function (snap) {
                    if (!snap.exists()) {
                        users.child(uid).set(info, function (error) {
                            if (error) {
                                deferred.reject(error);
                            } else {
                                deferred.resolve(uid);
                            }
                        });
                    } else {
                        deferred.resolve(uid);
                    }
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            }
        }
    }
]);