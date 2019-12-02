'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');
var urlib = require('url');
var http = require('http');
var qs = require('qs');

var request = require('request-compose').extend({
  Request: { cookie: require('request-cookie').Request },
  Response: { cookie: require('request-cookie').Response }
}).client;

var _express = require('express');
var session = require('express-session');

var Koa = require('koa');
var koasession = require('koa-session');
var mount = require('koa-mount');
var convert = require('koa-convert');
var koaqs = require('koa-qs');

var Hapi = require('hapi');
var yar = require('yar');

var Grant = require('../../');

var _Koa = Koa;
Koa = function Koa() {
  var version = parseInt(require('koa/package.json').version.split('.')[0]);

  var app = new _Koa();

  if (version >= 2) {
    var _use = app.use;
    app.use = function (mw) {
      return _use.call(app, convert(mw));
    };
  }

  return app;
};
var hapi = parseInt(require('hapi/package.json').version.split('.')[0]);

var sign = function sign() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.map(function (arg, index) {
    return index < 2 ? Buffer.from(JSON.stringify(arg)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') : arg;
  }).join('.');
};

var port = { auth: 5000, app: 5001 };
var url = {
  auth: function auth(path) {
    return `http://localhost:${port.auth}${path}`;
  },
  app: function app(path) {
    return `http://localhost:${port.app}${path}`;
  }
};
var client = require('./util/client');

