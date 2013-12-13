var express = require('express');
var etm = require('../'); // require('express-middleware-timer');

var app = express();

/***
 * Initialize express-timer-middleware
 ***************************************************/
app.use(etm.init);

/***
 * time slow middleware
 * - non-anon middleware don't require names
 ***************************************************/
function slowMiddleware(req, res, next) {
    setTimeout(function() {
        next();
    }, 200);
}

app.use(etm.instrument(slowMiddleware));

/***
 * time fast middleware
 * - anon middleware require names
 ***************************************************/
var fastMiddleware = function(req, res, next) {
    next();
};

app.use(etm.instrument(fastMiddleware, 'fastMiddleware'));

/***
 * Report results.
 ***************************************************/
app.use(etm.report);

/***
 * Route
 ***************************************************/
app.get('/', function(req,res) {
    res.send('hello world');
});

/***
 * Start
 ***************************************************/
app.listen(3000);
console.log('Listening on port 3000');
