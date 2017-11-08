var express = require('express');
var app = express();

var rp = require('request-promise');

//your routes here
app.get('/', function (req, res) {
    res.send("Hello World!");
});

app.get('/check_req', function( req, res ) {
  console.log('Req body');
  console.log(req.body);
  console.log(req.query);

  const file_id = req.query.file_id;

  const user_id = req.headers['x-hasura-user-id'];

  const queryObj = {
    type: 'select',
    args: {
      table: 'user_file',
      columns: ['id'],
      where: {
        'file_id': file_id,
        'shared_users': {
          'shared_user_id': parseInt(user_id, 10)
        }
      }
    }
  };

  const options = {
    url: 'http://data.hasura/v1/query',
    method: 'POST',
    body: JSON.stringify(queryObj),
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-user-id': '0',
      'x-hasura-role': 'admin'
    }
  }

  return rp(options)
  .then( function( resp ) {
    console.log('Response');
    console.log(resp);
  })
  .catch( function ( resp ) {
    console.log('error');
    console.log(resp);
  });

  console.log('QueryObj');
  console.log(queryObj);

  res.status(200).send('ok');
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});
