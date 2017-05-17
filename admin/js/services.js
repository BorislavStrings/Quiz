define(['objects'], function(objects) {
    var app = angular.module('app');

    app.factory('UserData', function($http, $location, ApiUrl) {
        var obj = {
            token: '',
            email: '',
            validate: function() {
                if (!obj.getToken()) {
                    return false;
                } else {
                    return true;
                }
            },
            set: function(token, email) {
                obj.token = token;
                obj.email = email;

                if (typeof(Storage) !== "undefined") {
                    sessionStorage.setItem("pullthestrings_email", email);
                    sessionStorage.setItem("pullthestrings_token", token);
                }
            },
            getToken: function() {
                if (obj.token) {
                    return obj.token;
                } else if (typeof(Storage) !== "undefined" && sessionStorage.getItem('pullthestrings_token')) {
                    obj.token = sessionStorage.getItem('pullthestrings_token');
                    return obj.token;
                }

                return '';
            },
            getEmail: function() {
                if (obj.email) {
                    return obj.email;
                } else if (typeof(Storage) !== "undefined" && sessionStorage.getItem('pullthestrings_email')) {
                    obj.email = sessionStorage.getItem('pullthestrings_email');
                    return obj.email;
                }

                return '';
            },
            login: function(email, password) {
                return new Promise(function (resolve, reject) {
                    if (!email || !password) {
                        reject({error: 1});
                    }

                    var $params = $.param({password: password, email: email});
                    $http({
                        method: 'POST',
                        url: ApiUrl + 'admin/login',
                        data: $params,
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                    .success(function (result) {
                        if (result['error'] == 0) {
                            UserData.set(result['result'], email);
                            resolve(result['result']);
                        } else {
                            UserData.set('', '');
                            resolve({error: 1});
                        }
                    })
                    .error(function () {
                        reject({error: 1});
                    });
                });
            }
        }

        return obj;
    });

    app.factory('TopicResults', function($http, $location, UserData, ApiUrl) {
        return {
            items: [],
            categories: [],
            get: function(topic_id) {
                var $that = this;

                topic_id = parseInt(topic_id);
                if (!topic_id) {
                    return new Promise(function (resolve, reject) {
                        reject(true);
                    });
                }

                if ($that.items && typeof $that.items[topic_id] != 'undefined' && $that.items[topic_id].length > 0) {
                    return new Promise(function (resolve, reject) {
                        resolve(true);
                    });
                }

                return new Promise(function (resolve, reject) {
                    $http({
                        method: 'GET',
                        url: ApiUrl + 'result/by_topic',
                        params: {token: UserData.getToken(), topic_id: topic_id},
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                    })
                    .success(function (result) {
                        // the result is generated and stored in the database, it will be loaded from the next page
                        if (result['error'] == 0) {
                            $that.items = result['data']['items'];
                            $that.categories = result['data']['categories'];
                            resolve(true);
                        }
                    })
                    .error(function () {
                        reject(true);
                    });
                });
            },
            findUser: function(topic_id, user_id) {
                var result = {};

                $.each(this.items, function (inx, user) {
                    if (user['user_data'].id == user_id) {
                        result = user;

                        return false;
                    }
                });

                return result;
            }
        }
    });
});