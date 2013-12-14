var express = require('express');
var emt = require('../'); // require('express-middleware-timer');

var app = express();

/***
 * Initialize express-timer-middleware
 ***************************************************/
app.use(emt.init);

/***
 * time slow middleware
 * - non-anon middleware don't require names
 ***************************************************/
function slowMiddleware(req, res, next) {
    setTimeout(function() {
        next();
    }, 200);
}

app.use(emt.instrument(slowMiddleware));

/***
 * time fast middleware
 * - anon middleware require names
 ***************************************************/
var fastMiddleware = function(req, res, next) {
    next();
};

app.use(emt.instrument(fastMiddleware, 'fastMiddleware'));

/***
 * Custom Reporting
 ***************************************************/
var fs = require('fs');
app.use(function(req, res, next) {
    // Call next right away for performance.
    next();

    // Write report to file.
    var report = emt.calculate(req, res);
    fs.writeFile('emt.log', JSON.stringify(report, null, 2), function(err) {
        if (err) console.trace(err);
    });

    // You can also do things like save report to mongo or redis.
});

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
