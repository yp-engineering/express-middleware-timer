var OFF = (!process.env.TIMER);

var instrumented = 0;
function instrument(middleware, name) {
    if (OFF) return middleware;

    function bindWrapper(m, name) {
        return function wrapper(req, res, next) {
            var start = Date.now();
            m(req,res,function instrumentedNext() {
                var end = Date.now();
                var args = Array.prototype.slice.call(arguments);

                if (res._timer && res._timer.times) {
                    res._timer.times[name] = {
                        from_start: start-res._timer.start,
                        took: end-start
                    };
                    res._timer.last = end;
                }

                next.apply(this, args);
            });
        };
    }

    if (typeof middleware === 'function') {
        var position = instrumented++;
        name = name || middleware.name || 'anonymous middlware #'+position;
        return bindWrapper(middleware, name);
    }

    var itter = 0; // if named
    return middleware.map(function(m) {
        var position = instrumented++;
        var newname;
        if (name) {
            newname = name + ' #' + itter++;
        }
        newname = newname || m.name || 'anonymous middlware #'+position;
        return bindWrapper(m, newname);
    });
}

function calculate(req, res) {
    // sillyness to cleanup reporting
    var report = {
        request: { url: req.url, headers: req.headers },
        timers: { startup: { from_start: 0, took: 0 } }
    };

    var reportedTimers = res._timer.times;

    Object.keys(reportedTimers).forEach(function(timer) {
        report.timers[timer] = {
            from_start: reportedTimers[timer].from_start,
            took: reportedTimers[timer].took,
        }
    });

    return report;
}

function report(req, res) {
    if (OFF || !res._timer || !res._timer.times) return;

    // report
    console.log('------------------------------');
    console.dir(calculate(req, res));
    console.log('------------------------------');
}

function init(reporter) {
    return function (req, res, next) {
        if (OFF) return next();

        var now = Date.now();
        res._timer = {
            start: now,
            last:  now,
            times: {}
        };

        reporter = (typeof reporter === 'function') ? reporter : report;

        res.on('finish', function onResponseFinish() {
            reporter(req, res);
        });

        next();
    };
}

module.exports = {
    instrument: instrument,
    init: init,
    calculate: calculate,
    on: (!OFF),
    off: OFF
};

