process.env.TIMER = true;

var assert = require('assert');
var emt = require('../');

var req = {
    url: '/foo/bar',
    headers: {
        foo: 'bar'
    }
};

function onEvent(e, cb) {
    return { event: e, callback: cb };
}

describe('init', function() {
    it('should init timer', function() {

        var res = {
            on: onEvent
        };

        var nextCalled;
        var next = function next() { nextCalled = true; };

        emt.init()(req, res, next);

        assert.equal(typeof res._timer.start, 'number');
        assert.equal(typeof res._timer.last, 'number');
        assert.ok(res._timer.times);
        assert.ok(nextCalled);

    });
});

describe('calculate', function () {
    it('should return report json', function() {
        var res = {
            _timer: {
                start: Date.now(),
                last:  Date.now(),
                times: {
                }
            }
        };

        var report = emt.calculate(req,res);
        assert.equal(report.request.url, '/foo/bar');
        assert.equal(report.request.headers.foo, 'bar');
        assert.equal(typeof report.timers.startup.from_start, 'number');
        assert.equal(typeof report.timers.startup.took, 'number');
    });
});

describe('instrument', function() {
    describe('one', function() {
        it('should instrument a timer', function() {

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

            var instrumented = emt.instrument(middleware);

            instrumented(req,res,next);

            assert.equal(typeof res._timer.times.middleware.from_start, 'number');
            assert.equal(typeof res._timer.times.middleware.took, 'number');
            assert.ok(nextCalled);
        });
    });
    describe('many', function() {
        it('should instrument all timers', function() {

            var res = {
                _timer: {
                    start: Date.now(),
                    last:  Date.now(),
                    times: {
                    }
                }
            };

            var nextCalled = 0;
            var next = function next() { nextCalled++; };

            var middlewares = [
                function(req,res,next) {
                    next();
                },
                function(req,res,next) {
                    next();
                }
            ];

            var instrumented = emt.instrument(middlewares, 'many');

            instrumented.forEach(function(middleware) {
                middleware(req,res,next);
            });

            assert.equal(typeof res._timer.times['many #0'].from_start, 'number');
            assert.equal(typeof res._timer.times['many #1'].took, 'number');
            assert.equal(nextCalled, 2);
        });

        it('should count parallel flows correctly', function(testDone) {
            var res = {
                _timer: {
                    start: Date.now(),
                    last:  Date.now(),
                    times: {
                    }
                }
            };

            var nextCalled = 0;
            var next = function next() { nextCalled++; console.log('nextCalled')};

            var middlewaresParallel = [
                function(req,res,next) {
                    setTimeout(function() {
                        next();
                    }, 20)
                },
                function(req,res,next) {
                    setTimeout(function() {
                        next();
                    }, 30)
                }
            ];

            var instrumented = emt.instrument(middlewaresParallel, 'many');

            var master = emt.instrument(function(req,res,next) {
                var count = 0;
                instrumented.forEach(function(middleware) {
                    middleware(req,res,function fakeNext() {
                        count++;
                        if (count === instrumented.length) {
                            next();
                        }
                    });
                });
            }, 'master');


            function middlewareLoop(middlewares) {
                var mw = middlewares.shift();
                if (mw) {
                    mw(req, res, function() {
                        middlewareLoop(middlewares);
                    })
                }
            }

            var start = Date.now();
            middlewareLoop([
                master,
                function() {
                    var end = Date.now();
                    var totalTime = end-start;

                    // console.log(res._timer);
                    assert(totalTime < 40, 'totatime');
                    assert(res._timer.last - res._timer.last < 40, 'report time');
                    Object.keys(res._timer.times).forEach(function(name) {
                        var timer = res._timer.times[name];
                        assert(timer.took < 40, 'each middleware time');
                    })
                    testDone();
                }
            ])
        })
    });
});

describe('on off', function() {
    it('should be on', function() {
        assert.deepEqual(emt.on, true);
        assert.deepEqual(emt.off, false);
    });
});

