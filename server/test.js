var express = require('express');

var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/thanks', function(req, res){
	console.log('connection');
	res.sendFile(__dirname + '/public/thanks.html');
});

app.listen(8888, '0.0.0.0', () => {
	console.log('Listening');
});
