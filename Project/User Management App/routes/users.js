var express = require('express');
var router = express.Router();
var db = require('../db');

const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Register'
  });
});

router.post('/register', async function (req, res, next) {
  const email = req.body.email;
  const password = req.body.psw;
  const name = req.body.fname;

  if (!email || !password || !name) {
    return res.status(400).send("All fields are required");
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  var sqlQuery = "INSERT INTO users VALUES(NULL, ?, ?, ?)";
  var values = [email, hashedPassword, name];

  db.query(sqlQuery, values, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      return res.send("Register Error: " + err.message);
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
  const email = req.body.email;
  const password = req.body.psw;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send("Invalid email address");
  }

  var sqlQuery = "SELECT * FROM users WHERE user_email = ?";
  var values = [email];

  db.query(sqlQuery, values, async function (err, results, fields) {
    if (err) {
      console.log(err.message);
      return res.send("Login Error: " + err.message);
    }

    if (results.length == 1) {
      const isMatch = await bcrypt.compare(password, results[0].user_pass);

      if (isMatch) {
        req.session.authorised = true;
        req.session.fname = results[0].user_fname;

        const token = jwt.sign(
          { id: results[0].user_id, email: results[0].user_email },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        console.log("JWT Token:", token);

        res.redirect('/');
      } else {
        res.send("Invalid email or password");
      }
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