// Just serves the app, for quick tests

var path = require('path');
var express = require("express");

var app = express();

var port = 8080;

app.use(express.static('./public'));
app.listen(port, function ()
{
	console.log('Server running on port ' + port);
});
app.get('*', function (req, res)
{
	res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.use(function (req, res, next)
{
	res.status(404);

	// respond with html page
	if (req.accepts('html'))
	{
		res.render('404', { url: req.url });
		return;
	}

	// respond with json
	if (req.accepts('json'))
	{
		res.send({ error: 'Not found' });
		return;
	}

	// default to plain-text. send()
	res.type('txt').send('Not found');
});
