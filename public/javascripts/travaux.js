//JS principal servant les fonctions appelées depuis la page HTML

//Déclaration de varaibles dans le scope page
var map;
var ligne;
var callId =0;
var intervalId;
var lineLayer;
var pointLayer;

//Utilisé dans la page de démo technique
function showByHTMLTag() {
    var data = document.getElementById("items").innerText;
    draw(data);
}

//Affichage de tous les travaux
function showAllOnMap() {
    reset();

    var url = './travaux';
    var params = setBodyParametersWithAllTable();
    var jsonParams = JSON.parse(params);
    //Préparation de la popup
    document.getElementById('textTitle').innerHTML = "";
    document.getElementById('modalTitle').innerHTML = "Tous les travaux";

    //POST vers l'api node
    dojo.xhrPost ({
        url:url,
        postData: params,
        headers: { "Content-Type": "application/json"},
        load:function(data){
            draw();//dessin des maps
            drawWork(data, jsonParams);//dessin du layer travaux
        }
    });
}

//Affichage de la sélection
function showOnMap(id, withTrains) {
    reset();
    var url = './travaux';
    var params = setBodyParameters(id.substr(1, id.length-1));
    var jsonParams = JSON.parse(params);
    ligne = jsonParams.codeLigne;
    //Préparation de la popup
    document.getElementById('textTitle').innerHTML = formatTitle(jsonParams);
    document.getElementById('modalTitle').innerHTML = jsonParams.Libelle;

    dojo.xhrPost({
        url:url,
        postData: params,
        headers: { "Content-Type": "application/json"},
        load:function(data){
            draw();
            drawWork(data, jsonParams);
            //search trains
            if (withTrains == true) { //si on veut les trains, on utilise la méthode associée
                drawTrain();
                intervalId = setInterval("drawTrain()", 2000);//Refrsh de la position des trains
            }
        }
    });
}

//Remet les éléments à 0 entre les appels
function reset() {
    document.getElementById('map').innerHTML = '';
    callId = 0;
    ligne = "0";
    map == undefined;
    sendCls = "0";
}

//Supprime les appels au service pour le refraishissement des positions des trains
//C'est très important, car cet appel est dans un autre thread et continue tant qu'on ne quitte pas la page principale sans cet appel
function cleanInterval() {
    clearInterval(intervalId);
}

//Préparation des éléments à afficher dans la popup
function formatTitle(data) {
    var text;
    text =  "<dl class='dl-vertical'>";
    text +="<dt>ID FEM</dt><dd>"+data.IDFEM+"</dd>";
    text +="<dt>R&eacute;gion</dt><dd>"+data.Region+"</dd>";
    text +="<dt>Sp&eacute;cialit&eacute;</dt><dd>"+data.Specialite+"</dd>";
    text +="<dt>Programme</dt><dd>"+data.Programme+"</dd>";
    text +="<dt>Ss programme</dt><dd>"+data.SsProgramme+"</dd>";
    text +="<dt>Urgence</dt><dd>"+data.Urgence+"</dd>";
    text +="<dt>Impact capacit&eacute;</dt><dd>"+data.ImpactCapacite+"</dd>";
    text +="<dt>Cout estim&eacute;</dt><dd>"+data.CoutEstime+"</dd>";
    text += "</dl>";

    return text;
}

//Création du payload du post
function setBodyParameters(id) {
    var e = document.getElementById(id);
    var paramsJSON = {
        "IDFEM": e.children[0].innerHTML, //
        "Libelle": e.children[1].innerHTML, //
        "Region": e.getAttribute('id_dir_rff'),
        "Specialite": e.getAttribute('id_dir_rff'),
        "Programme": e.getAttribute('id_programme'),
        "SsProgramme": e.getAttribute('id_ss_programme'),
        "Urgence": e.getAttribute('id_typ_urgence'),
        "ImpactCapacite": '--',
        "CoutEstime": "--",
        "codeLigne": e.getAttribute('codeLigne'),
        "rangTroncon": 1,
        "pkDebut": e.getAttribute('an_pk_debut'),
        "pkFin": e.getAttribute('an_pk_fin'),
        "sendCls" : e.getAttribute('symbol')
    };

    params = JSON.stringify(paramsJSON);
    return params;
}

//Take every TR on create the payload for all the elements
function setBodyParametersWithAllTable() {
    var routes = '[';

    $('#test > tbody  > tr').each(function(i, tr) {
        routes += setBodyParameters(tr.id)+",";
    });
    routes = routes.substring(0, routes.length-1)+']';

    return routes;
}