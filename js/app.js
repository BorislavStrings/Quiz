define(function() {
    var app = angular.module('app', ['ngRoute', 'ngAnimate']);

    app.constant('ApiUrl','http://127.0.0.1/quiz_api/');
    app.constant('AppUrl','http://127.0.0.1/quiz/');

    app.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/', {
                    templateUrl: 'views/select_quiz.html',
                    controller: 'SelectQuizCtrl'
                }).
                when('/home/quiz/:topic', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                }).
                when('/questions', {
                    templateUrl: 'views/questions.html',
                    controller: 'QuestionsCtrl'
                }).
                when('/error/:number', {
                    templateUrl: 'views/error.html',
                    controller: 'ErrorCtrl'
                }).
                when('/results/:token', {
                    templateUrl: 'views/results.html',
                    controller: 'ResultsCtrl'
                }).
                when('/select/quiz', {
                    templateUrl: 'views/select_quiz.html',
                    controller: 'SelectQuizCtrl'
                }).
                otherwise({
                    redirectTo: 'error/1'
                });
        }
    ]);

    require(['controllers', 'filters', 'services', 'directives', 'objects'], function() {
        angular.bootstrap(document, ['app']);
    });

    /*
    app.run(['$rootScope', '$window', 'FacebookAPI',
        function($rootScope, $window, $FacebookAPI) {
            $rootScope.user = {};
        }
    ]);
    */

});