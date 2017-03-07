angular.module('main')

.factory("Boms", function BomsFactory ($resource) {
    return $resource("/api/boms/:id", null, {
        'update': {
            method: 'PUT'
        }
    })
})

.factory("Items", function($resource) {
    return $resource("/api/items/:id", null, {
        'update': {
            method: 'PUT'
        },
        'query': {method: 'get', isArray: true, cancellable: true}
    })
})


.factory("Shops", function($resource) {
    return $resource("/api/shops/:id", null, {
        'update': {
            method: 'PUT'
        },
        'query': {method: 'get', isArray: true, cancellable: true}
    })
})



.factory("SharedFactory", function () {
    var data = {                // all variables by default. can be empty object
        current_bom : '',
        current_item: '',
        max_item_cost: '',
        min_item_cost: '',
    };
    return {
        getFactoryValues: function () {
            return data;
        },
        setFactoryValue: function (property, value) {
            data[property] = value;
        }
    }
});