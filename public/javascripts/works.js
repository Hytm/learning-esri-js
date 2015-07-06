//Draw a line with element from service
function drawWork(data, params) {
    require([
        "esri/map",
        "esri/symbols/CartographicLineSymbol",
        "esri/Color",
        "esri/graphic",
        "esri/layers/GraphicsLayer",
        "esri/InfoTemplate"
    ], function (Map,
                 CartographicLineSymbol,
                 Color,
                 Graphic,
                 GraphicsLayer,
                 InfoTemplate) {

        var response = JSON.parse(data);
        var points = response.esriNeeds; // retrieve all the points

        //Add all lines on load
        map.on('load', function() {
            var graph = defineGraphic();

            for (var i=0; i<graph.length; i++) {
                lineLayer.add(graph[i]);
            }
        });

        function defineGraphic() {
            var graph = [];
            var nb = response.items;
            if (nb > 1) {// If we have more than one line, we have to use different path in order to access elements from response
                for (var i = 0; i < points.paths.length; i++) {
                    var route = new esri.geometry.Polyline(points.paths[i].points[0]);
                    var line = params ? createGraphicWithParams(route, getSymbol(points.paths[i].infos.sendCls), points.paths[i].infos) : createGraphicWithoutParams(route, getSymbol(points.paths[i].codeSymbol));
                    graph.push(line);
                }
            } else {//only one element
                var route = new esri.geometry.Polyline(points.paths);
                var line = params ? createGraphicWithParams(route, getSymbol(response.infos.sendCls), response.infos) : createGraphicWithoutParams(route, getSymbol(points.codeSymbol));
                graph.push(line);
            }
            return graph;
        }

        //Define a esri graphic object with response from service
        function createGraphicWithParams(route, lineSymbol, params) {
            var attributes = {
                "Libell&eacute;": params.Libelle,
                "R&eacute;gion": params.Region,
                "Sp&eacute;cialit&eacute;": params.Specialite,
                "Programme": params.Programme,
                "Ss programme": params.SsProgramme,
                "Urgence": params.Urgence,
                "Impact capacit&eacute;": params.ImpactCapacite
            };
            var title = new InfoTemplate(params.IDFEM); //Add a popup with attributes
            return new Graphic(route, lineSymbol, attributes).setInfoTemplate(title);
        }

        //In case we don't have good params in response we push an empty popup
        function createGraphicWithoutParams(route, lineSymbol) {
            var attributes = response.infos;
            var title = new InfoTemplate("Informations");
            return new Graphic(route, lineSymbol, attributes).setInfoTemplate(title);
        }

        //Get a specific symbol from argument we find in response
        function getSymbol(id) {
            var cls;
            switch(id) {
                case "1":
                    cls = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color([255, 0, 0]), 4,
                        CartographicLineSymbol.CAP_ROUND,
                        CartographicLineSymbol.JOIN_ROUND, 1
                    );
                    break;
                case "2":
                    cls = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color([0, 0, 255]), 4,
                        CartographicLineSymbol.JOIN_MITER, 1
                    );
                    break;
                case "3":
                    cls = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color([255, 0, 255]), 2,
                        CartographicLineSymbol.CAP_SQUARE,
                        CartographicLineSymbol.JOIN_ROUND, 1
                    );
                    break;
                default:
                    cls = new CartographicLineSymbol(
                        CartographicLineSymbol.STYLE_SOLID,
                        new Color([16, 192, 16]), 4,
                        CartographicLineSymbol.CAP_ROUND,
                        CartographicLineSymbol.JOIN_MITER, 1
                    );
                    break;
            }
            return cls;
        }
    });
}