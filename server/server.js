var express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var http = require("http");

var db = require('./db/database.js');
var app = express();

var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);

var yelp = require('yelp-fusion');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../client')));



app.post('/signup', function (req, res){
  var username = req.body.username;
  var password = req.body.password;

  if(username && password) {
    var encryptedPassword = bcrypt.hashSync(password, salt)

    var insertEncryptedPwQuery = `INSERT INTO users (username, password) VALUES ('${username}', '${encryptedPassword}')`;

    db.dbConnection.query(insertEncryptedPwQuery);
    res.send("Added user to DB");
  }
})


app.post('/login', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  // If entered username or password is blank, send back 'false'
  if(!username || !password) {
    return res.send(false);
  }

  var doesUserExist = `SELECT username FROM users WHERE username = '${username}'`;
  db.dbConnection.query(doesUserExist, function (error, result, fields) {
    // If username does not exist in database, send back 'false'
    if(!result[0]) {
      return res.send(false);
    } else {
        // If username exists, check password
        var passwordQuery = `SELECT password from users WHERE username = '${username}'`;
        db.dbConnection.query(passwordQuery, function (error, encryptedPassword, fields) {
          if (error) {
            console.error(error)
          }
          bcrypt.compare(password, encryptedPassword[0].password).then(function(match) {
            return res.send(match);
          })
          .catch(function (error) {
            console.log(error);
          });;
        });
      }
    });
})


app.get('/logout',function(req,res){
  res.redirect('/');
});


// Returns all users from DB (used in InviteFriends component) [TO DO: Refactor to check if username exists here instead of clientside]
app.get('/users', function(req,res) {
  var usernameQuery = 'SELECT username FROM users';
  db.dbConnection.query(usernameQuery, function(error, results, fields) {
    if(error) {
      console.log(error)
    }
    res.send(results)
  })
})


// Returns list of tripNames associated with the current user (used in Profile component)
app.get('/profile', function (req, res) {
  var userData = {};
  var tripArray = [];

    var currentUserIDQuery = `SELECT id FROM users WHERE username = '${req.query.loggedInUser}'`;
    db.dbConnection.query(currentUserIDQuery, function(error, currentUser, fields) {
      if(error) {
        console.log(error)
      }

      var tripsQuery = `SELECT tripName FROM trips INNER JOIN user_trips ON trips.id = user_trips.trip_id WHERE user_id = '${currentUser[0].id}'`;
      db.dbConnection.query(tripsQuery, function (error, tripList, fields) {
        if (tripList[0]) {
          for (var i = 0; i < tripList.length; i++) {
            tripArray.push(tripList[i].tripName)
          }
          userData['trips'] = tripArray;
        }
        res.send(userData);
      })
  });
})


