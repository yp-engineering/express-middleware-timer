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
var fs     = require('fs');
var format = require('util').format;
app.use(function(req, res, next) {
    // Call next right away for performance.
    next();

    // Write report to file.
    var report = emt.calculate(req, res);

    var out = format('%s,%s,%s,%s\n',
                new Date(),
                report.request.url,
                report.timers.slowMiddleware.took,
                report.timers.fastMiddleware.took);

    fs.appendFile('emt.log', out, function(err) {
        if (err) console.trace(err);
    });

    /***
     * Outputs something like the following...

     * Sat Dec 14 2013 14:17:00 GMT-0800 (PST),/,202,10
     * Sat Dec 14 2013 14:17:02 GMT-0800 (PST),/,201,2
     * Sat Dec 14 2013 14:17:03 GMT-0800 (PST),/,200,1
     *
     * You can also do things like save report to mongo or redis.
     */
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
