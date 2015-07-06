//Draw points
function drawTrain() {
    require([
        "esri/map",
        "esri/symbols/CartographicLineSymbol",
        "esri/Color",
        "esri/graphic",
        "esri/geometry/Point",
        "esri/SpatialReference",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/InfoTemplate"
    ], function (Map,
                 CartographicLineSymbol,
                 Color,
                 Graphic,
                 Point,
                 SpatialReference,
                 SimpleMarkerSymbol,
                 InfoTemplate) {
        var points = [];

        //Here is a hack to be sure to load points on startup and only refreshing for each call after
        map.on('load', function() {
            getImpactedTrains();
        });
        if (callId >= 1) {
            getImpactedTrains();
        }

        //Send a post to a service in order to retrieve points and informations
        function getImpactedTrains() {
            callId++;
            dojo.xhrPost({
                url: './circulation/' + ligne + '/' + callId,
                handleAs: "text",
                load: function (data) {
                    applyTrains(createPointsFromTrains(JSON.parse(data)));
                }
            });
        }

        //put trains on map
        function applyTrains() {
            pointLayer.clear();//We first empty the layer
            for (var i = 0; i < points.length; i++) {
                pointLayer.add(points[i]);
            }
        }

        //Here we get set popup with attributes and define position with elements send by the service /circulation
        function createPointsFromTrains(trains) {
            for (var i = 0; i < trains.length; i++) {
                var item = trains[i];
                var point = new Point(item.x, item.y, new SpatialReference({wkid: 2154}));
                var pointSymbol = new SimpleMarkerSymbol({
                    "type": "esriPMS",
                    "url": "/images/train.png",
                    "contentType": "image/png",
                    "width": 15,
                    "height": 15
                });
                var pointAttributes = {"Num&eacute;ro": item.IDFEM, "Etat": "OK", "Retard": "aucun retard signal&eacute;"};
                var pointInfoTemplate = new InfoTemplate(item.Libelle);
                var pointGraphic = new Graphic(point, pointSymbol, pointAttributes).setInfoTemplate(pointInfoTemplate);
                points.push(pointGraphic);
            }
            return points;
        }
    });
}
