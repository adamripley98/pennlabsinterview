// Import frameworks
const express = require('express');
const router = new express.Router();
const fs = require("fs");

// Import mongo models
const Club = require('./models/club');
const User = require('./models/user');

// Isolate clubs from json file
let clubs = {};
fs.readFile("club_list.json", (err, data) => {
  if (err) {
    res.send({
      error: err,
    })
  } else {
    clubs = JSON.parse(data);
  }
});

// Isolate Jennifer from json file
let jennifer = {};
fs.readFile("jennifer.json", (err, data) => {
  if (err) {
    res.send({
      error: err,
    })
  } else {
    jennifer = JSON.parse(data);
  }
});

router.get('/', (req, res) => {
  res.send('Welcome to the PennClubReview API!');
});

// Route to list all the clubs
router.get('/clubs', (req, res) => {
  res.json({"clubs": clubs});
});

// Route to create a new club
router.post('/clubs', (req, res) => {
  // Pull new club info and add to existing clubs
  clubs.push(req.body);
  // Convert from obj to string
  const newClubList = JSON.stringify(clubs);
  // Write newClubList to file
  fs.writeFile('club_list.json', newClubList, 'utf8', (err) => {
    if (err) {
      res.send({
        error: "Error adding club."
      });
    } else {
      const newClub = new Club({
        name: req.body.name,
        size: req.body.size,
      });
      newClub.save((err) => {
        if (err) {
          res.send({
            error: err.message,
          });
        } else {
          // TODO update in jennifer as well
          res.send('New club ' + newClub.name + " created!");
        }
      })
    }
  });
});

// Route to change the ranking of a specified club
router.post('/rankings', (req, res) => {

  // Isolate variables
  const clubRanking = req.body.ranking;
  const name = req.body.name;
  const clubs = jennifer.rankings;

  // Error check for proper ranking entering
  if (clubRanking < 1 || clubRanking > clubs.length) {
    res.send({
      success: false,
      error: 'Ranking must be in range ' + 1 + '-' + clubs.length,
    })
  // Error checking to ensure club name entered is in list
  } else {
    let isPresent = false;
    let oldIndex = -1;
    for (var i = 0; i < clubs.length; i++) {
      // To ignore cases
      if (clubs[i].name.toLowerCase() === name.toLowerCase()) {
        isPresent = true;
        oldIndex = i;
      }
    }
    if (!isPresent) {
      res.send({
        success: false,
        error: 'Club ' + name + ' is not on the list.',
      });
    } else {
      const newIndex = clubRanking - 1;
      // Updates the position of the club
      clubs.splice(newIndex, 0, clubs.splice(oldIndex, 1)[0]);
      // Update Jennifer's rankings
      // TODO password security
      const jenniferUpdated = {
        fullname: jennifer.fullname,
        username: jennifer.username,
        password: jennifer.password,
        rankings: clubs,
      }
      // Convert from obj to string
      const jenniferUpdatedStringified = JSON.stringify(jenniferUpdated);

      fs.writeFile('jennifer.json', jenniferUpdatedStringified, 'utf8', (err) => {
        if (err) {
          res.send({
            success: false,
            error: "Error changing rating.",
          });
        } else {
          res.send({
            success: true,
            data: name + ' is now ranked #' + clubRanking + "!",
          });
        };
      });
    }
  }
});

// Route to list the rankings of the clubs
// TODO implement with pulling jennifer from mongo, not json
router.get('/rankings', (req, res) => {
  const clubs = jennifer.rankings;
  const rankings = [];
  // Display the ranking and club name
  for (var i = 0; i < clubs.length; i++) {
    rankings.push({"ranking": i + 1, "club": clubs[i].name});
  }
  // Send back rankings
  res.json(rankings);
});

// Route to return a given user
// TODO implement
router.get('/user/:id', (req, res) => {
  res.send('Given user.');
});

// Route to create a new user
// TODO implement
router.post('/user/new', (req, res) => {
  console.log(req.body);
  // TODO encrypt password
  // TODO do something with rankings
  // Create a new user with given params
  const newUser = new User({
    fullname: req.body.fullname,
    username: req.body.username,
    password: req.body.password,
  });
  // Save new user
  newUser.save((err) => {
    if (err) {
      res.send({
        error: err.message,
      });
    } else {
      res.send('New user ' + req.body.fullname + ' created.');
    }
  });
});

router.post('/', (req, res) => {
  res.send('The request body is: ' + req.body);
});

module.exports = router;
