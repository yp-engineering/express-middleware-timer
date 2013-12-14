var OFF = (!process.env.TIMER);

var instrumented = 0;
function instrument(middleware, name) {
    if (OFF) return middleware;

    function bindWrapper(m, name) {
        return function wrapper(req, res, next) {
            if (res._timer && res._timer.times) {
                res._timer.times[name] = {
                    from_start: Date.now()-res._timer.start,
                    last: Date.now()-res._timer.last
                };
                res._timer.last = Date.now();
            }
            m(req,res,next);
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

function init(req, res, next) {
    if (OFF) return next();

    res._timer = {
        start: Date.now(),
        last:  Date.now(),
        times: {}
    };
    next();
}

function report(req,res,next) {
    if (OFF || !res._timer || !res._timer.times) return next();

    // sillyness to cleanup reporting
    var report = {
        request: { url: req.url, headers: req.headers },
        timers: { startup: { from_start: 0 } }
    };

    var reportedTimers = res._timer.times;

    function updateReport(timer) {
        var reportNames = Object.keys(report.timers);
        var lastReport  = reportNames[reportNames.length-1];

        if (typeof timer === 'string') {
            report.timers[lastReport].took = reportedTimers[timer].last;
            report.timers[lastReport].from_start = reportedTimers[timer].from_start;
            report.timers[timer] = {};
        } else {
            report.timers[lastReport].took = Date.now()-timer.last;
            report.timers[lastReport].from_start = Date.now()-timer.start;
        }
    }

    Object.keys(reportedTimers).forEach(function(timer) {
        updateReport(timer);
    });

    updateReport(res._timer);

    // report
    console.log('------------------------------');
    console.dir(report);
    console.log('------------------------------');
    next();
}

module.exports = {
    instrument: instrument,
    init: init,
    report: report
};


