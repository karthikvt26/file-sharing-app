var express = require('express');
var app = express();

//your routes here
app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.get('/check_req', function( req, res ) {
  console.log('Req body');
  console.log(req.body);
  res.status(200).send('ok');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
