var express = require('express');
var router = express.Router();

//mock
var trains =[{
              "IDFEM": "34",
              "Libelle": "Train 3425",
              "y" : "6817264.25","x" : "587389.81", "codeLigne":"420000"
            },
            { 
              "IDFEM": "35",
              "Libelle": "Train 6543",
              "y" : "6835953.46","x" : "147132.68", "codeLigne":"420000"
            }];
/*
router.get('/', function(req, res, next) {
    res.render('circulation/index.jade', {train : JSON.stringify(trains)});
});

router.get('/:id', function(req, res, next) {
    var train = giveMeSomeFakeData(req.params.id);
    if (train == "") res.redirect(204, '../');
    else res.render('circulation/index.jade', {train : "["+JSON.stringify(train)+"]"});
});
*/
router.post('/:ligne', function(req, res) {
    var trains = giveMeSomeFakeData(req.params.ligne);
    res.status(200).send(trains);
});


//post permettant d'obtenir le mouvement des trains.
//la paramètre callId n'est utile que dans le cadre du poc
router.post('/:ligne/:callId', function(req, res) {
    var trains = giveMeSomeTemporalFakeData(req.params.ligne, req.params.callId);
    res.status(200).send(trains);
});

//Ici on pourrait avoir un service qui fasse l'appel aux positions des trains sur une ligne
function giveMeSomeTemporalFakeData(ligne, call) {
    var response = [];
    for (var i = 0; i < trains.length; i++) {
        var train = trains[i];
        if (train.codeLigne == ligne) {
            if (call % 2 == 0) {
                switch (train.IDFEM){
                    case "34": train.x = "494126.42"; train.y = "6770131.66"; break;
                    case "35": train.x = "272660.83"; train.y = "6838927.09"; break;
                }
            } else {
                switch (train.IDFEM){
                    case "34": train.x = "587389.81"; train.y = "6817264.25"; break;
                    case "35": train.x = "147132.68"; train.y = "6835953.46"; break;
                }
            }
            response.push(train);
        }
    }
    return response;
}

function giveMeSomeFakeData(ligne) {
    //if (!id || id>trains.length) return "";
    var response = [];
    for (var i = 0; i < trains.length; i++) {
        if (trains[i].codeLigne == ligne) response.push(trains[i]);
    }
    return response;
}
module.exports = router;