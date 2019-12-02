'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');

var request = require('request-compose').extend({
  Request: { cookie: require('request-cookie').Request },
  Response: { cookie: require('request-cookie').Response }
}).client;

var port = { oauth2: 5001, app: 5002 };
var url = {
  oauth2: function oauth2(path) {
    return `http://localhost:${port.oauth2}${path}`;
  },
  app: function app(path) {
    return `http://localhost:${port.app}${path}`;
  }
};

var provider = require('./util/provider');
var client = require('./util/client');

describe('middleware', function () {
  var server = { oauth2: null };

  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return provider.oauth2(port.oauth2);

          case 2:
            server.oauth2 = _context.sent;

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  after(function (done) {
    server.oauth2.close(done);
  });

  describe('path prefix', function () {
    var server;
    var config = {
      defaults: {
        protocol: 'http', host: `localhost:${port.app}`, callback: '/',
        path: '/prefix'
      },
      oauth2: {
        authorize_url: url.oauth2('/authorize_url'),
        access_url: url.oauth2('/access_url'),
        oauth: 2
      }
    };['express-prefix', 'koa-prefix', 'hapi-prefix'].forEach(function (consumer) {
      describe(consumer, function () {
        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var obj;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _context2.next = 2;
                  return client[consumer](config, port.app);

                case 2:
                  obj = _context2.sent;

                  server = obj.server;

                case 4:
                case 'end':
                  return _context2.stop();
              }
            }
          }, _callee2, undefined);
        })));

        after(function (done) {
          server[/express|koa/.test(consumer) ? 'close' : 'stop'](done);
        });

        it('success', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var _ref4, response;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return request({
                    url: url.app('/prefix/connect/oauth2'),
                    cookie: {}
                  });

                case 2:
                  _ref4 = _context3.sent;
                  response = _ref4.body.response;

                  t.deepEqual(response, {
                    access_token: 'token',
                    refresh_token: 'refresh',
                    raw: {
                      access_token: 'token',
                      refresh_token: 'refresh',
                      expires_in: '3600'
                    }
                  });

                case 5:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, undefined);
        })));
      });
    });
  });

  describe('third-party middlewares', function () {
    var server;
    var config = {
      defaults: {
        protocol: 'http', host: `localhost:${port.app}`, callback: '/'
      },
      oauth2: {
        authorize_url: url.oauth2('/authorize_url'),
        access_url: url.oauth2('/access_url'),
        oauth: 2
      }
    };['koa', 'koa-mount', 'express', 'express-cookie'].forEach(function (consumer) {
      describe(consumer, function () {
        before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var obj;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return client[consumer](config, port.app);

                case 2:
                  obj = _context4.sent;

                  server = obj.server;

                case 4:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, undefined);
        })));

        after(function (done) {
          server.close(done);
        });

        it('success', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var _ref7, response;

          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return request({
                    url: url.app('/connect/oauth2'),
                    cookie: {}
                  });

                case 2:
                  _ref7 = _context5.sent;
                  response = _ref7.body.response;

                  t.deepEqual(response, {
                    access_token: 'token',
                    refresh_token: 'refresh',
                    raw: {
                      access_token: 'token',
                      refresh_token: 'refresh',
                      expires_in: '3600'
                    }
                  });

                case 5:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, undefined);
        })));
      });
    });
  });
});