'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');

var request = require('request-compose').extend({
  Request: { cookie: require('request-cookie').Request },
  Response: { cookie: require('request-cookie').Response }
}).client;

var hapi = parseInt(require('hapi/package.json').version.split('.')[0]);

var port = { oauth1: 5000, oauth2: 5001, app: 5002 };
var url = {
  oauth1: function oauth1(path) {
    return `http://localhost:${port.oauth1}${path}`;
  },
  oauth2: function oauth2(path) {
    return `http://localhost:${port.oauth2}${path}`;
  },
  app: function app(path) {
    return `http://localhost:${port.app}${path}`;
  }
};

var provider = require('./util/provider');
var client = require('./util/client');

describe('consumer - session', function () {
  var server = { oauth1: null, oauth2: null };

  before(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return provider.oauth1(port.oauth1);

          case 2:
            server.oauth1 = _context.sent;
            _context.next = 5;
            return provider.oauth2(port.oauth2);

          case 5:
            server.oauth2 = _context.sent;

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  after(function (done) {
    server.oauth1.close(function () {
      return server.oauth2.close(done);
    });
  });['express', 'koa', 'hapi'].forEach(function (name) {
    describe(name, function () {
      var server,
          grant,
          consumer = name;
      var config = {
        defaults: {
          protocol: 'http', host: `localhost:${port.app}`, callback: '/',
          dynamic: true
        },
        oauth1: {
          request_url: url.oauth1('/request_url'),
          authorize_url: url.oauth1('/authorize_url'),
          access_url: url.oauth1('/access_url'),
          oauth: 1
        },
        oauth2: {
          authorize_url: url.oauth2('/authorize_url'),
          access_url: url.oauth2('/access_url'),
          oauth: 2
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

      it('provider', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _ref4, session;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return request({
                  url: url.app('/connect/oauth2'),
                  cookie: {}
                });

              case 2:
                _ref4 = _context3.sent;
                session = _ref4.body.session;

                t.deepEqual(session, { provider: 'oauth2' });

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      })));

      it('override', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var _ref6, session;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return request({
                  url: url.app('/connect/oauth2/contacts'),
                  cookie: {}
                });

              case 2:
                _ref6 = _context4.sent;
                session = _ref6.body.session;

                t.deepEqual(session, { provider: 'oauth2', override: 'contacts' });

              case 5:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      })));

      it('dynamic - POST', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var _ref8, session;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return request({
                  method: 'POST',
                  url: url.app('/connect/oauth2/contacts'),
                  form: { scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov' },
                  cookie: {},
                  redirect: { all: true, method: false }
                });

              case 2:
                _ref8 = _context5.sent;
                session = _ref8.body.session;

                t.deepEqual(session, { provider: 'oauth2', override: 'contacts',
                  dynamic: { scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov' },
                  state: 'Grant', nonce: 'simov'
                });

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, undefined);
      })));

      it('dynamic - GET', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _ref10, session;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return request({
                  url: url.app('/connect/oauth2/contacts'),
                  qs: { scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov' },
                  cookie: {}
                });

              case 2:
                _ref10 = _context6.sent;
                session = _ref10.body.session;

                t.deepEqual(session, { provider: 'oauth2', override: 'contacts',
                  dynamic: { scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov' },
                  state: 'Grant', nonce: 'simov'
                });

              case 5:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, undefined);
      })));

      it('dynamic - non configured provider', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _ref12, session;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                t.equal(grant.config.google, undefined);

                _context7.next = 3;
                return request({
                  url: url.app('/connect/google'),
                  qs: {
                    authorize_url: url.oauth2('/authorize_url'),
                    access_url: url.oauth2('/access_url'),
                    scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov'
                  },
                  cookie: {}
                });

              case 3:
                _ref12 = _context7.sent;
                session = _ref12.body.session;

                t.deepEqual(session, {
                  provider: 'google',
                  dynamic: {
                    authorize_url: 'http://localhost:5001/authorize_url',
                    access_url: 'http://localhost:5001/access_url',
                    scope: ['scope1', 'scope2'], state: 'Grant', nonce: 'simov'
                  },
                  state: 'Grant', nonce: 'simov'
                });

              case 6:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, undefined);
      })));

      it('dynamic - non existing provider', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var _ref14, session;

        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                t.equal(grant.config.grant, undefined);

                _context8.next = 3;
                return request({
                  url: url.app('/connect/grant'),
                  qs: {
                    authorize_url: url.oauth2('/authorize_url'),
                    access_url: url.oauth2('/access_url'),
                    oauth: 2
                  },
                  cookie: {}
                });

              case 3:
                _ref14 = _context8.sent;
                session = _ref14.body.session;

                t.equal(grant.config.grant, undefined);
                t.deepEqual(session, {
                  provider: 'grant',
                  dynamic: {
                    authorize_url: 'http://localhost:5001/authorize_url',
                    access_url: 'http://localhost:5001/access_url',
                    oauth: '2'
                  }
                });

              case 7:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, undefined);
      })));

      it('auto generated state and nonce', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        var _ref16, session;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                grant.config.oauth2.state = true;
                grant.config.oauth2.nonce = true;
                _context9.next = 4;
                return request({
                  url: url.app('/connect/oauth2'),
                  cookie: {}
                });

              case 4:
                _ref16 = _context9.sent;
                session = _ref16.body.session;

                t.ok(/\d+/.test(session.state));
                t.ok(typeof session.state === 'string');
                t.ok(/\d+/.test(session.nonce));
                t.ok(typeof session.nonce === 'string');

              case 10:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, undefined);
      })));

      it('oauth1', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        var _ref18, session;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                _context10.next = 2;
                return request({
                  url: url.app('/connect/oauth1'),
                  cookie: {}
                });

              case 2:
                _ref18 = _context10.sent;
                session = _ref18.body.session;

                t.deepEqual(session, {
                  provider: 'oauth1',
                  request: { oauth_token: 'token', oauth_token_secret: 'secret' }
                });

              case 5:
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
});