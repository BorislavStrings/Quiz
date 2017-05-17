require.config({
    // alias libraries paths
    paths: {
        'angular': '../lib/angular',
        'jquery': '../lib/jquery-1.11.3.min',
        'jquery_ui': '../lib/jquery-ui.min',
        'objects': 'objects',
        'angular_animate': '../lib/angular-animate.min',
        'angular_route': '../lib/angular-route.min',
        'app': 'app',
        'controllers': 'controllers',
        'directives': 'directives',
        'filters': 'filters',
        'services': 'services',
        'facebook': '../lib/facebook',
        'highcharts': '../lib/highcharts',
        'jquery_jscrollpane': '../lib/jquery.jscrollpane.min',
        'facebook_utils': '../lib/facebookUtils.min'
    },

    shim: {
        'app': {
            exports: 'app',
           deps: [
               'angular', 'angular_route', 'jquery_ui', 'objects',
               'angular_animate', 'facebook',
               'highcharts', 'jquery_jscrollpane', 'facebook_utils'
           ]
        },
        'controllers': {
            deps: ['app']
        },
        'objects': {},
        'directives': {
            deps: ['angular', 'app']
        },
        'filters': {
            deps: ['angular', 'app']
        },
        'services': {
            deps: ['angular', 'app']
        },
        'angular': {
            exports: 'angular'
        },
        'angular_animate': {
            exports: 'angular_animate',
            deps: ['angular']
        },
        'angular_route': {
            exports: 'angular_route',
            deps: ['angular']
        },
        'jquery': {
            exports: '$'
        },
        'jquery_ui': {
            exports: 'jquery_ui',
            deps: ['jquery']
        },
        'jquery_jscrollpane': {
            deps: ['jquery']
        },
        'highcharts': {
            deps: ['jquery']
        },
        'facebook': {
            deps: ['facebook_utils']
        },
        'facebook_utils': {
            deps: ['angular']
        }
    }
});

require(['app'], function() {
    //angular.bootstrap('document', ['app']);
});