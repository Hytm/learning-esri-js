//Gestion de la route /travaux
var express = require('express');
var http = require('http');
var querystring = require('querystring');
//var bodyparser = require('body-parser');

var router = express.Router();

//Définition d'une route "complexe" en GET (démo technique)
router.get('/:codeLigne/:rangTroncon/:pkDebut/:pkFin', function(req, res) {
    var demand = req.params;
    retrieveDataFromService(demand.codeLigne, demand.rangTroncon, demand.pkDebut, demand.pkFin, "json", null, function(paths) {
        var jsonPaths= '{"esriNeeds": {"paths": '+paths+', "spatialReference":{"wkid":2154}}, "infos": '+mockMeIMFamous()+'}, "items": 1';
        res.render('travaux/index.jade', {travaux : jsonPaths});
    });
});

//route principalement utilisée dans le poc en POST
router.post('/', function(req, res) {
    var demand = req.body;
    if (!demand.length) { //On détermine si le contenu du post est un seul travaux ou un tableau de travaux
        retrieveDataFromService(demand.codeLigne, demand.rangTroncon, demand.pkDebut, demand.pkFin, "json", demand, function (paths, infos) {
            var jsonPaths = '{"esriNeeds": {"paths": ' + paths + ', "spatialReference":{"wkid":2154}}, "infos":'+JSON.stringify(infos)+' , "items": 1}';
            res.status(200).send(jsonPaths);
        });
    } else {//Si tableau, compile les routes avant de rendre la réponse
        responseAgregation(demand, function(jsonPaths){
            res.status(200).send(jsonPaths);
        });
    }
});


function responseAgregation(elements, callback) {
    points = '[{"points":['; //préparation du json de réponse
    var queries = 0; //shame on this hack! permet de rendre synchrone la réponse en conservant l'asynchronisme des méthodes node! C'est sale et pas complètement efficace :/
    var total = elements.length;
    for (var i=0; i<total; i++) {
        var demand = elements[i];
        queries++; //incrémente le nombre d'appel
        retrieveDataFromService(demand.codeLigne, demand.rangTroncon, demand.pkDebut, demand.pkFin, "json", demand, function(paths, infos){
            points+=paths+'], "infos": '+JSON.stringify(infos)+'},{"points":['; // concaténation de la réponse
            queries--; // on décrémente
            if (queries === 0) {//Si plus aucune requete en cours, on répond ...
                points = points.substring(0, points.length-12)+"]";
                callback('{"esriNeeds": {"paths": ' + points + ', "spatialReference":{"wkid":2154}}, "items": '+total+'}'); //envoi de l'objet réponse
            }
        });
    }
}

function retrieveDataFromService(codeLigne, rangTroncon, pkDebut, pkFin, format, demand, callback) {
    var parameters = generatePostParameters(codeLigne, rangTroncon, pkDebut, pkFin, format);
    var options = generateJsonOptions(parameters);
    var paths = '';
    //appel de service pour fournir la liste de points entre les pk
    var req = http.request(options, function (res) {
        res.on('data', function(chunk) {
            paths+=chunk; //on récupère les éléments à leur arrivé
        });
        res.on('end', function(){
            var data = formatResponse(paths); // on format la réponse du service pour qu'elle soit conforme à notre besoin
            callback(data, demand); // on répond
        });
        res.on('error', function(err){
            console.log("Uh-oh!\n"+err.message);
            next();
        });
    });

    req.on('error', function(err){
       console.log("Uh-oh!\n"+err.message);
       next();
    });

    //on lance la requête
    req.write(parameters);
    req.end();
}

//Vérifie que la réponse est bien dans un format compatible JSON
function formatResponse(paths) {
    //JSON ok
    if (/^[\],:{}\s]*$/.test(paths.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return JSON.stringify(extractJsonPathsFromServiceResponse(JSON.parse(paths)));
    }else {
        return '';
    }
}

//On produit les paramètres pour le post au service pktogeometry
function generatePostParameters(codeLigne, rangTroncon, pkDebut, pkFin, format) {
    var parameters = querystring.stringify({
        "codeLigne" : codeLigne,
        "rangTroncon" : rangTroncon,
        "pkDebut" : pkDebut,
        "pkFin" : pkFin,
        "format" : format
    });
    return parameters;
}

//JSON d'options pour l'appel du service, on peut imaginer avoir un service de configuration pour fournir ces éléments
function generateJsonOptions(parameters) {
    var pkToGeometryOptions = {
        host: "54.247.127.38",
        port: 80,
        path: "/sigwebservices/rest/geometry/pkToGeometry?"+parameters,
        method: "POST",
        headers: {
            "Authorization": "Basic bm9wYW5pYzp5VFVKbkJ5Zjc2MypYWUs="
        }
    };
    return pkToGeometryOptions;
}

//On transforme la réponse pktogeometry afin que les données soient celles attendues par la page
function extractJsonPathsFromServiceResponse(responseContent) {
    var paths = responseContent.results.geometry.paths[0];
    var jsonPaths = [];
    var len = paths.length-1;
    var buf;

    for (var i = 0; i < len; i+=2) {
        if (i % 2 == 0) {
            buf = [[paths[i].x, paths[i].y], [paths[i + 1].x, paths[i + 1].y]];
            jsonPaths.push(buf);
        }
    }
    return jsonPaths;
}

//Envoi de données bidon pour la page de démo technique
function mockMeIMFamous() {
    return JSON.stringify({
        "IDFEM": "34",
        "Libelle": "Déblai de la Milesse, coté voie 1, du Km 221,110 au 221,150 ( Zone incident )",
        "Region": " Bretagne Pays-de la-Loire",
        "Specialite": "OT",
        "Programme": "Renouvellement Ouvrages d'Art",
        "SsProgramme": "Opé. voie cour. lignes 7 à 9 AV",
        "Urgence": "R0",
        "ImpactCapacite": "--",
        "CoutEstime": "--",
        "codeLigne":"420000"
    });
}
module.exports = router;