// Adds all trip information to a newly created trip (used in CreateTrip component)
app.post('/tripInfo', function(req, res) {
  var currentUserID_query = `SELECT id FROM users WHERE username = '${req.body.loggedInUser}'`;
  db.dbConnection.query(currentUserID_query, function(error, currentUser, fields1) {
    if(error) {
      console.log(error)
    }

    var insertTripQuery = `INSERT INTO trips (tripName, destination, est_cost) VALUES ('${req.body.tripName}', '${req.body.destination}', '${req.body.estCost}')`;
    db.dbConnection.query(insertTripQuery, function(error, result, fields) {
      if(error) {
        console.error(error)
      }

      var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.body.tripName}'`;
      db.dbConnection.query(tripIDQuery, function(error, tripID, fields) {
        if(error) {
          console.error(error)
        }
        for(var i = 0; i < req.body.dates.length; i++) {
          var insertDatesQuery = `INSERT INTO dates (dateOption, trip_id, votes) VALUES ('${req.body.dates[i]}', ${tripID[0].id}, ${req.body.votes})`;
          db.dbConnection.query(insertDatesQuery, function(error,result,fields) {
            if(error) {
              console.error(error)
            }
          })
        }
        for(var j = 0; j < req.body.activities.length; j++) {
          var insertActivitiesQuery = `INSERT INTO activities (activityName, activityDescription, est_cost, vote_count, trip_id) VALUES ('${req.body.activities[j].activityName}', '${req.body.activities[j].activityDescription}', '${req.body.activities[j].activityCost}', 0, ${tripID[0].id})`;
          db.dbConnection.query(insertActivitiesQuery, function(error,result,fields) {
            if(error) {
              console.error(error)
            }
          })
        }
        for(var k = 0; k < req.body.friend.length; k++) {
          var friendIDQuery = `SELECT id FROM users WHERE username = '${req.body.friend[k]}'`;
          db.dbConnection.query(friendIDQuery, function(error, friendID, fields) {
            // If friend invited
            if(friendID[0]) {
              var insertFriendUserTripsQuery = `INSERT INTO user_trips (user_id, trip_id) VALUES('${friendID[0].id}', '${tripID[0].id}')`;
              db.dbConnection.query(insertFriendUserTripsQuery, function(error, result, fields) {
                if(error) {
                  console.error(error);
                }
              })
            }
        })
        }

        var insertUserTripsQuery = `INSERT INTO user_trips (user_id, trip_id) VALUES ('${currentUser[0].id}', '${tripID[0].id}')`;
        db.dbConnection.query(insertUserTripsQuery, function(error, result, fields) {
          if(error) {
            console.error(error);
          }
          res.send('Added trip to DB');
        })
      })
    })
  })
})


// Returns existing information for a specific trip (used in ContributeTrip component)
app.get('/tripInfo', function(req,res) {
    var query = `SELECT * FROM trips WHERE tripName = '${req.query.currentTrip}'`;
    db.dbConnection.query(query, function(error, tripInfo, fields) {
      res.send(tripInfo);
    })
})


// Returns all date options for a specific trip (used in ContributeTrip component)
app.get('/dates', function(req,res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.query.currentTrip}'`;
  db.dbConnection.query(tripIDQuery, function(error, tripId, fields) {

    var dateQuery = `SELECT * FROM dates WHERE trip_id = ${tripId[0].id}`;
    db.dbConnection.query(dateQuery, function(error, dateRow,fields){
      if(error) {
        console.error(error);
      }
      res.send(dateRow);
    })
  })
})


// Returns all comments on a specific trip (used in ContributeTrip component)
app.get('/comments', function (req, res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.query.currentTrip}'`;
  db.dbConnection.query(tripIDQuery, function(error, tripId, fields) {
    if(error) {
      console.error(error);
    }
    var commentsQuery = `SELECT comment, username FROM comments INNER JOIN users ON comments.user_id = users.id WHERE trip_id = ${tripId[0].id}`;
    db.dbConnection.query(commentsQuery, function(error,comments,fields){
      if(error) {
        console.error(error);
      }
      res.send(comments);
    })
  })
})


// Adds comments to a specific trip (used in ContributeTrip component)
app.post('/comments', function(req,res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.body.currentTrip}'`;
  db.dbConnection.query(tripIDQuery, function(error, tripId, fields){
    if(error) {
      console.error(error)
    }
    var commentOwnerQuery = `SELECT id FROM users WHERE username = '${req.body.commentOwner}'`;
    db.dbConnection.query(commentOwnerQuery, function(error, userid, fields) {
      if(error) {
        console.log(error)
      }
      var insertCommentQuery = `INSERT INTO comments (comment, user_id, trip_id) VALUES ('${req.body.comment}',${userid[0].id},${tripId[0].id})`;
      db.dbConnection.query(insertCommentQuery, function(error, results, fields) {
        if(error) {
          console.error(error)
        }
        res.send('Added comment to DB');
      })
    })
  })
})


