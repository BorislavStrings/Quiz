define(function() {

    var app = angular.module('app');
    app.filter('unsafe', function ($sce) {
        return $sce.trustAsHtml;
    });

    app.filter('replaceSpaces', function(name) {
        if (typeof name != 'undefined' && name) {
            return name.replace(/\s/g, "-");
        }

        return '';
    })

});