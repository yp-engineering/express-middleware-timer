process.env.TIMER = true;

var assert = require('assert');
var performance = require('../');

var req = { headers: {} };

describe('init', function() {
    it('should init timer', function() {

        var res = { };

        var nextCalled;
        var next = function next() { nextCalled = true; };

        performance.init(req,res,next);
        assert.equal(typeof res._timer.start, 'number');
        assert.equal(typeof res._timer.last, 'number');
        assert.ok(res._timer.times);
        assert.ok(nextCalled);

    });
});

describe('report', function() {
    it('should call next', function() {
        var res = {
            _timer: {
                start: Date.now(),
                last:  Date.now(),
                times: {
                }
            }
        };

        var nextCalled;
        var next = function next() { nextCalled = true; };

        // disable console.log && console.dir
        var calledLog, calledDir;
        var log = console.log;
        var dir = console.dir;
        console.log = function(){ calledLog = true; };
        console.dir = function(){ calledDir = true; };

        performance.report(req,res,next);

        // enable console.log && console.dir
        console.log = log;
        console.dir = dir;

        assert.ok(nextCalled);
        assert.ok(calledLog);
        assert.ok(calledDir);

    });
});

describe('instrument', function() {
    it('should instrument timers', function() {

        var res = {
            _timer: {
                start: Date.now(),
                last:  Date.now(),
                times: {
                }
            }
        };

        var nextCalled;
        var next = function next() { nextCalled = true; };

        function middleware(req,res,next) {
            next();
        }

        var instrumented = performance.instrument(middleware);

        instrumented(req,res,next);

        assert.equal(typeof res._timer.times.middleware.from_start, 'number');
        assert.equal(typeof res._timer.times.middleware.last, 'number');
        assert.ok(nextCalled);
    });
});

