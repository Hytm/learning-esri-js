//Route racine
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html'); //envoi simplement le fichier html d'accueil
});

module.exports = router;
