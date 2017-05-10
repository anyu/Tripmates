var express = require('express');
// var knex = require('knex');
var path = require('path');
var bodyParser = require('body-parser');

var util = require('./util.js');
var db = require('./db/database.js');
var app = express();
var session = require('express-session');

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client')));

app.use(session({
  secret: 'encryption_salt',
  resave: true,
  saveUnitialized: true
}));

// app.get('/login',
// function(req, res) {
//   req.session.destroy();
//   res.render('login');
// });

app.get('/signup', function (req, res) {
  res.render('/Signup')
})

app.get('/profile', function (req, res) {
  var userData = {};
  var tripArray = [];

  var query = `SELECT username FROM logIns ORDER BY id DESC LIMIT 1`;
  db.dbConnection.query(query, function(error,results,fields) {
    if(error) {
      console.error(error)
    }

    userData['user'] = results;

    var currentUserQuery = `SELECT id FROM users WHERE username = '${results[0].username}'`
    db.dbConnection.query(currentUserQuery, function(error1, currentUser, fields) {
      if(error) {
        console.log(error1)
      }

      var tripsQuery = `SELECT tripName FROM trips INNER JOIN user_trips ON trips.id = user_trips.trip_id WHERE user_id = '${currentUser[0].id}'`
      db.dbConnection.query(tripsQuery, function (error, tripList, fields) {
        if (tripList[0]) {
        console.log('tripList', tripList[0].tripName)

        for (var i = 0; i < tripList.length; i++) {
          tripArray.push(tripList[i].tripName)
        }
        userData['trips'] = tripArray;
        res.send(userData);
        }
      })
    })
  });
})


app.post('/signup', function(req,res){

  var username = req.body.username;
  var password = req.body.password;
  req.session.user = username;

  var query1 = `INSERT INTO users (username, password) VALUES ('${username}', '${password}')`;
  var query2 = `INSERT INTO logIns (username, password) VALUES ('${username}', '${password}')`;

  db.dbConnection.query(query1);
  db.dbConnection.query(query2);
  res.send("Added to DB");
})

app.post('/login', function(req,res) {

  var username = req.body.username;
  var password = req.body.password;

  if(req.session.username) {
    var query2 = `INSERT INTO logIns (username, password) VALUES ('${username}', '${password}')`;

    db.dbConnection.query(query2);
    res.send("Added to login table");
  } else {
    res.send("Username does not exist.")
  }
})

app.get('/logout', function(req,res){
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get('/userTable', function(req, res) {
  var query = `SELECT * FROM users`;
  db.dbConnection.query(query, function (error, results, fields) {
    if (error) {
      console.error(error)
    }
    res.send(results)
  });
})


app.post('/tripInfo', function(req, res) {
  console.log(req.body)
  //var query = '';
})

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
