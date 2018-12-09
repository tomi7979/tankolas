var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('tankolas/fuelingMain', { title: 'Tankolas' });
});
router.get('/fueling', function(req, res, next) {
	res.render('tankolas/fueling', { title: 'Tankolás rögzítése' });
});
router.get('/daily', function(req, res, next) {
	res.render('tankolas/report', { title: 'Napi fogyasztás', period:'daily' });
});
router.get('/weekly', function(req, res, next) {
	res.render('tankolas/report', { title: 'Heti fogyasztás', period:'weekly' });
});
router.get('/monthly', function(req, res, next) {
	res.render('tankolas/report', { title: 'Havi fogyasztás', period:'monthly' });
});

module.exports = router;
