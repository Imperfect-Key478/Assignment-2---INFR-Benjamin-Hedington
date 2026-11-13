
var express = require('express');
var router = express.Router();

// Home page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

// About Me page
router.get('/aboutme', function(req, res, next) {
  res.render('aboutme', { title: 'About Me' });
});

// Projects page
router.get('/projects', function(req, res, next) {
  res.render('projects', { title: 'Projects' });
});

// Contact Me page
router.get('/contactme', function(req, res, next) {
  res.render('contactme', { title: 'Contact Me' });
});

module.exports = router;