// Returns all activity ideas on a specific trip (used in ContributeTrip component)
app.get('/activities', function(req,res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.query.currentTrip}'`;
  db.dbConnection.query(tripIDQuery, function(error, tripId, fields) {
   if(error) {
      console.error(error);
    }

    var activitiesQuery = `SELECT * FROM activities WHERE trip_id = ${tripId[0].id}`;
    db.dbConnection.query(activitiesQuery, function(error, activities,fields){
      if(error) {
        console.error(error);
      }
      res.send(activities);
    })
  })
})


// Adds new activitiy ideas for a specific trip(used in ContributeTrip component)
app.post('/newactivity', function(req,res) {
    var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.body.currentTrip}'`;
    db.dbConnection.query(tripIDQuery, function(error, tripId, fields) {
    if(error) {
      console.error(error)
    }
    var insertActivityQuery = `INSERT INTO activities (activityName, activityDescription, est_cost, vote_count, trip_id) VALUES ('${req.body.activityName}','${req.body.activityDescription}',${req.body.activityCost}, 0, ${tripId[0].id})`;
    db.dbConnection.query(insertActivityQuery, function(error, friendActivity, fields) {
      if(error) {
        console.error(error)
      }
      res.send('Added friend activity idea(s) to DB');
    })
  })
})


// Adds a vote to a date option on a specific trip (used in ContributeTrip component)
app.post('/addDateVote', function(req,res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.body.currentTrip}'`;
  db.dbConnection.query(tripIDQuery, function(error, id, fields) {

    var dateVotesQuery = `SELECT votes FROM dates WHERE dateOption = '${req.body.date}' AND trip_id = ${id[0].id}`;
    db.dbConnection.query(dateVotesQuery, function(error, votes, fields) {

      var updateDateVoteQuery = `UPDATE dates SET votes = ${votes[0].votes + 1} WHERE dateOption = '${req.body.date}' AND trip_id = ${id[0].id}`;
      db.dbConnection.query(updateDateVoteQuery, function(error, voteCount, fields){
        if(error) {
        console.error(error)
        }
        res.send('Updated date vote in DB');
      })
    })
  })
})


 // Adds a vote to an activity idea on a specific trip (used in ContributeTrip component)
app.post('/addActivityVote', function(req,res) {
  var tripIDQuery = `SELECT id FROM trips WHERE tripName = '${req.body.currentTrip}'`
  db.dbConnection.query(tripIDQuery, function(error, id, fields) {

    var activityVoteQuery = `SELECT vote_count FROM activities WHERE activityName = '${req.body.activityName}' AND trip_id = ${id[0].id}`;
    db.dbConnection.query(activityVoteQuery, function(error, votes, fields) {

      var updateActivityVoteQuery = `UPDATE activities SET vote_count = ${votes[0].vote_count + 1} WHERE activityName = '${req.body.activityName}' AND trip_id = ${id[0].id}`;
      db.dbConnection.query(updateActivityVoteQuery, function(error, voteCount, fields){
        if(error) {
        console.error(error)
        }
        res.send('Updated activity vote in DB');
      })
    })
  })
})



// Returns YelpFusionAPI listings based on search term and location (used in YelpGallery, YelpSearch components)
app.get('/yelp', function (req, res) {
  const resultArray = [];
  yelp.accessToken(process.env.YELP_CLIENT_ID, process.env.YELP_CLIENT_SECRET).then(response => {
    const client = yelp.client(response.jsonBody.access_token);

    client.search({
      term: req.query.term,
      location: req.query.location,
      sort_by: req.query.sort_by
    })
    .then((response) => {
      for (var i = 0; i < req.query.numResults; i++) {
        currentResult = response.jsonBody.businesses[i];
        resultArray.push(currentResult);
      }
      res.send({resultArray});
    })
  }).catch((e) => {
    console.log(e);
  });
})



// Keep Heroku app awake
setInterval(function() {
    http.get("http://tripmates.herokuapp.com");
}, 60000); // every minute


app.listen(process.env.PORT || 3000, function(){
  console.log('Listening on port 3000!')
})
