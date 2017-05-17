define(function() {
    var app = angular.module('app', ['ngRoute', 'ngAnimate', 'flow', 'ui.bootstrap']);

    app.constant('ApiUrl','http://127.0.0.1/quiz_api/');
    app.constant('AppUrl','http://127.0.0.1/quiz/admin/#/');

    app.config(['$routeProvider', 'flowFactoryProvider', 'ApiUrl',
        function($routeProvider, flowFactoryProvider, ApiUrl) {
            $routeProvider.
                when('/login', {
                    templateUrl: 'views/login.html',
                    controller: 'LoginCtrl'
                }).
                when('/register', {
                    templateUrl: 'views/register.html',
                    controller: 'RegisterCtrl'
                }).
                when('/topic/panel', {
                    templateUrl: 'views/topics_panel.html',
                    controller: 'TopicsPanelCtrl'
                }).
                when('/topic/add/', {
                    templateUrl: 'views/topic_add.html',
                    controller: 'TopicAddCtrl'
                }).
                when('/topics/all/', {
                    templateUrl: 'views/topics_all.html',
                    controller: 'TopicsAllCtrl'
                }).
                when('/error/:number', {
                    templateUrl: 'views/error.html',
                    controller: 'ErrorCtrl'
                }).
                when('/topics/:topic_id/results', {
                    templateUrl: 'views/topics_results.html',
                    controller: 'TopicsResultsCtrl'
                }).
                when('/topic/:topic_id/user/:user_id/results', {
                    templateUrl: 'views/user_results.html',
                    controller: 'TopicsUserResultCtrl'
                }).
                otherwise({
                    redirectTo: 'login'
                });

            flowFactoryProvider.defaults = {
                target: ApiUrl + '/file/upload',
                permanentErrors: [404, 500, 501],
                maxChunkRetries: 1,
                chunkRetryInterval: 5000,
                simultaneousUploads: 4
            };
            // Can be used with different implementations of Flow.js
            // flowFactoryProvider.factory = fustyFlowFactory;
        }
    ]);

    require(['controllers', 'filters', 'services', 'directives', 'objects', 'clusterfck'], function() {
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