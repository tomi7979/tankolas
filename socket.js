module.exports = function(io){
	io.sockets.on('connection', function (socket) {
		console.log("User connected!");
		socket.on("error", (err) => {
			console.log("Caught flash policy server socket error: ");
			console.log(err.stack);
		});
	});
};

