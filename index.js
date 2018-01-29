// Import frameworks
const express = require('express');
const routes = require('./routes');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Import mongo models
const Club = require('./models/club');
const User = require('./models/user');

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
  // Pull all clubs from Mongo
  Club.find({}, (err, c) => {
    if (err) {
      res.send({
        success: false,
        error: err.message,
      });
    } else {
      res.render('main',
        {clubs: c}
      );
    }
  });
});

app.listen(8080, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Listening on Port 8080!');
  }
});
