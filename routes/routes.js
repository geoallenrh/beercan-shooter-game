var express    = require('express'),
    fs         = require('fs');

var router = express.Router();

var index_page = function (req, res) {
  var index_html = fs.readFileSync(__dirname + '/../index.html');
  res.status(200).type('html').send(index_html);
};

router.get('/', index_page);

//export this router to use in our index.js
module.exports = router;