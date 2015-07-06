//no more in use
//this is a piece of crap, without refactoring an structure
var map;
require([
  "esri/map",
  "esri/layers/FeatureLayer",
  "esri/dijit/PopupTemplate",
  "esri/request",
  "esri/geometry/Point",
  "esri/graphic",
  "esri/SpatialReference",
  "dojo/on",
  "dojo/_base/array",
  "dojo/domReady!"
], function(
  Map, 
  FeatureLayer, 
  PopupTemplate,
  esriRequest,
  Point,
  Graphic,
  SpatialReference,
  on,
  array
) 
{
  var featureLayer;
  var fdp;
  var ortho;
  var photo;
  var lignes;

  retrieveMap();
  addEventListenerOnMap();

  defineFeature();

  addEventListernerOnFeature();

  applyLayer();

  function retrieveMap() {
    map = (items.length == 1) ? new Map("map", {center:[items[0].x, items[0].y]}) : new Map("map");
    //map = new Map("map");
    fdp = new esri.layers.ArcGISTiledMapServiceLayer("http://54.247.127.38:6080/arcgis/rest/services/1_0_0_dcf_raster_fdp_relief/MapServer");
    ortho = new esri.layers.ArcGISTiledMapServiceLayer("http://54.247.127.38/francerasterproxy/arcgis/rest/services/FranceRaster/France_FranceRaster_Standard/MapServer?token=n0AWTA80tNQnTbtHqBDm0kJaQdogchxaBTxexPRE0x%2EBk56AHCyOKA7U40C7svIE00UcfSpscVGaMn42S5mlrA--");
    //photo = new esri.lyers.ArcGISTiledMapServiceLayer("http://services.esrifrance.fr/arcgis/rest/services/IGN/France_BD_ORTHO/MapServer?token=n0AWTA80tNQnTbtHqBDm0kJaQdogchxa%2A7m08IbmwNvy3b0ywSgJcrzgX3%2E6uvJv2QJtgmSi%2EG5CaJgEwA0ytw--");
    lignes = new esri.layers.ArcGISDynamicMapServiceLayer("http://54.247.127.38:6080/arcgis/rest/services/1_0_1_gaiascope_theme_infrastructures_temporal/MapServer", {id:"lignes"});
  }

  function applyLayer() {
    map.addLayer(fdp);
    map.addLayer(ortho)
    //map.addLayer(photo);
    map.addLayer(lignes);
    map.addLayers([featureLayer]);
  }

  function addEventListernerOnFeature() {
  //associate the features with the popup on click
    featureLayer.on("click", function(evt) {
      map.infoWindow.setFeatures([evt.graphic]);
    });
  }

  function addEventListenerOnMap() {
    //hide the popup if its outside the map's extent
    map.on("mouse-drag", function(evt) {
      if (map.infoWindow.isShowing) {
        var loc = map.infoWindow.getSelectedFeature().geometry;
        if (!map.extent.contains(loc)) {
          map.infoWindow.hide();
        }
      }
    });

    map.on("layers-add-result", function(results) {
      setPoint();
    });
  }

  function defineFeature() {
    featureCollection = {
      "layerDefinition": null,
      "featureSet": {
        "features": [],
        "geometryType": "esriGeometryPoint"
      }
    };
    featureCollection.layerDefinition = {
      "geometryType": "esriGeometryPoint",
      "objectIdField": "ObjectID",
      "drawingInfo": {
        "renderer": {
          "type": "simple",
          "symbol": {
            "type": "esriPMS",
            "url": "/images/train.png",
            "contentType": "image/png",
            "width": 15,
            "height": 15
          }
        }
      },
      "fields": [{
        "name": "ObjectID",
        "alias": "ObjectID",
        "type": "esriFieldTypeOID"
      }, {
        "name": "IDFEM",
        "alias": "ID FEM",
        "type": "esriFieldTypeString"
      }, {
        "name": "Libelle",
        "alias": "Libelle",
        "type": "esriFieldTypeString"
      }, {
        "name": "Region",
        "alias": "Region",
        "type": "esriFieldTypeString"
      }, {
        "name": "Specialite",
        "alias": "Specialite",
        "type": "esriFieldTypeString"
      }, {
        "name": "Programme",
        "alias": "Programme",
        "type": "esriFieldTypeString"
      }, {
        "name": "SsProgramme",
        "alias": "SsProgramme",
        "type": "esriFieldTypeString"
      }, {
        "name": "Urgence",
        "alias": "Urgence",
        "type": "esriFieldTypeString"
      }, {
        "name": "ImpactCapacite",
        "alias": "ImpactCapacite",
        "type": "esriFieldTypeString"
      }, {
        "name": "CoutEstime",
        "alias": "CoutEstime",
        "type": "esriFieldTypeString"
      }]
    };

    //popup element
    popupTemplate = new PopupTemplate({
      title: "ID FEM {IDFEM}",
      description: "<b>Libelle:</b> {Libelle}<br>" +
      "<b>Région:</b> {Region}<br>" +
      "<b>Spécialité:</b> {Specialite}<br>" +
      "<b>Programme:</b> {Programme}<br>" +
      "<b>Sous programme:</b> {SsProgramme}<br>" +
      "<b>Urgence:</b> {Urgence}<br>" +
      "<b>Impact capacité:</b> {ImpactCapacite}<br>" +
      "<b>Cout estimé:</b> {CoutEstime}"
    });

    //create a feature layer based on the feature collection
    featureLayer = new FeatureLayer(featureCollection, {
      id: 'fLayer',
      infoTemplate: popupTemplate
    });
  }

  function setPoint() {
      var features = [];

      array.forEach(items, function(item) {
        var attr = {};
        attr["IDFEM"] = item.IDFEM ? item.IDFEM : "";
        attr["Libelle"] = item.Libelle ? item.Libelle : "";
        attr["Region"] = item.Region ? item.Region : "";
        attr["Specialite"] = item.Specialite ? item.Specialite : "";
        attr["Programme"] = item.Programme ? item.Programme : "";
        attr["SsProgramme"] = item.SsProgramme ? item.SsProgramme : "";
        attr["Urgence"] = item.Urgence ? item.Urgence : "";
        attr["ImpactCapacite"] = item.ImpactCapacite ? item.ImpactCapacite : "";
        attr["CoutEstime"] = item.CoutEstime ? item.CoutEstime : "";

        var geometry = new Point(item.x, item.y, new SpatialReference({ wkid: 2154 }));
        var graphic = new Graphic(geometry);
        graphic.setAttributes(attr);
        features.push(graphic);
      });

      featureLayer.applyEdits(features, null, null);
  }      
});