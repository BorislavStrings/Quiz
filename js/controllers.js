define(['objects'], function(objects) {

    var app = angular.module('app');
    var api_url = 'http://127.0.0.1/quiz_api/';
    var app_url = 'http://127.0.0.1/quiz/';

    app.controller('ResultsCtrl', function ($scope, $http, $routeParams, $location) {
        $scope.result = {};
        $scope.obj = {};
        $scope.obj.name = '';
        $scope.obj.image = '';
        $scope.obj.description = '';
        var token = $routeParams.token;
        if (typeof token === 'undefined' || !token) {
            redirect('login');
        }

        $http({
            method: 'get',
            url: api_url + '/result/get?token=' + token.trim(),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (result) {
                $('#mask').hide();
                // the result is generated and stored in the database, it will be loaded from the next page
                if (result['error'] == 0) {
                    $scope.obj.image = result['result'].image;
                    $scope.obj.name = result['result'].name;
                    $scope.obj.description = result['result'].description;
                } else {
                    // show error message
                }
            })
            .error(function () {
                // show error message
            });

        $scope.share = function () {
            FB.init({
                appId: '731929813620332',
                channelUrl: '../channel.html',
                status: false,
                cookie: true,
                xfbml: true
            });

            FB.ui({
                method: "feed",
                display: "iframe",
                link: $location.absUrl(),
                caption: $location.absUrl(),
                name: $scope.obj.name,
                description: $scope.obj.description,
                picture: $scope.obj.image
            });
        }

        /*
         $('#result_container').highcharts({
         chart: {
         type: 'column'
         },
         title: {
         text: 'Title Goes Here'
         },
         subtitle: {
         text: 'Title subtitles goes here'
         },
         xAxis: {
         type: 'Persons'
         },
         yAxis: {
         title: {
         text: 'percents'
         }
         },
         legend: {
         enabled: false
         },
         plotOptions: {
         series: {
         borderWidth: 0,
         dataLabels: {
         enabled: true,
         format: '{point.y:.1f}%'
         }
         }
         },
         series: [{
         name: "Score",
         colorByPoint: true,
         data: $scope.result
         }]
         });

         return false;
         // construct result
         */
    });

    app.controller('ErrorCtrl', function ($scope, $http, $location, $routeParams) {
        // get the number of the error and handle it!
        $('#mask').hide();
        $scope.error_one = false;
        $scope.error_two = false;

        var error = typeof $routeParams.number != 'undefined' && parseInt($routeParams.number) ? parseInt($routeParams.number) : 1;

        if (error == 1) {
            $scope.error_one = true;
        } else {
            $location.path('select/quiz');
        }
    });

    app.controller('SelectQuizCtrl', function ($scope, $http, $location, $routeParams) {
        // get the number of the error and handle it!
        $scope.topics_array = [];

        $http({
            method: 'GET',
            url: api_url + 'topics/available',
            data: {},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data, status, headers, config) {
                if (data['error'] == 0) {
                    $scope.topics_array = data['data'];
                } else {
                    $location.path('error/1');
                }
                $('#mask').hide();
            })
            .error(function (data, status, headers, config) {
                $location.path('error/1');
            });

        $scope.selectTopic = function (id) {
            $location.path('home/quiz/' + id);
        }
    });

    app.controller('LoginCtrl', ['$scope', '$http', '$location', 'FacebookAPI', '$window', '$routeParams', 'Topic', function ($scope, $http, $location, $FacebookAPI, $window, $routeParams, $Topic) {
        $scope.login = {};
        $scope.login_visible = true;
        $scope.menu = {};

        var topic_id = '';
        if (typeof $routeParams.topic != 'undefined' && parseInt($routeParams.topic)) {
            $Topic.set(parseInt($routeParams.topic));
            topic_id = $Topic.get();
        } else {
            $location.path('error/2');
            return;
        }

        $window.fbAsyncInit = function () {
            FB.init({
                appId: '731929813620332',
                channelUrl: '../channel.html',
                status: true,
                cookie: true,
                xfbml: true
            });

            $('#facebook_login').on('click', function () {
                FB.getLoginStatus(function (response) {
                    $FacebookAPI.statusChangeCallback(response, function () {
                        $scope.login_visible = true;
                    });
                });
            });
        };

        $scope.menu.show = function (panel) {
            var top = (panel == 'normal' ? -250 : 0);

            $('#login-content').animate({
                top: top + 'px'
            }, 'slow');
        }

        $scope.login.submit = function () {
            var email = $('#email').val(),
                name = $('#name').val();

            if (typeof email == 'undefined' || typeof name == 'undefined' || !name || !email) {
                if (typeof name == 'undefined' || !name) {
                    $('#name').css('border-color', 'red');
                }

                if (typeof email == 'undefined' || !email) {
                    $('#email').css('border-color', '#B20000');
                }

                return false;
            }

            $FacebookAPI.login({'email': email, 'name': name, 'facebook': 0}, topic_id);
        }

        if (typeof FB != 'undefined') {
            $window.fbAsyncInit();
        } else {
            $scope.login_visible = true;
        }
    }]);

    app.controller('QuestionsCtrl', function ($scope, $routeParams, $http, $location, UserData, Topic) {
        var id = Topic.get();
        var user_data = UserData.get();
        var token = user_data.token;

        if (typeof id === 'undefined' || !id || typeof token == 'undefined' || !token) {
            $location.path('error/2');
        }

        $scope.colors = ['red', 'blue', 'orange', 'green'];
        $scope.colors.getColor = function (key) {
            if (typeof $scope.colors[key] != 'undefined') {
                return $scope.colors[key];
            }

            return $scope.colors[Math.floor(Math.random() * $scope.colors.length)];
        }

        $scope.progress_number = 1;
        $scope.current_question = 0;
        $scope.questions_count = 0;
        $scope.progress_width = 0;
        $scope.questions = {};

        $http({
            method: 'GET',
            url: api_url + 'qustions/answers?token=' + token + '&topic_id=' + id,
            data: {},
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .success(function (data, status, headers, config) {
                if (data['error'] == 0) {
                    $.each(data['data'], function (inx, value) {
                        if (typeof $scope.questions[value.question_id] == 'undefined') {
                            $scope.questions_count++;
                            $scope.questions[value.question_id] = {
                                id: value.question_id,
                                text: value.question_text,
                                answers: []
                            }
                        }

                        $scope.questions[value.question_id].answers.push({
                            id: value.answer_id,
                            text: value.answer_text
                        });
                    });

                    $scope.current_question = 1;
                } else if (data['error'] == 2) {
                    $location.path('results/' + data['data']['result_token']);
                } else {
                    $location.path('login');
                }

                $('#mask').hide();
            })
            .error(function (data, status, headers, config) {
                redirect('error');
            });

        $scope.answers = {}

        $scope.showResults = function () {
            // Simple GET request example:
            $http({
                method: 'POST',
                url: api_url + '/classification_network/get',
                data: $.param({token: token, topic_id: id, answers: $scope.answers}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function (result) {
                if (typeof result['error'] != 'undefined' && result['error'] == 0) {
                    $location.path('results/' + result['result_token']);
                }
//			redirect('error' + result_id);
            }).error(function () {
                // error
            });
        }

        $scope.submitAnswer = function (question_id, answer_id) {
            if (typeof question_id != 'undefine' && typeof answer_id != 'undefined' && question_id && answer_id) {
                $scope.progress_number += 1;
                $scope.answers[question_id] = answer_id;
                $scope.progress_width = (100 / $scope.questions_count) * $scope.current_question;
                $('.progress .inner').width($scope.progress_width + '%');

                $('#question_' + question_id).hide("drop", {direction: 'right'}, 300, function () {
                    if ($scope.current_question < $scope.questions_count) {
                        var next = false;
                        var next_question = question_id;

                        // find next question
                        $.each($scope.questions, function (inx, value) {
                            if (next) {
                                next_question = value.id;
                                return false;
                            }
                            if (value.id == question_id) {
                                next = true;
                            }
                        });


                        $scope.current_question += 1;
                        $('#question_' + next_question).show('drop', {direction: 'left'}, 300);
                    } else {
                        $scope.showResults();
                    }
                });
            }
        }
    });
});