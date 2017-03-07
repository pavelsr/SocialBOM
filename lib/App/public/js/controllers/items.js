angular.module('main')

.controller('ItemsController', function($scope, $log, $filter, Items, SharedFactory) {
    
    var resourceName = 'Item';  // used as name for new item
    var resource = Items;        // use for all CRUD operations
    var controllerAsName = 'i';

    var customButtonsHTML = '<button type="button" class="btn-small" ng-click="grid.appScope.'+controllerAsName+'.show_item_features(row.entity)"><span class="glyphicon glyphicon-shopping-cart"></button>';
    
    $scope.factory = SharedFactory.getFactoryValues();   //$scope.factory = SharedFactory.getFactoryValues();  // factory = data
    $scope.msg = {};  // debug message for last cell edited

    var columnDefsArray = [{
            displayName: 'Имя',
            name: 'name',
            enableCellEdit: true,
            width: '50%'
        }, {
            displayName: 'Категория',
            name: 'category',
            enableCellEdit: true,
            width: '10%',
            editableCellTemplate: 'ui-grid/dropdownEditor',
            editDropdownValueLabel: 'subsystem',
            editDropdownOptionsArray: [ { id: 'cat1', subsystem: 'cat1' }, { id: 'cat2', subsystem: 'cat2' }]
        }, {
            displayName: 'Подсистемы',
            name: 'subsystem',
            enableCellEdit: false,
            width: '10%',
        }, {
            displayName: 'Кол-во',
            name: 'qty',
            enableCellEdit: true,
            width: '10%'
        }, {
            width: '20%',
            name: 'actions',
            displayName: 'Действия',
            enableCellEdit: false,
            cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.'+controllerAsName+'.del(row.entity)"><span class="glyphicon glyphicon-remove"></span></button></button>'+customButtonsHTML
        }];

    $scope.grid_obj = {
        columnDefs: columnDefsArray
    };

    $scope.$watch('factory.current_bom', function(newValue, oldValue) {
        if ($scope.factory.current_bom) {
            resource.query({ 'bom_id' : $scope.factory.current_bom._id.$oid }, function (resp) {
                $scope.grid_obj.data = resp;
                console.log('ok, google', $scope.grid_obj.data);
                $scope.bom_min_max_costs = $filter('cost_extractor2')($scope.grid_obj.data);
            });
        }
    });


    // custom functions

    this.update_view = function() {
        // after new, del or update 
        var extra_json = { 'bom_id' : $scope.factory.current_bom._id.$oid };   // when new and query - Cannot read property '$oid' of undefined
        $scope.grid_obj.data = resource.query(extra_json);
    };

    this.show_item_features = function(obj) {       // -> show items that contains selected BOM
        var id = obj._id.$oid;                      // id of current item
        $log.info("show_item_features() Selected Item : " + id);
        SharedFactory.setFactoryValue('current_item', obj);
        $scope.curr_item_debug = obj;
     }

    this.show_all_items = function() {
        // after new, del or update 
        this.grid_obj.data = resource.query();
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
    }

    this.new = function() {
        var o = this;
        $log.info("New item in bom : "+$scope.factory.current_bom.name );
        var n = $scope.grid_obj.data.length + 1;
        var extra_json = { 'bom_id' : $scope.factory.current_bom._id.$oid };   // when new and query - Cannot read property '$oid' of undefined
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
            delete rowEntity._id;  // можно также удалить все кроме [field]
            rowEntity.$update({ 'id': id }, 
                function(resp, headers){
                 $scope.grid_obj.data = resource.query({ 'bom_id' : $scope.factory.current_bom._id.$oid });
                },
                function(err){
                console.log(err);
            });
            // here must be update_view()
        });
    };

    // other private methods

});