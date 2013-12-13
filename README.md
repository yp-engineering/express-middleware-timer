express-middleware-timer
========================

A simple timer implementation for debugging express middleware.

> By default, `express-middleware-timer` does nothing. It's only activated
> when your application is started with `TIMER=true`.


Implementation
--------------

> Note:
>
> See [`examples/app.js`](examples/app.js) for a detailed working example.

``` javascript
// require module
var etm = require('express-middleware-timer');

// init timer
app.use(etm.init);

// instrument middleware
app.use(etm.instrument(myMiddleware), 'myMiddleware');

// call report
app.use(etm.report);

// routes
app.get('/', myRoute);

// start
app.listen(3000);
```

Start Application
-----------------

To enable your timer, start your application with `TIMER=true`.

``` shell
TIMER=true node ./app.js

# to start the example
TIMER=true node ./example/app.js
```

Sample Log Output
-----------------

> Note:
>
> See [`examples/app.js`](examples/app.js) for the code that generated this output.

``` json
{ request:
   { url: '/',
     headers:
      { host: 'localhost:3000',
        connection: 'keep-alive',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/30.0.1599.114 Chrome/30.0.1599.114 Safari/537.36',
        'accept-encoding': 'gzip,deflate,sdch',
        'accept-language': 'en-US,en;q=0.8',
        'if-none-match': '"222957957"' } },
  timers:
   { startup: { from_start: 0, took: 0 },
     slowMiddleware: { took: 201, from_start: 201 },
     fastMiddleware: { took: 0, from_start: 201 } } }
```

Run Unit Tests
--------------

``` shell
npm install
npm test
```

