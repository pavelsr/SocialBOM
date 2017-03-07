angular.module('main')

.filter('cost_extractor', function() {
    return function(items) {
        var res = [];
        var fields = ['cost', 'currency'];
        for (var i = 0; i < items.length; i++) {
            var o = {};
            for (var j = 0; j < fields.length; j++) {
                if (items[i].hasOwnProperty(fields[j])) {
                    o[fields[j]] = items[i][fields[j]];
                }
            }
            res.push(o);
        }
        return res;
    }
})

.filter('cost_extractor2', function() {
    return function(items) {
        var res = [];
        var fields = ['max_cost', 'min_cost', 'qty'];
        for (var i = 0; i < items.length; i++) {
            var o = {};
            for (var j = 0; j < fields.length; j++) {
                if (items[i].hasOwnProperty(fields[j])) {
                    o[fields[j]] = items[i][fields[j]];
                }
            }
            res.push(o);
        }
        return res;
    }
})

.filter('convert_to_one_currency', function() {
    return function(arr, rates, to_curr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].currency != to_curr) {
                arr[i].cost = arr[i].cost * rates[arr[i].currency];
                arr[i].currency = to_curr;
            } else {
                arr[i].cost = arr[i].cost * 1.00;
            }
        }
        return arr;
    }
})

.filter('min_cost', function() {
    return function(arr) {
    	var res = [];
        for (var i = 0; i < arr.length; i++) {
            res.push(arr[i].cost);
        }
        return Math.min.apply(Math, res).toFixed(2);
    }
})

.filter('max_cost', function() {
    return function(arr) {
    	var res = [];
        for (var i = 0; i < arr.length; i++) {
            res.push(arr[i].cost);
        }
        return Math.max.apply(Math, res).toFixed(2);
    }
})


.filter('filter_min', function() {
    return function(arr) {
    	var total =  0;
    	if (arr) {
	        for (var i = 0; i < arr.length; i++) {
	        	if (!(isNaN(arr[i].min_cost)) && !(isNaN(arr[i].qty))) {
	            	total = +total + +arr[i].min_cost*arr[i].qty;
	        	}
	        }
	    }
        return total;
    }
})


.filter('filter_max', function() {
    return function(arr) {
    	var total =  0;
    	if (arr) {
	        for (var i = 0; i < arr.length; i++) {
	        	if (!(isNaN(arr[i].max_cost)) && !(isNaN(arr[i].qty))) {
	            	total = +total + +arr[i].max_cost*arr[i].qty;
	        	}
	        }
	    }
        return total;
    }
})
