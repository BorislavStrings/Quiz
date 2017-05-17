    define(['objects', 'clusterfck'], function(objects, clusterfck) {

        var app = angular.module('app');
        var api_url = 'http://127.0.0.1/quiz_api/';
        var app_url = 'http://127.0.0.1/quiz/';

        app.controller('ErrorCtrl', function($scope, $http, $location) {
            // get the number of the error and handle it!
        });

        app.controller('LoginCtrl', function($scope, $http, $location, UserData) {
            $scope.login = {};
            $scope.login.email = '';
            $scope.login.password = '';
            $scope.messages = {};
            $scope.messages.error = '';

            $scope.login.submit = function() {
                var email = $scope.login.email,
                    password = $scope.login.password;

                if (typeof email == 'undefined' || typeof password == 'undefined' || ! password || ! email) {
                    $scope.messages.error = 'Wrong Email or Password!';
                    $scope.$apply();
                    return false;
                }

                var $params = $.param({password: $scope.login.password, email: $scope.login.email});
                $http({
                    method: 'POST',
                    url: api_url + 'admin/login',
                    data: $params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .success(function(result) {
                        // the result is generated and stored in the database, it will be loaded from the next page
                        if (result['error'] == 0) {
                            UserData.set(result['token'], $scope.login.email);
                            $location.path('/topics/all');
                        } else {
                            UserData.set('', '');
                            $scope.messages.error = 'Wrong Email or Password!';
                            $scope.$apply();
                        }
                    })
                    .error(function() {
                        $scope.messages.error = 'Error Occurred!';
                        $scope.$apply();
                    });
            }
        });

        app.controller('RegisterCtrl', function($scope, $http, $location, UserData) {
            $scope.register = {};
            $scope.register.email = '';
            $scope.register.password = '';
            $scope.register.repeat_password = '';
            $scope.messages = {};
            $scope.messages.error = '';

            $scope.register.submit = function() {
                var email = $scope.register.email,
                    password = $scope.register.password,
                    repeat_password = $scope.register.repeat_password;

                if (
                    typeof email == 'undefined' || typeof password == 'undefined' || typeof repeat_password == 'undefined' ||
                        ! password || ! email || ! repeat_password || password != repeat_password) {

                    $scope.messages.error = 'Incorrect Email';

                    if (!repeat_password || !password || repeat_password != password) {
                        $scope.messages.error = 'Incorrect Password!';
                        $scope.register.password = '';
                        $scope.register.repeat_password = '';
                    }

                    return false;
                }

                var $params = $.param({password: $scope.register.password, repeat_password: $scope.register.repeat_password, email: $scope.register.email});
                $http({
                    method: 'POST',
                    url: api_url + 'admin/register',
                    data: $params,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                    .success(function(result) {
                        // the result is generated and stored in the database, it will be loaded from the next page
                        if (result['error'] == 0) {
                            UserData.set(result['token'], $scope.register.email);
                            $location.path('/topic/panel');
                        } else {
                            if (result['error'] == 1) {
                                $.each(result['result'], function(inx, error) {
                                    if (error['type'] == 'email') {
                                        $scope.messages.error = 'Incorrect Email!';
                                        $scope.register.email = '';
                                    } else if (error['type'] == 'password') {
                                        $scope.messages.error = 'Incorrect Password!';
                                        $scope.register.password = '';
                                        $scope.register.repeat_password = '';
                                    }
                                });
                            } else if(result['error'] == 1) {
                                $scope.messages.error = result['result'];
                            }

                            UserData.set('', '');
                        }
                    })
                    .error(function() {
                        $scope.messages.error = 'Error Occurred!';
                    });
            }
        });

        app.controller('TopicAddCtrl', function($scope, $routeParams, $http, $location, UserData) {

            if (!UserData.validate()) {
                $location.path('login');
                return;
            }

            // sections visibility
            $scope.section = {}
            $scope.section.main = true;
            $scope.section.categories = true;
            $scope.section.classes = true;
            $scope.section.question = true;
            $scope.section.step_percents = 10;
            $scope.section.main_form = {};
            $scope.section.main_form.message = '';
            $scope.section.main_form.error_name = false;
            $scope.section.main_form.error_description = false;
            $scope.section.main_form.error_image = false;

            $scope.section.class_form = {};
            $scope.section.class_form.message = '';
            $scope.section.class_form.error_name = false;
            $scope.section.class_form.error_description = false;
            $scope.section.class_form.error_image = false;

            $scope.section.answer_form = {};
            $scope.section.answer_form.message = '';
            $scope.section.answer_form.error_text = false;
            $scope.section.answer_form.error_value = false;
            $scope.section.answer_form.error_order = false;

            $scope.section.question_form = {};
            $scope.section.question_form.message = '';
            $scope.section.question_form.error_name = false;
            $scope.section.question_form.error_category = false;
            $scope.section.question_form.error_order = false;

            $scope.section.category_form = {}
            $scope.section.category_form.message = '';
            $scope.sections_array = ['main', 'categories', 'classes', 'question'];
            $.each($scope.sections_array, function(inx, value) {
                $scope.section[value] = false;
            });
            $scope.section['main'] = true;
            $('.navigation li.main').addClass('active');

            $scope.section.change = function(key, $form) {
                $scope.section.main_form.message = '';
                $scope.section.category_form.message = '';

                if (typeof $form != 'undefined') {
                    if ($form.$invalid) {
                        if (key == 'categories') {
                            $scope.section.main_form.message = 'Please, fill all incorrect fields!';
                            if ($form.name.$invalid) {
                                $scope.section.main_form.error_name = true;
                            } else {
                                $scope.section.main_form.error_name = false;
                            }
                            if ($form.description.$invalid) {
                                $scope.section.main_form.error_description = true;
                            } else {
                                $scope.section.main_form.error_description = false;
                            }
                            if ($form.image.$invalid) {
                                $scope.section.main_form.error_image = true;
                            } else {
                                $scope.section.main_form.error_image = false;
                            }
                        }
                        $scope.$apply();
                        return true;
                    }

                    if (key == 'classes') {
                        if (typeof $scope.measure.items == 'undefined' || $scope.measure.items.length < 1) {
                            $scope.section.category_form.message = 'Please, insert categories!';
                            $scope.$apply();
                            return true;
                        }
                    }

                     if (key == 'question') {
                         if (typeof $scope.classes.items == 'undefined' || $scope.classes.items.length < 1) {
                            $scope.section.class_form.message = 'Please, insert classes!';
                            $scope.$apply();
                            return true;
                         }
                     }
                }


                $.each($scope.sections_array, function(inx, value) {
                    $scope.section[value] = false;
                });
                $('.navigation li').removeClass('active');
                $scope.section[key] = true;
                $('.navigation li.' + key).addClass('active');

                if (key == 'main') {
                    $scope.section.step_percents = 10;
                } else if (key == 'categories') {
                    $scope.section.step_percents = 40;
                } else if (key == 'classes') {
                    $scope.section.step_percents = 70;
                } else if (key == 'question') {
                    $scope.section.step_percents = 100;
                } else {
                    $scope.section.step_percents = 0;
                }


            }

            // Topic Data
            $scope.topic = {};
            $scope.topic.name = '';
            $scope.topic.description = '';
            $scope.topic.image = '';


            $scope.topic.setImage = function(response) {
                if (response) {
                    var result = JSON.parse(response);
                    if (result['error'] == 0) {
                        $scope.topic.image = (result['url']);
                    } else {
                        alert(result['message']);
                    }
                }
            }

            // Class Data
            $scope.classes = {};
            $scope.classes.items = [];
            $scope.classes.name = '';
            $scope.classes.description = '';
            $scope.classes.image = '';
            $scope.classes.category_values = {};

            $scope.classes.setImage = function(response) {
                if (response) {
                    var result = JSON.parse(response);
                    if (result['error'] == 0) {
                        $scope.classes.image = (result['url']);
                    } else {
                        alert(result['message']);
                    }
                }
            }

            $scope.classes.insert = function($form) {
                $scope.section.class_form.message = '';

                if (($scope.classes.name && $scope.classes.description && $scope.classes.image && $scope.classes.category_values && $scope.measure.items.length > 0) && !$form.$invalid) {
                    $scope.classes.items.push(new objects.TopicClass($scope.classes.name, $scope.classes.description, $scope.classes.image, $scope.classes.category_values));

                    $scope.classes.name = '';
                    $scope.classes.description = '';
                    $scope.classes.image = '';
                    $scope.classes.category_values = {};
                } else {
                    $scope.section.class_form.message = 'Please, fill all class fields!';
                    if ($form.$invalid) {
                        if ($form.name.$invalid) {
                            $scope.section.class_form.error_name = true;
                        } else {
                            $scope.section.class_form.error_name = false;
                        }
                        if ($form.description.$invalid) {
                            $scope.section.class_form.error_description = true;
                        } else {
                            $scope.section.class_form.error_description = false;
                        }
                        if ($form.image.$invalid) {
                            $scope.section.class_form.error_image = true;
                        } else {
                            $scope.section.class_form.error_image = false;
                        }

                        $scope.$apply();
                        return true;
                    }
                }
            }

            $scope.classes.remove = function(key) {
                if (typeof $scope.classes.items[key] != 'undefined') {
                    $scope.classes.items.splice(key, 1);
                }
            }

            // Measure Data
            $scope.measure = {};
            $scope.measure.items = [];
            $scope.measure.dababase_category = '';
            $scope.measure.database = [];

            $http({
                method: 'GET',
                url: api_url + '/categories/get/all?token=' + UserData.token,
                data: {},
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(result) {
                if (typeof result['error'] != 'undefined' && result['error'] == 0) {
                    $scope.measure.database = result['data'];
                } else {
                }
            }).error(function() {
            });

            $scope.measure.name = '';

            $scope.measure.insertNew = function(is_new) {
                $scope.section.category_form.message = '';
                if (is_new) {
                    if ($scope.measure.name) {
                        $scope.measure.items.push(new objects.TopicMeasure(0, $scope.measure.name));
                        $scope.measure.name = '';
                    } else {
                        $scope.section.category_form.message = 'Please, fill a name for the category!!';
                    }
                } else {
                    if ($scope.measure.dababase_category) {
                        var name = $('.measure-select option[value="' + $scope.measure.dababase_category + '"]').text();
                        // check element exists
                        var exists = false;
                        $.each($scope.measure.items, function(inx, value) {
                            if (value.id == $scope.measure.dababase_category) {
                                exists = true;
                                return false;
                            }
                        });
                        if (!exists) {
                            $scope.measure.items.push(new objects.TopicMeasure($scope.measure.dababase_category, name));
                        }
                    } else {
                        $scope.section.category_form.message = 'Please, select a correct category from the list!';
                    }
                }
            }

            $scope.measure.remove = function(key) {
                if (typeof $scope.measure.items[key] != 'undefined') {
                    $scope.measure.items.splice(key, 1);

                    // remove the category from the classes
                    $.each($scope.classes.items, function(inx, cls) {
                        $.each(cls.values, function(key_v, value) {
                            if (key == key_v) {
                                delete $scope.classes.items[inx].values[key_v];
                            }
                        });
                    });
                    console.log($scope.classes.items);
                    // remove the questions containing the category
                    $.each($scope.questions, function(inx, question) {
                        if (question.category_id == key) {
                            $scope.questions.splice(inx, 1);
                        }
                    });
                }
            }

            // objects.Questions Data
            $scope.question = {};
            $scope.questions = [];
            $scope.question.name = '';
            $scope.question.order = '';
            $scope.question.category = '';
            $scope.question.answers = [];

            $scope.answer = {};
            $scope.answer.name = '';
            $scope.answer.category_value = '';
            $scope.answer.order = '';

            $scope.answer.add = function($form) {
                $scope.section.answer_form.message = '';
                if (!$form.$invalid) {
                    $scope.question.answers.push(new objects.QuestionAnswer($scope.answer.name, $scope.answer.category_value, $scope.answer.order));

                    $scope.answer.name = '';
                    $scope.answer.category_value = '';
                    $scope.answer.order = '';
                } else {
                    $scope.section.answer_form.message = 'Please, fill all Answer fields!';
                    if ($form.$invalid) {
                        if ($form.text.$invalid) {
                            $scope.section.answer_form.error_text = true;
                        } else {
                            $scope.section.answer_form.error_text = false;
                        }
                        if ($form.value.$invalid) {
                            $scope.section.answer_form.error_value = true;
                        } else {
                            $scope.section.answer_form.error_value = false;
                        }
                        if ($form.order.$invalid) {
                            $scope.section.answer_form.error_order = true;
                        } else {
                            $scope.section.answer_form.error_order = false;
                        }

                        $scope.$apply();
                        return true;
                    }
                }
            }

            $scope.question.add = function() {
                $scope.section.question_form.message = '';
                if ($scope.question.name && $scope.question.category && $scope.question.answers && $scope.question.answers.length > 0) {
                    var category_name = $('.measure-select-question option[value="' + $scope.question.category + '"]').text();
                    $scope.questions.push(new objects.Question($scope.question.name, $scope.question.category, category_name, $scope.question.answers, $scope.question.order));

                    $scope.question.name = '';
                    $scope.question.order = '';
                    $scope.question.category = '';
                    $scope.question.answers = [];
                    $scope.answer.name = '';
                    $scope.answer.category_value = '';
                    $scope.answer.order = '';
                } else {
                    $scope.section.question_form.message = "Please, fill all question's fields!";
                    if (!$scope.question.name) {
                        $scope.section.error_name = true;
                    } else {
                        $scope.section.error_name = false;
                    }

                    if (!$scope.question.category) {
                        $scope.section.error_category = true;
                    } else {
                        $scope.section.error_category = false;
                    }

                    if (!$scope.question.order) {
                        $scope.section.error_order = true;
                    } else {
                        $scope.section.error_order = false;
                    }
                }
            }

            $scope.question.answer = {};
            $scope.question.answer.remove = function(key) {
                if (typeof $scope.question.answers[key] != 'undefined') {
                    $scope.question.answers.splice(key, 1);
                }
            }

            $scope.question.remove = function(key) {
                if (typeof $scope.questions[key] != 'undefined') {
                    $scope.questions.splice(key, 1);
                }
            }
            $scope.topic.errors = '';

            // Add Topic
            $scope.addTopic = function() {

                if ($scope.questions.length < 1) {
                    $scope.section.question_form.message = 'Please, insert questions and answers!';
                }

                var data = {
                    topic: {
                        name: $scope.topic.name,
                        description: $scope.topic.description,
                        image: $scope.topic.image
                    },
                    categories: $scope.measure.items,
                    classes: $scope.classes.items,
                    questions: $scope.questions
                }

                $scope.topic.errors = '';

                $('#errors').html('');
                console.log(JSON.stringify(data));
                console.log(data);
                // send http request with all data, validation in the php part!
                $http({
                    method: 'POST',
                    url: api_url + '/topic/set',
                    data: $.param({token: UserData.token, data: data}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(result) {
                    if (typeof result['error'] != 'undefined' && result['error'] == 0) {
                        $location.path('topics/all');
                    } else {
                        var error_message = '';
                        $.each(result['data'], function(inx, value) {
                            error_message += 'You have errors in section ' + inx.charAt(0).toUpperCase() + inx.slice(1) + '<br />';
                        });

                        $scope.section.question_form.message = error_message;
                    }
                }).error(function() {
                    $scope.section.question_form.message = $scope.topic.errors;
                });
            }
        });

        app.controller('TopicsAllCtrl', function($scope, $http, $location, UserData, AppUrl) {
            if (!UserData.validate()) {
                $location.path('login');
                return;
            }

            $scope.quiz_url = 'http://pullthestrings.me/quiz/#/login/';
            $scope.admin_url = AppUrl;
            $scope.topics = [];
            $scope.topic = {};
            $http({
                method: 'GET',
                url: api_url + '/topics/user/all?token=' + UserData.token,
                data: {},
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).success(function(result) {
                if (typeof result['error'] != 'undefined' && result['error'] == 0) {
                    $scope.topics = result['data'];
                } else {
                    alert('NO topics');
                }
            }).error(function() {
            });

            $scope.topic.changeVisibility = function(id, active, key) {
                $http({
                    method: 'POST',
                    url: api_url + '/topic/visibility',
                    data: $.param({token: UserData.token, id: id, active: active}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                }).success(function(result) {
                    if (typeof result['error'] != 'undefined' && result['error'] == 0) {
                        if ($scope.topics[key] != 'undefined') {
                            $scope.topics[key]['visibility'] = active;
                        }
                    } else {
                        alert('Error');
                    }
                }).error(function() {
                });
            }

        });

        app.controller('TopicsResultsCtrl', function($scope, $http, $location, $routeParams, UserData, TopicResults, AppUrl) {
            var topic_id = parseInt($routeParams.topic_id);
            $scope.result = {};
            $scope.result.topic_id = topic_id;
            $scope.result.items = [];
            $scope.result.data_cluster = [];
            $scope.quiz_url = AppUrl;
            $scope.cluster = {
                count: 5,
                distance: 'euclidean'
            };
            $scope.panels = {
                results: 1,
                clusters: 0
            }


            if (typeof topic_id == 'undefined' || !topic_id) {
                $location.path('/topic/panel');
            }


            TopicResults.get(topic_id).then(function() {
                $scope.result.items = TopicResults.items;
                $scope.result.categories = TopicResults.categories;
                $scope.cluster.computeCluster($scope.cluster.count, $scope.cluster.distnace);
                $scope.$apply();
            });

            $scope.cluster.computeCluster = function(clusters_count, type) {
                var data = [];

                clusters_count = typeof clusters_count == 'undefined' || ! clusters_count ? 3 : clusters_count;
                type = typeof type == 'undefined' || ! type ? 'euclidean'  : type;

                // order answers by categories... use the centroids for a defined centroid clustering - TO DO!!!
                var index = 0;
                var comparison = {};
                $.each($scope.result.items, function(inx, user) {
                    data[index] = data[index] || [];
                    $.each($scope.result.categories, function(i, v) {
                        data[index][v.category_id] = [];
                    });

                    $.each(user.answers, function(inx, answer) {
                        data[index][answer.category_id] = data[index][answer.category_id] || [];
                        data[index][answer.category_id].push(parseFloat(answer.value));
                    });

                    var new_array = [];
                    for (var v in data[index]) {
                        if (typeof v != 'undefined') {
                            // find mean:
                            var values = data[index][v];
                            var sum = 0;
                            var length = 0;
                            $.each(values, function (i, v) {
                                sum += v;
                                length++;
                            });

                            if (length > 0) {
                                data[index][v] = sum / length;
                            } else {
                                data[index][v] = 0;
                            }

                            if (!data[index][v]) {
                                data[index][v] = 0;
                            }

                            new_array.push(data[index][v]);
                        }
                    }
                    data[index] = {vector: new_array, user: user};
                    //comparison[index] = user;
                    index++;
                });

                $scope.result.data_cluster = clusterfck.kmeans(data, clusters_count, type);

                console.log($scope.result.data_cluster);


                $scope.$apply();
                //$scope.result.data_cluster = clusterfck.kmeans(data, clusters_count);
            }
        });

        app.controller('TopicsUserResultCtrl', function($scope, $http, $location, $routeParams, UserData, TopicResults) {
            var user_id = parseInt($routeParams.user_id);
            var topic_id = parseInt($routeParams.topic_id);
            $scope.result = {};
            $scope.result.user = {};
            $scope.result.topic_id = topic_id;
            $scope.result.user_id = user_id;
            $scope.result.chart_data = [];
            $scope.result.mean_values = [];

            if (typeof user_id == 'undefined' || !user_id) {
                $location.path('/topic/panel');
            }


            function findMean(data, categories) {
                var temp_vector = [];
                var final_vector = [];

                $.each(data, function(inx, user) {
                    temp_vector = computeUserVector(user.answers, categories);
                    for (var category_id in temp_vector) {
                        final_vector[category_id] = final_vector[category_id] || [];
                        final_vector[category_id].push(temp_vector[category_id]);
                    }
                });

                for (var inx in final_vector) {
                    var cat_values = final_vector[inx];
                    var sum = 0;
                    var length = 0;
                    $.each(cat_values, function (i, v) {
                        sum += v.data;
                        length++;
                    });

                    if (length > 0) {
                        final_vector[inx] = sum / length;
                        final_vector[inx] = final_vector[inx].toFixed(2);
                    } else {
                        final_vector[inx] = 0;
                    }

                    if (!final_vector[inx]) {
                        final_vector[inx] = 0;
                    }
                }

                return final_vector;
            }


            function computeUserVector(user_answers, categories) {

                var data = {};
                var labels = {};
                var result = [];

                $.each(categories, function(i, v) {
                    data[v.category_id] = [];
                    labels[v.category_id] = v.name;
                });

                $.each(user_answers, function(inx, answer) {
                    data[answer.category_id] = data[answer.category_id] || [];
                    data[answer.category_id].push(parseFloat(answer.value));
                });

                for (var v in data) {
                    if (typeof v != 'undefined') {
                        // find mean:
                        var values = data[v];
                        var sum = 0;
                        var length = 0;
                        $.each(values, function (i, v) {
                            sum += v;
                            length++;
                        });

                        if (length > 0) {
                            data[v] = sum / length;
                        } else {
                            data[v] = 0;
                        }

                        if (!data[v]) {
                            data[v] = 0;
                        }

                        result.push({
                            data: data[v].toFixed(2) * 100,
                            label: (labels[v] || v)
                        });
                    }
                }

                return result;
            }

            function setCharts(user, categories, all_users) {
                // set pie chart
                /*var pie_chart_data = [
                    { label: "Internet Explorer",  data: 12},
                    { label: "Mobile",  data: 27},
                    { label: "Safari",  data: 85},
                    { label: "Opera",  data: 64},
                    { label: "Firefox",  data: 90},
                    { label: "Chrome",  data: 112}
                ];
                */
                $scope.result.mean_values = findMean(all_users, categories);

                var chart_data = computeUserVector(user.answers, categories);
                $scope.result.chart_data = chart_data;

                if($("#user_piechart").length)
                {
                    $.plot($("#user_piechart"), chart_data,
                        {
                            series: {
                                pie: {
                                    show: true
                                }
                            },
                            grid: {
                                hoverable: true,
                                clickable: true
                            },
                            legend: {
                                show: false
                            },
                            colors: ["#FA5833", "#2FABE9", "#FABB3D", "#78CD51"]
                        });

                    function pieHover(event, pos, obj)
                    {
                        if (!obj)
                            return;
                        percent = parseFloat(obj.series.percent).toFixed(2);
                        $("#hover").html('<span style="font-weight: bold; color: '+obj.series.color+'">'+obj.series.label+' ('+percent+'%)</span>');
                    }
                    $("#piechart").bind("plothover", pieHover);
                }
            }

            $scope.result.getRandomColor = function() {
                var colors = ['rgb(222, 185, 72)', 'rgb(87, 142, 190)', 'rgb(134, 116, 166)', 'rgb(67, 181, 173)'];

                return colors[Math.floor(Math.random() * colors.length)];
            }

            if (TopicResults.items.length < 1 || TopicResults.categories.length < 1) {
                TopicResults.get(topic_id).then(function() {
                    $scope.result.user = TopicResults.findUser(topic_id, user_id);
                    setCharts($scope.result.user, TopicResults.categories, TopicResults.items);
                    $scope.$apply();
                });
            } else {
                $scope.result.user = TopicResults.findUser(topic_id, user_id);
                setCharts($scope.result.user, TopicResults.categories, TopicResults.items);
                $scope.$apply();
            }
        });

        app.controller('TopicsPanelCtrl', function($scope, $routeParams, $http, $location, UserData) {

            if (!UserData.validate()) {
                $location.path('login');
                return;
            }

            $scope.topic = {};

            $scope.topic.add = function() {
                $location.path('topic/add');
            }

            $scope.topic.view_all = function() {
                $location.path('topics/all');
            }
        });

    });