describe('consumer - error', function () {

  describe('missing session middleware', function () {
    ;['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            consumer = name,
            config = {};

        var servers = {
          express: function express(done) {
            var grant = Grant.express()(config);
            var app = _express().use(grant);
            app.use(function (err, req, res, next) {
              t.equal(err.message, 'Grant: mount session middleware first');
              next();
            });
            server = app.listen(port.app, done);
          },
          koa: function koa(done) {
            var grant = Grant.koa()(config);
            var app = new Koa();
            app.use( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return next;

                    case 3:
                      _context.next = 8;
                      break;

                    case 5:
                      _context.prev = 5;
                      _context.t0 = _context['catch'](0);

                      t.equal(_context.t0.message, 'Grant: mount session middleware first');

                    case 8:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, this, [[0, 5]]);
            }));
            app.use(grant);
            server = app.listen(port.app, done);
          },
          hapi: function hapi(done) {
            var grant = Grant.hapi()();
            server = new Hapi.Server({ debug: { request: false } });
            server.connection({ host: 'localhost', port: port.app });

            server.register([{ register: grant, options: config }], function (err) {
              if (err) {
                done(err);
                return;
              }

              server.on('request-error', function (req, err) {
                t.equal(err.message, 'Uncaught error: Grant: register session plugin first');
              });

              server.start(done);
            });
          },
          hapi17: function hapi17(done) {
            var grant = Grant.hapi()();
            server = new Hapi.Server({ host: 'localhost', port: port.app });

            server.events.on('request', function (event, tags) {
              t.equal(tags.error.message, 'Grant: register session plugin first');
            });

            server.register([{ plugin: grant, options: config }]).then(function () {
              server.start().then(done).catch(done);
            }).catch(done);
          }
        };

        before(function (done) {
          servers[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](done);
        });

        it('throw', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.prev = 0;
                  _context2.next = 3;
                  return request({
                    url: url.app('/connect/grant'),
                    cookie: {}
                  });

                case 3:
                  _context2.next = 7;
                  break;

                case 5:
                  _context2.prev = 5;
                  _context2.t0 = _context2['catch'](0);

                case 7:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined, [[0, 5]]);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });
  });

  describe('missing body-parser middleware', function () {
    ;['express', 'koa'].forEach(function (name) {
      describe(name, function () {
        var server,
            consumer = name,
            config = {};

        var servers = {
          express: function express(done) {
            var grant = Grant.express()(config);
            var app = _express();
            app.use(session({ secret: 'grant', saveUninitialized: true, resave: true }));
            app.use(grant);
            app.use(function (err, req, res, next) {
              t.equal(err.message, 'Grant: mount body parser middleware first');
              next();
            });
            server = app.listen(port.app, done);
          },
          koa: function koa(done) {
            var grant = Grant.koa()(config);
            var app = new Koa();
            app.keys = ['grant'];
            app.use(koasession(app));
            app.use( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(next) {
              return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      _context3.prev = 0;
                      _context3.next = 3;
                      return next;

                    case 3:
                      _context3.next = 8;
                      break;

                    case 5:
                      _context3.prev = 5;
                      _context3.t0 = _context3['catch'](0);

                      t.equal(_context3.t0.message, 'Grant: mount body parser middleware first');

                    case 8:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _callee3, this, [[0, 5]]);
            }));
            app.use(grant);
            server = app.listen(port.app, done);
          }
        };

        before(function (done) {
          servers[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](done);
        });

        it('throw', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  _context4.next = 3;
                  return request({
                    method: 'POST',
                    url: url.app('/connect/grant'),
                    cookie: {}
                  });

                case 3:
                  _context4.next = 7;
                  break;

                case 5:
                  _context4.prev = 5;
                  _context4.t0 = _context4['catch'](0);

                case 7:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, undefined, [[0, 5]]);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });
  });

  describe('oauth2 - authorize - missing code + response message', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (/^\/authorize_url/.test(req.url)) {
          var location = url.app('/connect/grant/callback') + '?' + qs.stringify({ error: { message: 'invalid', code: '500' } });
          res.writeHead(302, { location });
          res.end();
        }
      });
      server.listen(port.auth, done);
    });['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            oauth: 2
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var obj;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context5.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, undefined);
        })));

        it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
          var assert;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  assert = function () {
                    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(message) {
                      var _ref6, response;

                      return regeneratorRuntime.wrap(function _callee6$(_context6) {
                        while (1) {
                          switch (_context6.prev = _context6.next) {
                            case 0:
                              _context6.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref6 = _context6.sent;
                              response = _ref6.body.response;

                              t.deepEqual(response, { error: { error: { message: 'invalid', code: '500' } } }, message);

                            case 5:
                            case 'end':
                              return _context6.stop();
                          }
                        }
                      }, _callee6, undefined);
                    }));

                    return function assert(_x) {
                      return _ref5.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context7.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context7.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context7.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context7.stop();
              }
            }
          }, _callee7, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });

    after(function (done) {
      server.close(done);
    });
  });

  describe('oauth2 - authorize - missing code without response message', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (/^\/authorize_url/.test(req.url)) {
          var location = url.app('/connect/grant/callback');
          res.writeHead(302, { location });
          res.end();
        }
      });
      server.listen(port.auth, done);
    });['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            oauth: 2
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
          var obj;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  _context8.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context8.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, undefined);
        })));

        it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
          var assert;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  assert = function () {
                    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(message) {
                      var _ref10, response;

                      return regeneratorRuntime.wrap(function _callee9$(_context9) {
                        while (1) {
                          switch (_context9.prev = _context9.next) {
                            case 0:
                              _context9.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref10 = _context9.sent;
                              response = _ref10.body.response;

                              t.deepEqual(response, { error: { error: 'Grant: OAuth2 missing code parameter' } }, message);

                            case 5:
                            case 'end':
                              return _context9.stop();
                          }
                        }
                      }, _callee9, undefined);
                    }));

                    return function assert(_x2) {
                      return _ref9.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context10.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context10.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context10.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context10.stop();
              }
            }
          }, _callee10, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });

    after(function (done) {
      server.close(done);
    });
  });

  describe('oauth2 - authorize - state mismatch', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (/^\/authorize_url/.test(req.url)) {
          var location = url.app('/connect/grant/callback') + '?' + qs.stringify({ code: 'code', state: 'Purest' });
          res.writeHead(302, { location });
          res.end();
        }
      });
      server.listen(port.auth, done);
    });['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            oauth: 2,
            state: 'Grant'
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
          var obj;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context11.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context11.stop();
              }
            }
          }, _callee11, undefined);
        })));

        it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
          var assert;
          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  assert = function () {
                    var _ref13 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(message) {
                      var _ref14, response;

                      return regeneratorRuntime.wrap(function _callee12$(_context12) {
                        while (1) {
                          switch (_context12.prev = _context12.next) {
                            case 0:
                              _context12.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref14 = _context12.sent;
                              response = _ref14.body.response;

                              t.deepEqual(response, { error: { error: 'Grant: OAuth2 state mismatch' } }, message);

                            case 5:
                            case 'end':
                              return _context12.stop();
                          }
                        }
                      }, _callee12, undefined);
                    }));

                    return function assert(_x3) {
                      return _ref13.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context13.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context13.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context13.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context13.stop();
              }
            }
          }, _callee13, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });

    after(function (done) {
      server.close(done);
    });
  });

  describe('oauth2 - authorize - nonce mismatch', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (/^\/authorize_url/.test(req.url)) {
          var location = url.app('/connect/grant/callback') + '?' + qs.stringify({ code: 'code' });
          res.writeHead(302, { location });
          res.end();
        } else if (/^\/access_url/.test(req.url)) {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({ id_token: sign({ typ: 'JWT' }, { nonce: 'Purest' }, 'signature') }));
        }
      });
      server.listen(port.auth, done);
    });['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            access_url: url.auth('/access_url'),
            oauth: 2,
            nonce: 'Grant'
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          var obj;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context14.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context14.stop();
              }
            }
          }, _callee14, undefined);
        })));

        it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
          var assert;
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  assert = function () {
                    var _ref17 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15(message) {
                      var _ref18, response;

                      return regeneratorRuntime.wrap(function _callee15$(_context15) {
                        while (1) {
                          switch (_context15.prev = _context15.next) {
                            case 0:
                              _context15.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref18 = _context15.sent;
                              response = _ref18.body.response;

                              t.deepEqual(response, { error: 'Grant: OpenID Connect nonce mismatch' }, message);

                            case 5:
                            case 'end':
                              return _context15.stop();
                          }
                        }
                      }, _callee15, undefined);
                    }));

                    return function assert(_x4) {
                      return _ref17.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context16.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context16.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context16.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context16.stop();
              }
            }
          }, _callee16, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });

    after(function (done) {
      server.close(done);
    });
  });

  describe('oauth2 - access - error response', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (/^\/authorize_url/.test(req.url)) {
          var location = url.app('/connect/grant/callback') + '?' + qs.stringify({ code: 'code' });
          res.writeHead(302, { location });
          res.end();
        } else if (/^\/access_url/.test(req.url)) {
          res.writeHead(500, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({ error: { message: 'invalid', code: '500' } }));
        }
      });
      server.listen(port.auth, done);
    });['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            access_url: url.auth('/access_url'),
            oauth: 2
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
          var obj;
          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  _context17.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context17.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context17.stop();
              }
            }
          }, _callee17, undefined);
        })));

        it('access', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
          var assert;
          return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  assert = function () {
                    var _ref21 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(message) {
                      var _ref22, response;

                      return regeneratorRuntime.wrap(function _callee18$(_context18) {
                        while (1) {
                          switch (_context18.prev = _context18.next) {
                            case 0:
                              _context18.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref22 = _context18.sent;
                              response = _ref22.body.response;

                              t.deepEqual(response, { error: { error: { message: 'invalid', code: '500' } } }, message);

                            case 5:
                            case 'end':
                              return _context18.stop();
                          }
                        }
                      }, _callee18, undefined);
                    }));

                    return function assert(_x5) {
                      return _ref21.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context19.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context19.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context19.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context19.stop();
              }
            }
          }, _callee19, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });

    after(function (done) {
      server.close(done);
    });
  });

  describe('missing session or misconfigured provider', function () {
    ;['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          grant: {}
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
          var obj;
          return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _context20.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context20.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context20.stop();
              }
            }
          }, _callee20, undefined);
        })));

        it('/connect - misconfigured provider - with callback', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
          var assert;
          return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  grant.config.grant.callback = '/';

                  assert = function () {
                    var _ref25 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21(message) {
                      var _ref26, response;

                      return regeneratorRuntime.wrap(function _callee21$(_context21) {
                        while (1) {
                          switch (_context21.prev = _context21.next) {
                            case 0:
                              _context21.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref26 = _context21.sent;
                              response = _ref26.body.response;

                              t.deepEqual(response, { error: 'Grant: missing or misconfigured provider' }, message);

                            case 5:
                            case 'end':
                              return _context21.stop();
                          }
                        }
                      }, _callee21, undefined);
                    }));

                    return function assert(_x6) {
                      return _ref25.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context22.next = 5;
                  return assert('no transport');

                case 5:
                  grant.config.grant.transport = 'querystring';
                  _context22.next = 8;
                  return assert('querystring transport');

                case 8:
                  grant.config.grant.transport = 'session';
                  _context22.next = 11;
                  return assert('session transport');

                case 11:
                case 'end':
                  return _context22.stop();
              }
            }
          }, _callee22, undefined);
        })));

        it('/connect - misconfigured provider - no callback', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
          var _ref28, body;

          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  delete grant.config.grant.callback;
                  _context23.next = 3;
                  return request({
                    url: url.app('/connect/grant'),
                    cookie: {}
                  });

                case 3:
                  _ref28 = _context23.sent;
                  body = _ref28.body;

                  t.deepEqual(qs.parse(body), {
                    error: 'Grant: missing or misconfigured provider'
                  });

                case 6:
                case 'end':
                  return _context23.stop();
              }
            }
          }, _callee23, undefined);
        })));

        it('/connect - missing provider - non preconfigured no dynamic', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
          var _ref30, body;

          return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  _context24.next = 2;
                  return request({
                    url: url.app('/connect/purest'),
                    cookie: {}
                  });

                case 2:
                  _ref30 = _context24.sent;
                  body = _ref30.body;

                  t.deepEqual(qs.parse(body), { error: 'Grant: missing or misconfigured provider' }, 'message');

                case 5:
                case 'end':
                  return _context24.stop();
              }
            }
          }, _callee24, undefined);
        })));

        it('/callback - missing session', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
          var _ref32, body;

          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  _context25.next = 2;
                  return request({
                    url: url.app('/connect/grant/callback'),
                    cookie: {}
                  });

                case 2:
                  _ref32 = _context25.sent;
                  body = _ref32.body;

                  t.deepEqual(qs.parse(body), {
                    error: 'Grant: missing session or misconfigured provider'
                  });

                case 5:
                case 'end':
                  return _context25.stop();
              }
            }
          }, _callee25, undefined);
        })));

        after(function (done) {
          consumer === 'hapi' && hapi >= 17 ? server.stop().then(done) : server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });
      });
    });
  });
});