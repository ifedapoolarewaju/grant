'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');

var request = require('request-compose').extend({
  Request: { cookie: require('request-cookie').Request },
  Response: { cookie: require('request-cookie').Response }
}).client;

var hapi = parseInt(require('hapi/package.json').version.split('.')[0]);

var port = { auth: 5000, app: 5001 };
var url = {
  auth: function auth(path) {
    return `http://localhost:${port.auth}${path}`;
  },
  app: function app(path) {
    return `http://localhost:${port.app}${path}`;
  }
};

var provider = require('./util/provider');
var client = require('./util/client');

describe('consumer - flow', function () {

  describe('oauth1', function () {
    var server;

    before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return provider.oauth1(port.auth);

            case 2:
              server = _context.sent;

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: {
            protocol: 'http', host: `localhost:${port.app}`, callback: '/'
          },
          grant: {
            request_url: url.auth('/request_url'),
            authorize_url: url.auth('/authorize_url'),
            access_url: url.auth('/access_url'),
            oauth: 1
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var obj;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context2.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined);
        })));

        it('flow', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var assert;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  assert = function () {
                    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(message) {
                      var _ref5, response;

                      return regeneratorRuntime.wrap(function _callee3$(_context3) {
                        while (1) {
                          switch (_context3.prev = _context3.next) {
                            case 0:
                              _context3.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref5 = _context3.sent;
                              response = _ref5.body.response;

                              t.deepEqual(response, {
                                access_token: 'token', access_secret: 'secret',
                                raw: { oauth_token: 'token', oauth_token_secret: 'secret' }
                              }, message);

                            case 5:
                            case 'end':
                              return _context3.stop();
                          }
                        }
                      }, _callee3, undefined);
                    }));

                    return function assert(_x) {
                      return _ref4.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context4.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context4.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context4.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, undefined);
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

  describe('oauth2', function () {
    var server;

    before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return provider.oauth2(port.auth);

            case 2:
              server = _context5.sent;

            case 3:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));['express', 'koa', 'hapi'].forEach(function (name) {
      describe(name, function () {
        var server,
            grant,
            consumer = name;
        var config = {
          defaults: { protocol: 'http', host: `localhost:${port.app}`, callback: '/' },
          grant: {
            authorize_url: url.auth('/authorize_url'),
            access_url: url.auth('/access_url'),
            oauth: 2
          }
        };

        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
          var obj;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return client[consumer === 'hapi' ? `${consumer}${hapi < 17 ? '' : '17'}` : consumer](config, port.app);

                case 2:
                  obj = _context6.sent;

                  server = obj.server;
                  grant = obj.grant;

                case 5:
                case 'end':
                  return _context6.stop();
              }
            }
          }, _callee6, undefined);
        })));

        it('flow', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
          var assert;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  assert = function () {
                    var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(message) {
                      var _ref10, response;

                      return regeneratorRuntime.wrap(function _callee7$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              _context7.next = 2;
                              return request({
                                url: url.app('/connect/grant'),
                                cookie: {}
                              });

                            case 2:
                              _ref10 = _context7.sent;
                              response = _ref10.body.response;

                              t.deepEqual(response, {
                                access_token: 'token', refresh_token: 'refresh',
                                raw: { access_token: 'token', refresh_token: 'refresh', expires_in: '3600' }
                              }, message);

                            case 5:
                            case 'end':
                              return _context7.stop();
                          }
                        }
                      }, _callee7, undefined);
                    }));

                    return function assert(_x2) {
                      return _ref9.apply(this, arguments);
                    };
                  }();

                  delete grant.config.grant.transport;
                  _context8.next = 4;
                  return assert('no transport');

                case 4:
                  grant.config.grant.transport = 'querystring';
                  _context8.next = 7;
                  return assert('querystring transport');

                case 7:
                  grant.config.grant.transport = 'session';
                  _context8.next = 10;
                  return assert('session transport');

                case 10:
                case 'end':
                  return _context8.stop();
              }
            }
          }, _callee8, undefined);
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
});