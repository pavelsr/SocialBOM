angular.module('main')

.directive("testDirective", function() {
	return {
		restrict: "E",
		termplateUrl: "/templates/test.html"
	};
});