var pool = require('./mysql.js');

module.exports = function(io){
	io.sockets.on('connection', function (socket) {
		console.log("User connected!");
		// socket.on("error", (err) => {
		// 	console.log("Caught flash policy server socket error: ");
		// 	console.log(err.stack);
		// });
		
		socket.on('getFueling',function(){
			let sql="CALL nt.p_getFueling;"
			pool.query(sql, function (err, rows, fields) {
				if (err) console.log(err)
				// if (err) throw err
				socket.emit('resFueling',rows[0]);						
			});
		});
		socket.on('fueling', function (data) {
			console.log(data);
			let sql="CALL nt.p_insertFueling ('" + data._date + "'," + data._quantity + ",null," + data._drivenKm + "," + data._totalPrice + ",'" + data._place + "');";
			pool.query(sql, function (err, rows, fields) {
				if (err) console.log(err)
				// if (err) throw err
				socket.emit('resFuelUsageDaily',rows);						
			});
			

			socket.emit('resFueling','siker');

		});
		socket.on('getFuelUsage',function(period){
			console.log(period)
			let sql="CALL nt.p_getFuelUsage('" + period + "');";
			pool.query(sql, function (err, rows, fields) {
				if (err) console.log(err)
				// if (err) throw err
				socket.emit('resFuelUsage',rows);						
			});
		});
	});
};

