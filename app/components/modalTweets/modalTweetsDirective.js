/*eslint angular/controller-as: 0*/
/*eslint angular/di: [2,"array"]*/
/*eslint max-len: [2,90]*/
(function() {
    angular
    .module('search_modaltweets_component', [])
    .directive('modalTweets', ['Map', 'queryService',
        'HeatMapSourceGenerator', 'Normalize',
        function(Map, queryService, HeatMapSourceGenerator, Normalize) {
            return {
                link: modalLink,
                templateUrl: 'components/modalTweets/modalTweets.tpl.html',
                restrict: 'EA',
                scope: {}
            };

            function modalLink(scope) {
                var vm = scope;
                var MapService = Map;
                vm.closestTweets = [];
                vm.coordinate = [];

                vm.$on('mapReady', function () {
                    MapService.getMap().on('click', function(evt){
                        vm.coordinate = ol.proj.toLonLat(evt.coordinate);
                        var extent = createBboxFromCoordinatePoint(vm.coordinate);
                        var params = {
                            'q.geo': extent,
                            'd.docs.limit': 50,
                            'd.docs.sort': 'distance'
                        };
                        HeatMapSourceGenerator.simpleSearch(params, function (res) {
                            if (res.data && angular.isArray(res.data['d.docs'])) {
                                vm.closestTweets = res.data['d.docs'];
                                angular.element('#closesttweets').modal('show');
                            }
                        });
                    });
                });

                function createBboxFromCoordinatePoint(centerPoint) {
                    var extentGeo = MapService.getCurrentExtent().geo;
                    var deltaX = Math.abs(extentGeo.maxX - extentGeo.minX);
                    var deltaY = Math.abs(extentGeo.maxY - extentGeo.minY);

                    var newExtent = {
                        minX: centerPoint[1] - deltaX/2,
                        minY: centerPoint[0] - deltaY/2,
                        maxX: centerPoint[1] + deltaX/2,
                        maxY: centerPoint[0] + deltaY/2
                    };

                    var normalizedExtent = Normalize.normalizeExtent([
                        newExtent.minX, newExtent.minY, newExtent.maxX, newExtent.maxY
                    ]);
                    return queryService.createQueryFromExtent(
                        MapService.createExtentFromNormalize(normalizedExtent)
                    );
                }
            }
        }]);
})();