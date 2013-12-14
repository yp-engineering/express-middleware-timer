var express = require('express');
var emt = require('../'); // require('express-middleware-timer');

var app = express();

/***
 * In this example, I'm going to call middleware in
 * the route. So I'm going to create an array of
 * middleware, instrument them and then unshift init
 * and push report.
 *
 * See: example/app1.js for a more basic example.
 ***************************************************/

/***
 * time slow middleware
 * - non-anon middleware don't require names
 ***************************************************/
function slowMiddleware(req, res, next) {
    setTimeout(function() {
        next();
    }, 200);
}

/***
 * time fast middleware
 ***************************************************/
function fastMiddleware(req, res, next) {
    next();
};


/***
 * Define middleware stack with instrumentation.
 ***************************************************/
var middlewares = emt.instrument([
    slowMiddleware,
    fastMiddleware
]);

/***
 * Add init to the beginning of the middleware stack.
 ***************************************************/
middlewares.unshift(emt.init);

/***
 * Add report to the end of the middleware stack.
 ***************************************************/
middlewares.push(emt.report);

/***
 * Route contain middleware.
 ***************************************************/
app.get('/', middlewares, function(req,res) {
    res.send('hello world');
});

/***
 * Start
 ***************************************************/
app.listen(3000);
console.log('Listening on port 3000');
