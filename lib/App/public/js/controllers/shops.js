angular.module('main')

.controller('ShopsController', function($scope, $log, $filter, $http, Shops, Items, SharedFactory) {
    
    var resourceName = 'Shop';  // used as name for new item
    var resource = Shops;        // use for all CRUD operations
    var controllerAsName = 's';

    var customButtonsHTML = '';
    
    $scope.factory = SharedFactory.getFactoryValues();   //$scope.factory = SharedFactory.getFactoryValues();  // factory = data
    $scope.msg = {};  // debug message for last cell edited

    var columnDefsArray = [{
            displayName: 'Магазин',
            name: 'name',
            enableCellEdit: true,
            width: '20%',
        }, {
            displayName: 'Ссылка на товар',
            name: 'link',
            enableCellEdit: true,
            width: '30%',
            cellTemplate: '<a href="{{row.entity.link}}" target="_blank">{{row.entity.link}}</a>',
        }, {
            displayName: 'Стоимость',
            name: 'cost',
            enableCellEdit: true,
            width: '15%',
        }, {
            displayName: 'Валюта',
            name: 'currency',
            enableCellEdit: true,
            width: '15%',
            editableCellTemplate: 'ui-grid/dropdownEditor',
            editDropdownValueLabel: 'currency',
            editDropdownOptionsArray: [ { id: 'RUB', currency: 'RUB' }, { id: 'USD', currency: 'USD'}, { id: 'EUR', currency: 'EUR'} ]
        }, {
            width: '20%',
            name: 'actions',
            displayName: '',
            enableCellEdit: false,
            cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.'+controllerAsName+'.del(row.entity)"><span class="glyphicon glyphicon-remove"></span></button>'+customButtonsHTML
        }];


    $scope.grid_obj = {
        columnDefs: columnDefsArray
    };

     $http.get('/rates').then(function (resp) {
        $scope.rates = resp.data;
    }, function (resp) { $
        log.error(resp)
    });

    $scope.$watch('factory.current_item', function(newValue, oldValue) {
        if ($scope.factory.current_item) {
            resource.query({ 'item_id' : $scope.factory.current_item._id.$oid }, function (resp) {
                $scope.grid_obj.data = resp;
                // update max and min cost of current item
                var rub_rates = $filter('convert_to_one_currency')($filter('cost_extractor')($scope.grid_obj.data), $scope.rates, 'RUB');
                SharedFactory.setFactoryValue('max_item_cost', $filter('max_cost')(rub_rates));
                SharedFactory.setFactoryValue('min_item_cost', $filter('min_cost')(rub_rates));
                $scope.factory.current_item.max_cost = $scope.factory.max_item_cost;
                $scope.factory.current_item.min_cost = $scope.factory.min_item_cost;
                $log.info("CuRRR", $scope.factory.current_item);
                var id = $scope.factory.current_item._id.$oid;
                delete $scope.factory.current_item._id;
                $scope.factory.current_item.$update({ 'id': id }, { "max_cost" : $scope.factory.max_item_cost, "max_cost": $scope.factory.min_item_cost });


                //Items.$update({ 'id': $scope.factory.current_item._id.$oid }, { "max_cost" : $scope.factory.max_item_cost, "max_cost": $scope.factory.min_item_cost });  // UDPATE request
            });
            //$scope.max_item_cost = $filter('cost_extractor')($scope.grid_obj.data);
            //$scope.min_item_cost = $filter('cost_extractor')($scope.grid_obj.data);
        }
    });

   
    // custom functions

    this.update_view = function() {
        $scope.grid_obj.data = resource.query({ 'item_id' : $scope.factory.current_item._id.$oid });
        // set new
    };
    
    // CRUD operations

    this.del = function(obj) {
        var o = this;
        // delete BOM
        $log.info(obj);
        var i_id = obj._id.$oid;
        obj.$remove({ id: obj._id.$oid  }, 
            function(successResult) {
                o.update_view();
            }, 
            function(errorResult) {
            $log.error("$http error:", errorResult);
            }); // Cannot read property '$oid' of undefined
        $log.info("Shop removed. Updating view")
       // this.update_view();
       $scope.grid_obj.data = resource.query({ 'item_id' : $scope.factory.current_item._id.$oid });
    }

    this.new = function() {
        var o = this;
        $log.info("New shop to item : "+$scope.factory.current_item.name );
        var n = $scope.grid_obj.data.length + 1;
        var extra_json = { 'item_id' : $scope.factory.current_item._id.$oid };   // when new and query - Cannot read property '$oid' of undefined
        var newItem = new resource({'data': {name: resourceName+' #'+n}, 'extra': extra_json });           /// !!!!
        newItem.$save(
            function(resp, headers){
              //success callback
              //console.log(resp);
              o.update_view();
            },
            function(err){
              // error callback
              console.log(err);
        });
    }

    $scope.grid_obj.onRegisterApi = function(gridApi) {
        // custom API functions
        $scope.gridApi = gridApi;
        gridApi.edit.on.afterCellEdit($scope, function(rowEntity, colDef, newValue, oldValue) {
            // rowEntity = instance of BOMs class
            $scope.msg.lastCellEdited = 'edited row id:' + rowEntity._id.$oid + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue;
            $scope.$apply();
            var field = colDef.name;
            var id = rowEntity._id.$oid;
            rowEntity[field] = newValue;
            delete rowEntity._id;                   // можно также удалить все кроме [field]
            rowEntity.$update({ 'id': id }, 
                function(resp, headers){
                 $scope.grid_obj.data = resource.query({ 'item_id' : $scope.factory.current_item._id.$oid });
                },
                function(err){
                console.log(err);
            });
            // here must be update_view()
        });
    };

    // other private methods

});