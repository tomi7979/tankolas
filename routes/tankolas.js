var express = require('express');
var router = express.Router();
var socket=require('../socket.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('tankolas/tankolas', { title: 'Tankolas' });
});
router.get('/fueling', function(req, res, next) {
	res.render('tankolas/fueling', { title: 'Tankolás rögzítése' });
});
router.get('/napi', function(req, res, next) {
	res.render('tankolas/napi', { title: 'Napi fogyasztás' });
});
router.get('/heti', function(req, res, next) {
	res.render('tankolas/heti', { title: 'Heti fogyasztés' });
});
router.get('/havi', function(req, res, next) {
	res.render('tankolas/havi', { title: 'Havi fogyasztás' });
});

module.exports = router;
