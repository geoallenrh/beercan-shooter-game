var express    = require('express');

var router = express.Router();

var objectsBase = [{"id":"obj1_1","type":{"name":"item1","value":10}},{"id":"obj1_2","type":{"name":"item1","value":10}},{"id":"obj1_3","type":{"name":"item1","value":10}},{"id":"obj1_4","type":{"name":"item1","value":10}},{"id":"obj1_5","type":{"name":"item1","value":10}},{"id":"obj1_6","type":{"name":"item1","value":10}},{"id":"obj2_1","type":{"name":"item2","value":20}},{"id":"obj2_2","type":{"name":"item2","value":20}},{"id":"obj2_3","type":{"name":"item2","value":20}},{"id":"obj2_4","type":{"name":"item2","value":20}},{"id":"obj2_5","type":{"name":"item2","value":20}},{"id":"obj3_1","type":{"name":"item3","value":50}},{"id":"obj3_2","type":{"name":"item3","value":50}},{"id":"obj3_3","type":{"name":"item3","value":50}},{"id":"obj3_4","type":{"name":"item3","value":50}},{"id":"obj4_1","type":{"name":"item4","value":100}},{"id":"obj4_2","type":{"name":"item4","value":100}},{"id":"obj4_3","type":{"name":"item4","value":100}}]

var objects;

router.get('/createGame', function(req, res){
    objects = objectsBase.slice();
    res.json({"id":"12345","username":"Player 1","score":0,"level":1,"type":{"name":"BeerGame"}});
});

router.get('/objects', function(req, res){
  res.json(objects);
});

router.get('/getRandomObject', function(req, res){
  res.json(objects.pop());
});

router.get('/deleteObject', function(req, res){
  res.json();
});

router.get('/topScores', function(req, res){
});


//export this router to use in our index.js
module.exports = router;