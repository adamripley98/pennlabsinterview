const express = require('express');
const router = new express.Router();

router.get('/', (req, res) => {
  res.send('Welcome to the PennClubReview API!');
});

// Route to list all the clubs
// TODO implement
router.get('/clubs', (req, res) => {
  res.send('List of clubs!');
});

// Route to create a new club
// TODO implement
router.post('/clubs', (req, res) => {
  res.send('Create a new club!.');
});

// Route to change the ranking of a specified club
// TODO implement
router.post('/rankings', (req, res) => {
  res.send('Change rankings.')
});

// Route to list the rankings of the clubs
// TODO implement
router.get('/rankings', (req, res) => {
  res.send('List of rankings.');
});

// Route to return a given user
// TODO implement
router.get('/user/:id', (req, res) => {
  res.send('Given user.');
});

router.post('/', (req, res) => {
  res.send('The request body is: ' + req.body);
});

module.exports = router;
