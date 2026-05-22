var express = require('express');
var router = express.Router();
var db = require('../db');
var helpers = require('../helpers');
var errors = [];

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register'
  });
});

router.post('/register', function (req, res, next) {
  var sqlQuery = "INSERT INTO users VALUES(NULL, ?, MD5(?), ?)";
  var values = [req.body.email, req.body.psw, req.body.fname];

  db.query(sqlQuery, values, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      res.send("Register Error: " + err.message);
      return;
    }

    res.redirect('/login');
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Login'
  });
});

router.post('/login', function (req, res, next) {
  var sqlQuery = "SELECT * FROM users WHERE user_email = ? AND user_pass = MD5(?)";
  var values = [req.body.email, req.body.psw];

  db.query(sqlQuery, values, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      res.send("Login Error: " + err.message);
      return;
    }

    if (results.length == 1) {
      req.session.authorised = true;
      req.session.fname = results[0].user_fname;
      res.redirect('/');
    } else {
      res.send("Invalid email or password");
    }
  });
});

router.get('/exit', function (req, res, next) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

module.exports = router;