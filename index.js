// Import frameworks
const express = require('express');
const routes = require('./routes');
const app = express();
const router = express.Router();
const hbs = require('hbs');


app.use('/api', routes);

// // Handlebars setup
app.set('views', __dirname + '/views');
app.set('view engine', '.hbs');

app.listen(8080, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Listening on Port 8080!');
  }
});
