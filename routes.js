// Import frameworks
const express = require('express');
const router = new express.Router();
const bCrypt = require('bcrypt-nodejs');

// Import mongo models
const Club = require('./models/club');
const User = require('./models/user');

// Import Jennifer's id from env.sh file
const jennId = process.env.jennId;

// Route to ensure API is working
router.get('/', (req, res) => {
  res.send({success: true, data: 'Welcome to the PennClubReview API!'});
});

// Route to list all the clubs
router.get('/clubs', (req, res) => {
  // Find all clubs in Mongo
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
  // Error checking for empty name
  if (!req.body.name) {
    res.send({
      success: false,
      error: 'Name cannot be blank.',
    });
  // Error checking for empty size
  } else if (!req.body.size) {
    res.send({
      success: false,
      error: 'Size cannot be blank.',
    });
  } else {
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
            // Find jennifer in mongo
            User.findById(jennId, (errUser, user) => {
              if (errUser) {
                res.send({success: false, error: errUser.message});
              } else {
                // Update user's rankings with new club
                const currentRankings = user.rankings;
                newRank = {
                  name: newClub.name,
                  ranking: currentRankings.length + 1,
                }
                currentRankings.push(newRank);
                user.rankings = currentRankings;
                // Save changes to user in Mongo
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
  }
});

// Route to change the ranking of a specified club
router.post('/rankings', (req, res) => {

  // Isolate variables
  const clubRanking = req.body.ranking;
  const name = req.body.name;

  // Error checking for empty ranking
  if (!clubRanking) {
    res.send({
      success: false,
      error: 'Ranking cannot be empty.',
    });
  // Error checking for empty name
  } else if (!name) {
    res.send({
      success: false,
      error: 'Name cannot be empty.',
    });
  } else {
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
            // To ignore upper/lower case
            if (clubs[i].name.toLowerCase() === name.toLowerCase()) {
              isPresent = true;
              oldIndex = i;
            }
          }
          // If club doesn't exist, cannot update ranking
          if (!isPresent) {
            res.send({
              success: false,
              error: 'Club ' + name + ' is not on the list.',
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
                  data: name + ' is now ranked #' + clubRanking + "!",
                });
              }
            });
          }
        }
      }
    });
  }
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
          "club": clubs[i].name,
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
  // Generates hash using bCrypt, storing password safely
  const createHash = (password) => {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };
  // Error checking: username, name, and password cannot be empty
  if (!req.body.username) {
    res.send({
      success: false,
      error: 'Username cannot be empty',
    });
  } else if (!req.body.name) {
    res.send({
      success: false,
      error: 'Name cannot be empty',
    });
  } else if (!req.body.password) {
    res.send({
      success: false,
      error: 'Password cannot be empty',
    });
  } else {
    // Check to make sure a user with given username doesn't already exist
    User.find({username: req.body.username}, (errUser, user) => {
      if (errUser) {
        res.send({
          success: false,
          error: errUser.message,
        });
        // Error check: user already exists
      } else if (user.length) {
        res.send({
          success: false,
          error: 'User with username ' + req.body.username + ' already exists.',
        });
      } else {
        // Find all clubs to add to user
        Club.find({}, (errClub, clubs) => {
          if (errClub) {
            res.send({success: false, error: errClub});
          } else {
            const rankings = [];
            // Filter unnecessary club information stored in user
            for (var i = 0; i < clubs.length; i++) {
              rankings.push({
                name: clubs[i].name,
                ranking: i + 1,
              });
            }
            // Create a new user with given params
            // NOTE password is hashed to store securely
            // NOTE rankings are default the order in which they are in Mongo
            const newUser = new User({
              name: req.body.name,
              username: req.body.username,
              password: createHash(req.body.password),
              rankings: rankings,
            });
            // Save new user in Mongo
            newUser.save((err, user) => {
              if (err) {
                res.send({success: false, error: err.message});
              } else {
                res.send({
                  success: true,
                  data: 'New user ' + req.body.name + ' created. Access his/her information at the route: api/user/' + user._id,
                });
              }
            });
          }
        });
      }
    });
  }
});

// Display all users who are registered
router.get('/users', (req, res) => {
  // Find all users in Mongo
  User.find({}, (err, u) => {
    if (err) {
      res.send({
        success: false,
        error: err.message,
      });
    } else {
      const users = [];
      u.forEach((user) => {
        users.push({name: user.name, userId: user._id});
      });
      res.send({
        success: true,
        data: users,
      });
    }
  })
});

router.post('/', (req, res) => {
  res.send('The request body is: ' + req.body);
});

module.exports = router;
