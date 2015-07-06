//Draw the map
function draw() {
    require([
        "esri/map",
        "esri/symbols/CartographicLineSymbol",
        "esri/Color",
        "esri/graphic",
        "esri/layers/GraphicsLayer"
    ], function (Map,
                 CartographicLineSymbol,
                 Color,
                 Graphic,
                 GraphicsLayer) {
        var fdp;
        var lignes;
        var ortho;
        var photo;

        retrieveMap();
        applyLayer();

        //Get all the "maps" from server
        function retrieveMap() {
            map = new Map("map");
            fdp = new esri.layers.ArcGISTiledMapServiceLayer("http://54.247.127.38:6080/arcgis/rest/services/1_0_0_dcf_raster_fdp_relief/MapServer");
            lignes = new esri.layers.ArcGISDynamicMapServiceLayer("http://54.247.127.38:6080/arcgis/rest/services/1_0_1_gaiascope_theme_infrastructures_temporal/MapServer", { displayLevels:[0,1,2,3,4,5,6,7,8,9,10,11,12]});
            ortho = new esri.layers.ArcGISTiledMapServiceLayer("http://54.247.127.38/francerasterproxy/arcgis/rest/services/FranceRaster/France_FranceRaster_Standard/MapServer?token=n0AWTA80tNQnTbtHqBDm0kJaQdogchxaBTxexPRE0x%2EBk56AHCyOKA7U40C7svIE00UcfSpscVGaMn42S5mlrA--", { displayLevels:[2,3,4,5,6,7]});
            photo = new esri.layers.ArcGISTiledMapServiceLayer("http://services.esrifrance.fr/arcgis/rest/services/IGN/France_BD_ORTHO/MapServer?token=n0AWTA80tNQnTbtHqBDm0kJaQdogchxa%2A7m08IbmwNvy3b0ywSgJcrzgX3%2E6uvJv2QJtgmSi%2EG5CaJgEwA0ytw--", { displayLevels:[8,9,10,11,12]});
        }

        //Apply layer in order
        function applyLayer() {
            map.addLayer(photo);
            map.addLayer(ortho);
            map.addLayer(fdp);

            pointLayer = new GraphicsLayer();
            lineLayer = new GraphicsLayer();
            map.addLayer(lineLayer);
            map.addLayer(pointLayer);

            map.addLayer(lignes);
        }
    });
}
