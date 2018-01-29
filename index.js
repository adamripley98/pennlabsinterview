// Import frameworks
const express = require('express');
const routes = require('./routes');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require("fs");

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

// Connecting to mongo
const connect = process.env.MONGODB_URI;
mongoose.connect(connect);

// Handlebars setup
app.set('views', __dirname + '/views');
app.set('view engine', '.hbs');

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api', routes);


// Route to display the main page of the app
app.get('/', (req, res) => {
  console.log('cl', clubs);
  res.render('main', {clubs: clubs});
});

app.listen(8080, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Listening on Port 8080!');
  }
});
