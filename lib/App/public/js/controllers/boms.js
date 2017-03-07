angular.module('main')

.controller('BomsController', function($scope, $log, Boms, SharedFactory) {
    
    var resourceName = 'BOM';  // used as name for new item
    var resource = Boms;        // use for all CRUD operations
    var controllerAsName = 'b';

    var customButtonsHTML = '<button type="button" class="btn-small" ng-click="grid.appScope.'+controllerAsName+'.show_bom_items(row.entity)"><span class="glyphicon glyphicon-zoom-in"></span></button>';
    
    $scope.factory = SharedFactory.getFactoryValues();   //$scope.factory = SharedFactory.getFactoryValues();  // factory = data
    $scope.msg = {};  // debug message for last cell edited
    
    var columnDefsArray = [{
            displayName: 'Название',
            name: 'name',
            enableCellEdit: true,
            width: '20%'
        }, {
            displayName: 'Описание',
            name: 'desc',
            enableCellEdit: true,
            width: '65%'
        }, {
            width: '20%',
            name: 'actions',
            displayName: 'Действия',
            enableCellEdit: false,
            cellTemplate: '<button type="button" class="btn-small" ng-click="grid.appScope.'+controllerAsName+'.del(row.entity)"><span class="glyphicon glyphicon-remove"></span></button>'+customButtonsHTML
        }];
    // custom functions

    $scope.grid_obj = {
        columnDefs: columnDefsArray,
        data : resource.query()
    };

    this.show_bom_items = function(obj) { // -> show items that contains selected BOM
        // specified field with array of related items of another object
        var id = obj._id.$oid; // id of current BOM
        $log.info("show_bom() Selected BOM : " + id);
        SharedFactory.setFactoryValue('current_bom', obj);
        // just for view data binding
     };

    this.update_view = function () {
        console.log("executed");
        // after new, del or update 
        $scope.grid_obj.data = resource.query();
        console.log("executed2");
    };

    //this.update_view();
    // CRUD operations

    this.del = function(obj) {
        // delete BOM
        var o = this;
        $log.info(obj);
        obj.$remove({
            id: obj._id.$oid
        },  function(successResult) {
        // do something on success
            o.update_view();
        }, function(errorResult) {
            $log.error("$http error:", errorResult);
        // do something on error
        
        });
    };

    this.new = function() {
        var o = this;
        var n = $scope.grid_obj.data.length + 1;
        var newItem = new resource({data: {name: resourceName+' #'+n} });
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
    };

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
                 o.update_view();
                },
                function(err){
                console.log(err);
            });
            //$scope.grid_obj.data = resource.query();
        });
    };

    // other private methods



});