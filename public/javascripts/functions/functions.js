var stringToBase64 = function (s) {
	// first we use encodeURIComponent to get percent-encoded UTF-8,
	// then we convert the percent encodings into raw bytes which
	// can be fed into btoa.
	return btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode('0x' + p1);
	}))
}
var stringFromBase64 = function (s) {
	// Going backwards: from bytestream, to percent-encoding, to original string.
	return decodeURIComponent(atob(s).split('').map(function(c) {
		return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));
}    
