define(['objects'], function(objects) {
    var app = angular.module('app');

    app.factory('UserData', function($http, $location) {
        return {
            username: '',
            token: '',
            email: '',
            set: function(username, email, token) {
                this.username = username;
                this.email = email;
                this.token = token;
                if (typeof(Storage) !== "undefined") {
                    sessionStorage.setItem("user_data",
                        JSON.stringify({
                            username: this.username,
                            email: this.email,
                            token: this.token
                        })
                    );
                }
            },
            get: function() {
                if (!this.token && typeof(Storage) !== "undefined" && typeof sessionStorage.getItem("user_data") !== "undefined" ) {
                    var data = JSON.parse(sessionStorage.getItem("user_data"));
                    if (typeof data.username != 'undefined' && typeof data.email != 'undefined' && typeof data.token != 'undefined') {
                        this.username = data.username;
                        this.email = data.email;
                        this.token = data.token;
                    }
                }

                return this;
            }
        }
    });

    app.factory('Topic', function($http, $location) {
        return {
            id: 0,
            set: function(id) {
                if (parseInt(id) > 0) {
                    this.id = parseInt(id);
                    if (typeof(Storage) !== "undefined") {
                        sessionStorage.setItem("quiz_id", this.id);
                    }
                }
            },
            get: function() {
                if (!this.id && typeof(Storage) !== "undefined" && typeof sessionStorage.getItem("quiz_id") !== "undefined" ) {
                    this.id = parseInt(sessionStorage.getItem("quiz_id"));
                }

                return this.id;
            }
        }
    });

    app.factory('FacebookAPI', function($http, $location, UserData, Topic, ApiUrl) {
        var functions = {
            login: function(response, topic_id) {
                var $params = {};
                if (typeof response.facebook == 'undefined' || !response.facebook) {
                    $params = $.param({facebook: 0, name: response.name, email: response.email});
                } else {
                    $params = $.param({token: response.accessToken, name: response.name, email: response.email, facebook: 1});
                }

                $http({
                    method: 'POST',
                    url: ApiUrl + 'user/login',
                    data: $params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .success(function(result) {
                        // the result is generated and stored in the database, it will be loaded from the next page
                        if (result['error'] == 0) {
                            UserData.set(response.name, response.email, result['token']);
                            $location.path('/questions');
                        } else {
                            // show error message
                        }
                    })
                    .error(function() {
                        // show error message
                    });
            },
            logout: function() {
                alert('logout');
            },
            statusChangeCallback: function(response, callBackFailLogin) {
                if (response.status === 'connected' && typeof response.authResponse.accessToken != 'undefined' && typeof response.authResponse.userID != 'undefined') {
                    // Logged into your app and Facebook.
                    var access_token = response.authResponse.accessToken;
                    FB.api('/me', function(response) {
                        response['facebook'] = 1;
                        response['accessToken'] = access_token;
                        response['email'] = response['email'] || response['id'] + '@facebookuser.com';
                        functions.login(response, Topic.get());
                    });
                } else {
                    FB.login(function(response) {
                        functions.statusChangeCallback(response)
                    }, {scope: 'email'});

                    callBackFailLogin();
                }
                $('#mask').hide();
            }
        }

        return functions;
    });

});