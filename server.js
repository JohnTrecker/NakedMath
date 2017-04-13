'use strict';

let express = require('express');
let responseTime = require('response-time');
let app = express();
let colors = require('colors');
let router = require('./controller/routes');


app.use(responseTime());

app.use('*', (req, res, next) => {
  req.accepts('application/json');
  next();
})

app.use('/', router);

// exeption and error handling
app.use((err, req, res, next) => {
  if (err.status !== 404) {
    return next();
  }
  res.send(err.message || 'Sorry, that operation isn\'t available.');
});

app.use((err, req, res, next) => {
  let status = err.status || 500;
  res.send( {status: status, error: err.message} );
});

// launch
let port = process.env.PORT || 3000;

let path;
if (process.env.NODE_ENV === 'production') {
  require('now-logs')(process.env.LOG_SECRET);
  path = "https://NakedMath.party"
} else {
  path = `localhost:${port}`;
}


app.listen(port, () => {
  console.log( colors.blue(`NakedMath API listening on ${path}`) );
});