// Import frameworks
const express = require('express');
const router = new express.Router();
const bCrypt = require('bcrypt-nodejs');

// Import mongo models
const Club = require('./models/club');
const User = require('./models/user');

// Import Jennifer's id from env.sh file
const jennId = process.env.jennId;

router.get('/', (req, res) => {
  res.send({success: true, data: 'Welcome to the PennClubReview API!'});
});

// Route to list all the clubs
router.get('/clubs', (req, res) => {
  Club.find({}, (err, clubs) => {
    if (err) {
      res.send({success: false, error: err.message});
    } else {
      res.json({"clubs": clubs});
    }
  });
});

// Route to create a new club
router.post('/clubs', (req, res) => {
  // Attempt to find club in Mongo, can't create duplicate club
  Club.find({
    name: req.body.name
  }, (err, club) => {
    if (err) {
      res.send({success: false, error: err.message});
      // If club already exists, return error
    } else if (club.length) {
      res.send({
        success: false,
        error: 'A club with the name ' + req.body.name + ' already exists.'
      });
    } else {
      // Declare new club
      const newClub = new Club({name: req.body.name, size: req.body.size});
      // Save in Mongo
      newClub.save((err) => {
        if (err) {
          res.send({success: false, error: err.message});
        } else {
          User.findById(jennId, (errUser, user) => {
            if (errUser) {
              res.send({success: false, error: errUser.message});
            } else {
              // TODO save rankings better in mongo
              const currentRankings = user.rankings;
              currentRankings.push(newClub);
              user.rankings = currentRankings;
              user.save((errSave) => {
                if (errSave) {
                  res.send({success: false, error: errSave.message});
                } else {
                  res.send({
                    success: true,
                    data: 'New club ' + newClub.name + " created!"
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// Route to change the ranking of a specified club
router.post('/rankings', (req, res) => {

  // Isolate variables
  const clubRanking = req.body.ranking;
  const name = req.body.name;

  // Find Jenn in mongo
  User.findById(jennId, (err, user) => {
    if (err) {
      res.send({success: false, error: err.message});
    } else {
      const clubs = user.rankings;
      // Error check for proper ranking entering
      if (clubRanking < 1 || clubRanking > clubs.length) {
        res.send({
          success: false,
          error: 'Ranking must be in range ' + 1 + '-' + clubs.length
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
            error: 'Club ' + name + ' is not on the list.'
          });
        } else {
          const newIndex = clubRanking - 1;
          // Updates the position of the club
          clubs.splice(newIndex, 0, clubs.splice(oldIndex, 1)[0]);
          // Update the order of the user's ranking
          user.rankings = clubs;
          // Save changes in Mongo
          user.save((err) => {
            if (err) {
              res.send({success: false, error: err.message});
            } else {
              res.send({
                success: true,
                data: name + ' is now ranked #' + clubRanking + "!"
              });
            }
          });
        }
      }
    }
  });
});

// Route to list the rankings of the clubs
router.get('/rankings', (req, res) => {
  // Find Jenn in Mongo
  User.findById(jennId, (err, user) => {
    if (err) {
      res.send({success: false, error: err.message});
    } else {
      const clubs = user.rankings;
      const rankings = [];
      // Display the ranking and club name nicely
      for (var i = 0; i < clubs.length; i++) {
        rankings.push({
          "ranking": i + 1,
          "club": clubs[i].name
        });
      }
      // Send back rankings
      res.json(rankings);
    }
  });
});

// Route to return a given user
router.get('/user/:id', (req, res) => {
  User.findById(req.params.id, (err, u) => {
    if (err) {
      res.send({success: false, error: err.message});
    } else if (!u) {
      res.send({
        success: false,
        error: 'User with id ' + req.params.id + ' not found.'
      });
    } else {
      // Choose which data to send, obviously don't want to display password.
      const user = {
        username: u.username,
        name: u.name,
        userId: u._id,
        rankings: u.rankings
      };
      res.send({success: true, data: user});
    }
  });
});

// Route to create a new user
router.post('/user/new', (req, res) => {
  console.log(req.body);
  // Generates hash using bCrypt, storing password safely
  const createHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };

  // Find all clubs to add to user
  Club.find({}, (errClub, clubs) => {
    if (errClub) {
      res.send({success: false, error: errClub});
    } else {
      // Create a new user with given params
      // NOTE password is hashed to store securely
      // NOTE rankings are default the order in which they are in Mongo
      // TODO display clubs better, only pass back some data
      const newUser = new User({
        fullname: req.body.fullname,
        username: req.body.username,
        password: createHash(req.body.password),
        rankings: clubs
      });
      // Save new user in Mongo
      newUser.save((err, user) => {
        if (err) {
          res.send({success: false, error: err.message});
        } else {
          res.send({
            success: true,
            data: 'New user ' + req.body.fullname + ' created. Access his/her information at the route: api/user/' + user._id,
          });
        }
      });
    }
  });
});

router.post('/', (req, res) => {
  res.send('The request body is: ' + req.body);
});

module.exports = router;
