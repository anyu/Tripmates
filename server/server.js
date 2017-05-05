var express = require('express');
// var knex = require('knex');
var path = require('path');
var bodyParser = require('body-parser');

var db = require('./db/database.js');
var app = express();

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client')));

app.get('/profile', function (req, res) {
  res.send('hi')
})

// app.post('/login', function (req, res){
//   console.log("log in username", req.body.username);
//   var userName = req.body.username;
//   var password = req.body.password;
//   res.send(req.body.username)
// })

app.post('/signup', function (req, res){
  console.log("inpost request", req.body);

  var username = req.body.username;
  var password = req.body.password;

  var query = `INSERT INTO users(username,password) VALUES('${username}', '${password}')`;
  db.dbConnection.query(query);
  res.send("Added to DB");
})


var addAlbum = function(album, cb) {
  var query = `INSERT INTO kanyes(era,year,description,imageURL) VALUES('${album.era}','${album.year}','${album.description}','${album.imageURL}')`;
  connection.query(query, (err,results,fields) => {
    if (err) {
      cb(err, false);
    } else {
      console.log('Added new album to db');
      cb(null, true);
    }
  });
}


app.listen(process.env.PORT || 3000, function() {
  console.log('Express server is up and running!');
});
