'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');
var http = require('http');
var qs = require('qs');
var express = require('express');
var bodyParser = require('body-parser');
var Grant = require('../../').express();
var oauth1 = require('../../lib/flow/oauth1');
var oauth = require('../../config/oauth');
var reserved = require('../../config/reserved');

describe('oauth1', function () {
  var url = function url(path) {
    return `http://localhost:5000${path}`;
  };

  describe('success', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
        if (req.url === '/request_url') {
          var data = req.headers.authorization.replace('OAuth ', '').replace(/"/g, '').replace(/,/g, '&');
          res.end(data);
        } else if (req.url === '/access_url') {
          var data = qs.stringify({
            oauth_token: 'token', oauth_token_secret: 'secret', some: 'data'
          });
        }
        res.end(data);
      });
      server.listen(5000, done);
    });

    it('request', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var provider, _ref2, body;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              provider = {
                request_url: url('/request_url'),
                redirect_uri: '/redirect_uri',
                key: 'key'
              };
              _context.next = 3;
              return oauth1.request(provider);

            case 3:
              _ref2 = _context.sent;
              body = _ref2.body;

              t.equal(body.oauth_callback, '/redirect_uri');
              t.equal(body.oauth_consumer_key, 'key');

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));

    it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var provider, url;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              provider = { authorize_url: '/authorize_url' };
              _context2.next = 3;
              return oauth1.authorize(provider, { oauth_token: 'token' });

            case 3:
              url = _context2.sent;

              t.deepEqual(qs.parse(url.replace('/authorize_url?', '')), { oauth_token: 'token' });

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('access', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var provider, authorize, data;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              provider = { access_url: url('/access_url'), oauth: 1 };
              authorize = { oauth_token: 'token' };
              _context3.next = 4;
              return oauth1.access(provider, {}, authorize);

            case 4:
              data = _context3.sent;

              t.deepEqual(data, {
                access_token: 'token',
                access_secret: 'secret',
                raw: {
                  oauth_token: 'token',
                  oauth_token_secret: 'secret',
                  some: 'data'
                }
              });

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));

    after(function (done) {
      server.close(done);
    });
  });

  describe('error', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        res.writeHead(500, { 'content-type': 'application/x-www-form-urlencoded' });
        res.end(qs.stringify({ error: 'invalid' }));
      });
      server.listen(5000, done);
    });

    it('request - request error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var provider;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              provider = { request_url: 'compose:5000' };
              _context4.prev = 1;
              _context4.next = 4;
              return oauth1.request(provider);

            case 4:
              _context4.next = 9;
              break;

            case 6:
              _context4.prev = 6;
              _context4.t0 = _context4['catch'](1);

              t.ok(/^Protocol "compose:" not supported\. Expected "http:"/.test(_context4.t0.error));

            case 9:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined, [[1, 6]]);
    })));
    it('request - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var provider;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              provider = { request_url: url('/request_url') };

              oauth1.request(provider).catch(function (err) {
                t.deepEqual(err.error, { error: 'invalid' });
              });

            case 2:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    it('authorize - mising oauth_token - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var provider, request;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              provider = {};
              request = { error: 'invalid' };
              _context6.prev = 2;
              _context6.next = 5;
              return oauth1.authorize(provider, request);

            case 5:
              _context6.next = 10;
              break;

            case 7:
              _context6.prev = 7;
              _context6.t0 = _context6['catch'](2);

              t.deepEqual(_context6.t0.error, { error: 'invalid' });

            case 10:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined, [[2, 7]]);
    })));
    it('authorize - mising oauth_token - empty response', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var provider, request;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              provider = {};
              request = {};
              _context7.prev = 2;
              _context7.next = 5;
              return oauth1.authorize(provider, request);

            case 5:
              _context7.next = 10;
              break;

            case 7:
              _context7.prev = 7;
              _context7.t0 = _context7['catch'](2);

              t.deepEqual(_context7.t0.error, { error: 'Grant: OAuth1 missing oauth_token parameter' });

            case 10:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined, [[2, 7]]);
    })));

    it('access - mising oauth_token - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              provider = {};
              authorize = { error: 'invalid' };
              _context8.prev = 2;
              _context8.next = 5;
              return oauth1.access(provider, {}, authorize);

            case 5:
              _context8.next = 10;
              break;

            case 7:
              _context8.prev = 7;
              _context8.t0 = _context8['catch'](2);

              t.deepEqual(_context8.t0.error, { error: 'invalid' });

            case 10:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, undefined, [[2, 7]]);
    })));
    it('access - mising oauth_token - empty response', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              provider = {};
              authorize = {};
              _context9.prev = 2;
              _context9.next = 5;
              return oauth1.access(provider, {}, authorize);

            case 5:
              _context9.next = 10;
              break;

            case 7:
              _context9.prev = 7;
              _context9.t0 = _context9['catch'](2);

              t.deepEqual(_context9.t0, { error: 'Grant: OAuth1 missing oauth_token parameter' });

            case 10:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, undefined, [[2, 7]]);
    })));
    it('access - request error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              provider = { access_url: 'compose:5000' };
              authorize = { oauth_token: 'token' };
              _context10.prev = 2;
              _context10.next = 5;
              return oauth1.access(provider, {}, authorize);

            case 5:
              _context10.next = 10;
              break;

            case 7:
              _context10.prev = 7;
              _context10.t0 = _context10['catch'](2);

              t.ok(/^Protocol "compose:" not supported\. Expected "http:"/.test(_context10.t0.error));

            case 10:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, undefined, [[2, 7]]);
    })));
    it('access - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              provider = { access_url: url('/access_url') };
              authorize = { oauth_token: 'token' };
              _context11.prev = 2;
              _context11.next = 5;
              return oauth1.access(provider, {}, authorize);

            case 5:
              _context11.next = 10;
              break;

            case 7:
              _context11.prev = 7;
              _context11.t0 = _context11['catch'](2);

              t.deepEqual(_context11.t0.error, { error: 'invalid' });

            case 10:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, undefined, [[2, 7]]);
    })));

    after(function (done) {
      server.close(done);
    });
  });

  describe('custom', function () {
    describe('request', function () {
      var grant, server;

      before(function (done) {
        var config = {
          discogs: {}, etsy: {}, freshbooks: {}, getpocket: {},
          linkedin: {}
        };
        grant = Grant(config);
        var app = express();
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(grant);

        app.post('/request_url', function (req, res) {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({
            agent: req.headers['user-agent'],
            oauth: req.headers.authorization,
            scope: req.query.scope,
            accept: req.headers['x-accept'],
            form: req.body
          }));
        });
        server = app.listen(5000, done);
      });

      describe('querystring scope', function () {
        it('etsy', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
          var _ref14, body;

          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  grant.config.etsy.request_url = url('/request_url');
                  grant.config.etsy.scope = 'email_r profile_r';
                  _context12.next = 4;
                  return oauth1.request(grant.config.etsy);

                case 4:
                  _ref14 = _context12.sent;
                  body = _ref14.body;

                  t.equal(body.scope, 'email_r profile_r');

                case 7:
                case 'end':
                  return _context12.stop();
              }
            }
          }, _callee12, undefined);
        })));
        it('linkedin', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
          var _ref16, body;

          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  grant.config.linkedin.request_url = url('/request_url');
                  grant.config.linkedin.scope = 'scope1,scope2';
                  _context13.next = 4;
                  return oauth1.request(grant.config.linkedin);

                case 4:
                  _ref16 = _context13.sent;
                  body = _ref16.body;

                  t.equal(body.scope, 'scope1,scope2');

                case 7:
                case 'end':
                  return _context13.stop();
              }
            }
          }, _callee13, undefined);
        })));
      });

      describe('user-agent', function () {
        it('discogs', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          var _ref18, body;

          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  grant.config.discogs.request_url = url('/request_url');
                  _context14.next = 3;
                  return oauth1.request(grant.config.discogs);

                case 3:
                  _ref18 = _context14.sent;
                  body = _ref18.body;

                  t.equal(body.agent, 'Grant');

                case 6:
                case 'end':
                  return _context14.stop();
              }
            }
          }, _callee14, undefined);
        })));
      });

      describe('signature_method', function () {
        it('freshbooks', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
          var _ref20, body;

          return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  grant.config.freshbooks.request_url = url('/request_url');
                  _context15.next = 3;
                  return oauth1.request(grant.config.freshbooks);

                case 3:
                  _ref20 = _context15.sent;
                  body = _ref20.body;

                  t.ok(/oauth_signature_method="PLAINTEXT"/.test(body.oauth));

                case 6:
                case 'end':
                  return _context15.stop();
              }
            }
          }, _callee15, undefined);
        })));
      });

      describe('getpocket', function () {
        it('access', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
          var _ref22, body;

          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  grant.config.getpocket.request_url = url('/request_url');
                  grant.config.getpocket.key = 'key';
                  grant.config.getpocket.state = 'state';
                  _context16.next = 5;
                  return oauth1.request(grant.config.getpocket);

                case 5:
                  _ref22 = _context16.sent;
                  body = _ref22.body;

                  t.deepEqual(body, {
                    accept: 'application/x-www-form-urlencoded',
                    form: { consumer_key: 'key', state: 'state' }
                  });

                case 8:
                case 'end':
                  return _context16.stop();
              }
            }
          }, _callee16, undefined);
        })));
      });

      describe('subdomain', function () {
        it('freshbooks', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
          var _ref24, body;

          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  grant.config.freshbooks.request_url = url('/[subdomain]');
                  grant.config.freshbooks.subdomain = 'request_url';
                  _context17.next = 4;
                  return oauth1.request(grant.config.freshbooks);

                case 4:
                  _ref24 = _context17.sent;
                  body = _ref24.body;

                  t.ok(/OAuth/.test(body.oauth));

                case 7:
                case 'end':
                  return _context17.stop();
              }
            }
          }, _callee17, undefined);
        })));
      });

      after(function (done) {
        server.close(done);
      });
    });

    describe('authorize', function () {
      describe('custom_parameters', function () {
        var config = {};
        for (var key in oauth) {
          var provider = oauth[key];
          if (provider.oauth === 1 && provider.custom_parameters) {
            config[key] = {};
            provider.custom_parameters.forEach(function (param, index) {
              if (reserved.includes(param)) {
                config[key].custom_params = config[key].custom_params || {};
                config[key].custom_params[param] = index.toString();
              } else {
                config[key][param] = index.toString();
              }
            });
          }
        }
        var grant = Grant(config);

        Object.keys(config).forEach(function (key) {
          it(key, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
            var url, query;
            return regeneratorRuntime.wrap(function _callee18$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _context18.next = 2;
                    return oauth1.authorize(grant.config[key], { oauth_token: 'token' });

                  case 2:
                    url = _context18.sent;
                    query = qs.parse(url.split('?')[1]);

                    delete query.oauth_token;
                    if (config[key].custom_params) {
                      Object.assign(config[key], config[key].custom_params);
                      delete config[key].custom_params;
                    }
                    t.deepEqual(query, config[key]);

                  case 7:
                  case 'end':
                    return _context18.stop();
                }
              }
            }, _callee18, undefined);
          })));
        });
      });

      describe('scope', function () {
        var grant = Grant({
          flickr: { scope: ['1', '2'] },
          ravelry: { scope: ['1', '2'] },
          trello: { scope: ['1', '2'] }
        });
        it('flickr', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  _context19.next = 2;
                  return oauth1.authorize(grant.config.flickr, { oauth_token: 'token' });

                case 2:
                  url = _context19.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.perms, '1,2');

                case 5:
                case 'end':
                  return _context19.stop();
              }
            }
          }, _callee19, undefined);
        })));
        it('ravelry', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
              switch (_context20.prev = _context20.next) {
                case 0:
                  _context20.next = 2;
                  return oauth1.authorize(grant.config.ravelry, { oauth_token: 'token' });

                case 2:
                  url = _context20.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.scope, '1 2');

                case 5:
                case 'end':
                  return _context20.stop();
              }
            }
          }, _callee20, undefined);
        })));
        it('trello', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
              switch (_context21.prev = _context21.next) {
                case 0:
                  _context21.next = 2;
                  return oauth1.authorize(grant.config.trello, { oauth_token: 'token' });

                case 2:
                  url = _context21.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.scope, '1,2');

                case 5:
                case 'end':
                  return _context21.stop();
              }
            }
          }, _callee21, undefined);
        })));
      });

      describe('oauth_callback', function () {
        it('tripit', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
          var grant, uri, query;
          return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  grant = Grant({ tripit: { redirect_uri: url('/connect/tripit/callback') } });
                  _context22.next = 3;
                  return oauth1.authorize(grant.config.tripit, { oauth_token: 'token' });

                case 3:
                  uri = _context22.sent;
                  query = qs.parse(uri.split('?')[1]);

                  t.equal(query.oauth_callback, url('/connect/tripit/callback'));

                case 6:
                case 'end':
                  return _context22.stop();
              }
            }
          }, _callee22, undefined);
        })));
      });

      describe('getpocket', function () {
        it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
          var grant, url, query;
          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  grant = Grant({ getpocket: {} });
                  _context23.next = 3;
                  return oauth1.authorize(grant.config.getpocket, { code: 'code' });

                case 3:
                  url = _context23.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.deepEqual(query, { request_token: 'code' });

                case 6:
                case 'end':
                  return _context23.stop();
              }
            }
          }, _callee23, undefined);
        })));
      });

      describe('subdomain', function () {
        it('freshbooks', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
          var grant, url;
          return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  grant = Grant({ freshbooks: { subdomain: 'grant' } });
                  _context24.next = 3;
                  return oauth1.authorize(grant.config.freshbooks, { oauth_token: 'token' });

                case 3:
                  url = _context24.sent;

                  t.equal(url.indexOf('https://grant.freshbooks.com'), 0);

                case 5:
                case 'end':
                  return _context24.stop();
              }
            }
          }, _callee24, undefined);
        })));
      });
    });

    describe('access', function () {
      var grant, server;

      before(function (done) {
        var config = {
          discogs: {}, freshbooks: {}, getpocket: {}, goodreads: {}, intuit: {},
          tripit: {}
        };
        grant = Grant(config);
        var app = express();
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(grant);

        app.post('/access_url', function (req, res) {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({
            agent: req.headers['user-agent'],
            oauth: req.headers.authorization,
            accept: req.headers['x-accept'],
            form: req.body
          }));
        });
        server = app.listen(5000, done);
      });

      describe('user-agent', function () {
        it('discogs', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
          var authorize, data;
          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  grant.config.discogs.access_url = url('/access_url');
                  authorize = { oauth_token: 'token' };
                  _context25.next = 4;
                  return oauth1.access(grant.config.discogs, {}, authorize);

                case 4:
                  data = _context25.sent;

                  t.equal(data.raw.agent, 'Grant');

                case 6:
                case 'end':
                  return _context25.stop();
              }
            }
          }, _callee25, undefined);
        })));
      });

      describe('signature_method', function () {
        it('freshbooks', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
          var authorize, data;
          return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
              switch (_context26.prev = _context26.next) {
                case 0:
                  grant.config.freshbooks.access_url = url('/access_url');
                  authorize = { oauth_token: 'token' };
                  _context26.next = 4;
                  return oauth1.access(grant.config.freshbooks, {}, authorize);

                case 4:
                  data = _context26.sent;

                  t.ok(/oauth_signature_method="PLAINTEXT"/.test(data.raw.oauth));

                case 6:
                case 'end':
                  return _context26.stop();
              }
            }
          }, _callee26, undefined);
        })));
      });

      describe('oauth_verifier', function () {
        it('goodreads', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
          var authorize, data;
          return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
              switch (_context27.prev = _context27.next) {
                case 0:
                  grant.config.goodreads.access_url = url('/access_url');
                  authorize = { oauth_token: 'token' };
                  _context27.next = 4;
                  return oauth1.access(grant.config.goodreads, {}, authorize);

                case 4:
                  data = _context27.sent;

                  t.ok(!/verifier/.test(data.raw.oauth));

                case 6:
                case 'end':
                  return _context27.stop();
              }
            }
          }, _callee27, undefined);
        })));
        it('tripit', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
          var authorize, data;
          return regeneratorRuntime.wrap(function _callee28$(_context28) {
            while (1) {
              switch (_context28.prev = _context28.next) {
                case 0:
                  grant.config.tripit.access_url = url('/access_url');
                  authorize = { oauth_token: 'token' };
                  _context28.next = 4;
                  return oauth1.access(grant.config.tripit, {}, authorize);

                case 4:
                  data = _context28.sent;

                  t.ok(!/verifier/.test(data.raw.oauth));

                case 6:
                case 'end':
                  return _context28.stop();
              }
            }
          }, _callee28, undefined);
        })));
      });

      describe('getpocket', function () {
        it('token', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
          var request, data;
          return regeneratorRuntime.wrap(function _callee29$(_context29) {
            while (1) {
              switch (_context29.prev = _context29.next) {
                case 0:
                  grant.config.getpocket.access_url = url('/access_url');
                  grant.config.getpocket.key = 'key';
                  request = { code: 'code' };
                  _context29.next = 5;
                  return oauth1.access(grant.config.getpocket, request, {});

                case 5:
                  data = _context29.sent;

                  t.deepEqual(data.raw, {
                    accept: 'application/x-www-form-urlencoded',
                    form: {
                      consumer_key: 'key',
                      code: 'code'
                    }
                  });

                case 7:
                case 'end':
                  return _context29.stop();
              }
            }
          }, _callee29, undefined);
        })));
      });

      describe('subdomain', function () {
        it('freshbooks', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
          var data;
          return regeneratorRuntime.wrap(function _callee30$(_context30) {
            while (1) {
              switch (_context30.prev = _context30.next) {
                case 0:
                  grant.config.freshbooks.access_url = url('/[subdomain]');
                  grant.config.freshbooks.subdomain = 'access_url';
                  _context30.next = 4;
                  return oauth1.access(grant.config.freshbooks, {}, { oauth_token: 'token' });

                case 4:
                  data = _context30.sent;

                  t.ok(/oauth_signature_method="PLAINTEXT"/.test(data.raw.oauth));

                case 6:
                case 'end':
                  return _context30.stop();
              }
            }
          }, _callee30, undefined);
        })));
      });

      describe('realmId', function () {
        it('intuit', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
          var authorize, data;
          return regeneratorRuntime.wrap(function _callee31$(_context31) {
            while (1) {
              switch (_context31.prev = _context31.next) {
                case 0:
                  grant.config.intuit.access_url = url('/access_url');
                  authorize = { oauth_token: 'token', realmId: '123' };
                  _context31.next = 4;
                  return oauth1.access(grant.config.intuit, {}, authorize);

                case 4:
                  data = _context31.sent;

                  t.equal(data.raw.realmId, '123');

                case 6:
                case 'end':
                  return _context31.stop();
              }
            }
          }, _callee31, undefined);
        })));
      });

      after(function (done) {
        server.close(done);
      });
    });
  });
});