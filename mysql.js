
var mysql = require('mysql');
var settings=require('settings.js');

var connection = mysql.createConnection(settings.mysql.connectionString);

connection.connect();

connection.query('SELECT * FROM nt.fuelUsage', function (err, rows, fields) {
  if (err) throw err

  console.log('The solution is: ', rows[0]);
});

connection.end();