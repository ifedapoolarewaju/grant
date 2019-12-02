'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');
var http = require('http');
var qs = require('qs');
var express = require('express');
var bodyParser = require('body-parser');
var Grant = require('../../').express();
var oauth2 = require('../../lib/flow/oauth2');
var oauth = require('../../config/oauth');

var sign = function sign() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.map(function (arg, index) {
    return index < 2 ? Buffer.from(JSON.stringify(arg)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') : arg;
  }).join('.');
};

describe('oauth2', function () {
  var url = function url(path) {
    return `http://localhost:5000${path}`;
  };

  describe('success', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
        req.pipe(res);
      });
      server.listen(5000, done);
    });

    it('authorize', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var provider, url;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              provider = {
                authorize_url: '/authorize_url',
                redirect_uri: '/redirect_uri',
                key: 'key',
                scope: 'read,write',
                state: '123',
                nonce: '456'
              };
              _context.next = 3;
              return oauth2.authorize(provider);

            case 3:
              url = _context.sent;

              t.deepEqual(qs.parse(url.replace('/authorize_url?', '')), {
                client_id: 'key',
                response_type: 'code',
                redirect_uri: '/redirect_uri',
                scope: 'read,write',
                state: '123',
                nonce: '456'
              });

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));

    it('access', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var provider, authorize, data;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              provider = {
                access_url: url('/access_url'),
                redirect_uri: '/redirect_uri',
                key: 'key',
                secret: 'secret'
              };
              authorize = {
                code: 'code'
              };
              _context2.next = 4;
              return oauth2.access(provider, authorize, {});

            case 4:
              data = _context2.sent;

              t.deepEqual(data.raw, {
                grant_type: 'authorization_code',
                code: 'code',
                client_id: 'key',
                client_secret: 'secret',
                redirect_uri: '/redirect_uri'
              });

            case 6:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
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
        if (/^\/access_url_nonce/.test(req.url)) {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({ id_token: sign({ typ: 'JWT' }, { nonce: 'Purest' }, 'signature') }));
        } else if (/^\/access_url_error/.test(req.url)) {
          res.writeHead(500, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({ error: 'invalid' }));
        }
      });
      server.listen(5000, done);
    });

    it('access - missing code - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              provider = {};
              authorize = { error: 'invalid' };
              _context3.prev = 2;
              _context3.next = 5;
              return oauth2.access(provider, authorize, {});

            case 5:
              _context3.next = 10;
              break;

            case 7:
              _context3.prev = 7;
              _context3.t0 = _context3['catch'](2);

              t.deepEqual(_context3.t0.error, { error: 'invalid' });

            case 10:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined, [[2, 7]]);
    })));
    it('access - missing code - empty response', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              provider = {};
              authorize = {};
              _context4.prev = 2;
              _context4.next = 5;
              return oauth2.access(provider, authorize, {});

            case 5:
              _context4.next = 10;
              break;

            case 7:
              _context4.prev = 7;
              _context4.t0 = _context4['catch'](2);

              t.deepEqual(_context4.t0.error, { error: 'Grant: OAuth2 missing code parameter' });

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined, [[2, 7]]);
    })));
    it('access - state mismatch', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var provider, authorize, session;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              provider = {};
              authorize = { code: 'code', state: 'Purest' };
              session = { state: 'Grant' };
              _context5.prev = 3;
              _context5.next = 6;
              return oauth2.access(provider, authorize, session);

            case 6:
              _context5.next = 11;
              break;

            case 8:
              _context5.prev = 8;
              _context5.t0 = _context5['catch'](3);

              t.deepEqual(_context5.t0.error, { error: 'Grant: OAuth2 state mismatch' });

            case 11:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined, [[3, 8]]);
    })));
    it('access - nonce mismatch', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var provider, authorize, session;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              provider = { access_url: url('/access_url_nonce') };
              authorize = { code: 'code', nonce: 'Grant' };
              session = {};
              _context6.prev = 3;
              _context6.next = 6;
              return oauth2.access(provider, authorize, session);

            case 6:
              _context6.next = 11;
              break;

            case 8:
              _context6.prev = 8;
              _context6.t0 = _context6['catch'](3);

              t.deepEqual(_context6.t0.error, { error: 'Grant: OpenID Connect nonce mismatch' });

            case 11:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined, [[3, 8]]);
    })));
    it('access - request error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              provider = { access_url: 'compose:5000' };
              authorize = { code: 'code' };
              _context7.prev = 2;
              _context7.next = 5;
              return oauth2.access(provider, authorize, {});

            case 5:
              _context7.next = 10;
              break;

            case 7:
              _context7.prev = 7;
              _context7.t0 = _context7['catch'](2);

              t.ok(/^Protocol "compose:" not supported\. Expected "http:"/.test(_context7.t0.error));

            case 10:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined, [[2, 7]]);
    })));
    it('access - response error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var provider, authorize;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              provider = { access_url: url('/access_url_error') };
              authorize = { code: 'code' };
              _context8.prev = 2;
              _context8.next = 5;
              return oauth2.access(provider, authorize, {});

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

    after(function (done) {
      server.close(done);
    });
  });

  describe('custom', function () {
    describe('authorize', function () {
      describe('custom_parameters', function () {
        var config = {};
        for (var key in oauth) {
          var provider = oauth[key];
          if (provider.oauth === 2 && provider.custom_parameters) {
            config[key] = {};
            provider.custom_parameters.forEach(function (param, index) {
              config[key][param] = index.toString();
            });
          }
        }
        var grant = Grant(config);

        Object.keys(config).forEach(function (key) {
          it(key, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
            var url, query;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    _context9.next = 2;
                    return oauth2.authorize(grant.config[key]);

                  case 2:
                    url = _context9.sent;
                    query = qs.parse(url.split('?')[1]);

                    delete query.response_type;
                    delete query.redirect_uri;
                    t.deepEqual(query, config[key]);

                  case 7:
                  case 'end':
                    return _context9.stop();
                }
              }
            }, _callee9, undefined);
          })));
        });
      });

      describe('subdomain', function () {
        var config = {};
        for (var key in oauth) {
          var provider = oauth[key];
          if (provider.oauth === 2 && provider.subdomain) {
            config[key] = { subdomain: 'grant' };
          }
        }
        var grant = Grant(config);

        Object.keys(config).forEach(function (key) {
          it(key, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
            var url;
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    _context10.next = 2;
                    return oauth2.authorize(grant.config[key]);

                  case 2:
                    url = _context10.sent;

                    if (key !== 'vend') {
                      t.ok(/grant/.test(url));
                    }

                  case 4:
                  case 'end':
                    return _context10.stop();
                }
              }
            }, _callee10, undefined);
          })));
        });
      });

      describe('web_server', function () {
        var config = { basecamp: {} };
        var grant = Grant(config);
        it('basecamp', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
              switch (_context11.prev = _context11.next) {
                case 0:
                  _context11.next = 2;
                  return oauth2.authorize(grant.config.basecamp);

                case 2:
                  url = _context11.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.type, 'web_server');

                case 5:
                case 'end':
                  return _context11.stop();
              }
            }
          }, _callee11, undefined);
        })));
      });

      describe('scopes', function () {
        var grant = Grant({
          freelancer: { scope: ['1', '2'] },
          optimizely: { scope: ['1', '2'] }
        });
        it('freelancer', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
              switch (_context12.prev = _context12.next) {
                case 0:
                  _context12.next = 2;
                  return oauth2.authorize(grant.config.freelancer);

                case 2:
                  url = _context12.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.advanced_scopes, '1 2');

                case 5:
                case 'end':
                  return _context12.stop();
              }
            }
          }, _callee12, undefined);
        })));
        it('optimizely', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
              switch (_context13.prev = _context13.next) {
                case 0:
                  _context13.next = 2;
                  return oauth2.authorize(grant.config.optimizely);

                case 2:
                  url = _context13.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.scopes, '1,2');

                case 5:
                case 'end':
                  return _context13.stop();
              }
            }
          }, _callee13, undefined);
        })));
      });

      describe('response_type', function () {
        var config = { visualstudio: { response_type: 'Assertion' } };
        var grant = Grant(config);
        it('visualstudio', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
              switch (_context14.prev = _context14.next) {
                case 0:
                  _context14.next = 2;
                  return oauth2.authorize(grant.config.visualstudio);

                case 2:
                  url = _context14.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.response_type, 'Assertion');

                case 5:
                case 'end':
                  return _context14.stop();
              }
            }
          }, _callee14, undefined);
        })));
      });

      describe('scopes separated by unencoded + sign', function () {
        var config = { unsplash: { scope: ['public', 'read_photos'] } };
        var grant = Grant(config);
        it('unsplash', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
          var url;
          return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
              switch (_context15.prev = _context15.next) {
                case 0:
                  _context15.next = 2;
                  return oauth2.authorize(grant.config.unsplash);

                case 2:
                  url = _context15.sent;

                  t.equal(url.replace(/.*scope=(.*)/g, '$1'), 'public+read_photos');

                case 4:
                case 'end':
                  return _context15.stop();
              }
            }
          }, _callee15, undefined);
        })));
      });

      describe('appid - client_id', function () {
        var config = { wechat: { key: 'key', secret: 'secret' } };
        var grant = Grant(config);
        it('wechat', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
          var url, query;
          return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
              switch (_context16.prev = _context16.next) {
                case 0:
                  _context16.next = 2;
                  return oauth2.authorize(grant.config.wechat);

                case 2:
                  url = _context16.sent;
                  query = qs.parse(url.split('?')[1]);

                  t.equal(query.appid, 'key');
                  t.equal(query.client_id, undefined);

                case 6:
                case 'end':
                  return _context16.stop();
              }
            }
          }, _callee16, undefined);
        })));
      });
    });

    describe('access', function () {
      var grant, server;

      before(function (done) {
        var config = {
          defaults: { protocol: 'http', host: 'localhost:5000', callback: '/' },
          basecamp: { access_url: url('/access_url') },
          concur: { access_url: url('/access_url') },
          ebay: { access_url: url('/access_url') },
          fitbit: { access_url: url('/access_url') },
          google: { access_url: url('/access_url') },
          homeaway: { access_url: url('/access_url') },
          hootsuite: { access_url: url('/access_url') },
          qq: { access_url: url('/access_url') },
          wechat: { access_url: url('/access_url') },
          reddit: { access_url: url('/access_url') },
          shopify: { access_url: url('/access_url') },
          smartsheet: { access_url: url('/access_url') },
          surveymonkey: { access_url: url('/access_url') },
          visualstudio: { access_url: url('/access_url') }
        };
        grant = Grant(config);
        server = express().use(grant).use(bodyParser.urlencoded({ extended: true })).post('/access_url', function (req, res) {
          var code = req.body.code || req.query.code;
          // wrong content-type to pass the response formatter
          if (code === 'concur') {
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(qs.stringify(req.query));
            return;
          }
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          if (req.url.split('?')[1]) {
            res.end(qs.stringify(req.query));
          } else if (req.headers.authorization) {
            res.end(qs.stringify({ basic: req.headers.authorization }));
          } else if (req.body) {
            res.end(qs.stringify(req.body));
          }
        }).get('/access_url', function (req, res) {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify(Object.assign({ method: req.method }, req.query)));
        }).listen(5000, done);
      });

      describe('web_server', function () {
        it('basecamp', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
          var data;
          return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
              switch (_context17.prev = _context17.next) {
                case 0:
                  _context17.next = 2;
                  return oauth2.access(grant.config.basecamp, { code: 'code' }, {});

                case 2:
                  data = _context17.sent;

                  t.equal(data.raw.type, 'web_server');

                case 4:
                case 'end':
                  return _context17.stop();
              }
            }
          }, _callee17, undefined);
        })));
      });

      describe('qs', function () {
        it('concur', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
          var data;
          return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
              switch (_context18.prev = _context18.next) {
                case 0:
                  grant.config.concur.key = 'key';
                  grant.config.concur.secret = 'secret';
                  _context18.next = 4;
                  return oauth2.access(grant.config.concur, { code: 'concur' }, {});

                case 4:
                  data = _context18.sent;

                  t.deepEqual(qs.parse(data.raw), {
                    code: 'concur', client_id: 'key', client_secret: 'secret'
                  });

                case 6:
                case 'end':
                  return _context18.stop();
              }
            }
          }, _callee18, undefined);
        })));
        it('surveymonkey', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
          var data;
          return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
              switch (_context19.prev = _context19.next) {
                case 0:
                  grant.config.surveymonkey.custom_params = { api_key: 'api_key' };
                  _context19.next = 3;
                  return oauth2.access(grant.config.surveymonkey, { code: 'code' }, {});

                case 3:
                  data = _context19.sent;

                  t.deepEqual(qs.parse(data.raw), { api_key: 'api_key' });

                case 5:
                case 'end':
                  return _context19.stop();
              }
            }
          }, _callee19, undefined);
        })));
      });

      describe('basic auth', function () {
        ;['ebay', 'fitbit', 'homeaway', 'hootsuite', 'reddit'].forEach(function (provider) {
          it(provider, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
            var data;
            return regeneratorRuntime.wrap(function _callee20$(_context20) {
              while (1) {
                switch (_context20.prev = _context20.next) {
                  case 0:
                    grant.config.ebay.key = 'key';
                    grant.config.ebay.secret = 'secret';
                    _context20.next = 4;
                    return oauth2.access(grant.config.ebay, { code: 'code' }, {});

                  case 4:
                    data = _context20.sent;

                    t.deepEqual(Buffer.from(data.raw.basic.replace('Basic ', ''), 'base64').toString().split(':'), ['key', 'secret']);

                  case 6:
                  case 'end':
                    return _context20.stop();
                }
              }
            }, _callee20, undefined);
          })));
        });
        it('token_endpoint_auth_method - client_secret_basic', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
          var data;
          return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
              switch (_context21.prev = _context21.next) {
                case 0:
                  grant.config.google.key = 'key';
                  grant.config.google.secret = 'secret';
                  grant.config.google.token_endpoint_auth_method = 'client_secret_basic';
                  _context21.next = 5;
                  return oauth2.access(grant.config.google, { code: 'code' }, {});

                case 5:
                  data = _context21.sent;

                  t.deepEqual(Buffer.from(data.raw.basic.replace('Basic ', ''), 'base64').toString().split(':'), ['key', 'secret']);

                case 7:
                case 'end':
                  return _context21.stop();
              }
            }
          }, _callee21, undefined);
        })));
      });

      describe('get method', function () {
        it('qq', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
          var data;
          return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
              switch (_context22.prev = _context22.next) {
                case 0:
                  _context22.next = 2;
                  return oauth2.access(grant.config.qq, { code: 'code' }, {});

                case 2:
                  data = _context22.sent;

                  t.deepEqual(qs.parse(data.raw), {
                    method: 'GET',
                    grant_type: 'authorization_code',
                    code: 'code',
                    redirect_uri: url('/connect/qq/callback')
                  });

                case 4:
                case 'end':
                  return _context22.stop();
              }
            }
          }, _callee22, undefined);
        })));
      });

      describe('get method + qs + custom params', function () {
        it('wechat', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
          var data;
          return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
              switch (_context23.prev = _context23.next) {
                case 0:
                  _context23.next = 2;
                  return oauth2.access(Object.assign({
                    key: 'key',
                    secret: 'secret'
                  }, grant.config.wechat), { code: 'code' }, {});

                case 2:
                  data = _context23.sent;

                  t.deepEqual(qs.parse(data.raw), {
                    method: 'GET',
                    grant_type: 'authorization_code',
                    code: 'code',
                    appid: 'key',
                    secret: 'secret',
                    redirect_uri: url('/connect/wechat/callback')
                  });

                case 4:
                case 'end':
                  return _context23.stop();
              }
            }
          }, _callee23, undefined);
        })));
      });

      describe('hash', function () {
        it('smartsheet', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
          var data;
          return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
              switch (_context24.prev = _context24.next) {
                case 0:
                  _context24.next = 2;
                  return oauth2.access(grant.config.smartsheet, { code: 'code' }, {});

                case 2:
                  data = _context24.sent;

                  t.ok(typeof data.raw.hash === 'string');

                case 4:
                case 'end':
                  return _context24.stop();
              }
            }
          }, _callee24, undefined);
        })));
      });

      describe('Assertion Framework for OAuth 2.0', function () {
        it('visualstudio', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
          var data;
          return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
              switch (_context25.prev = _context25.next) {
                case 0:
                  grant.config.visualstudio.secret = 'secret';
                  _context25.next = 3;
                  return oauth2.access(grant.config.visualstudio, { code: 'code' }, {});

                case 3:
                  data = _context25.sent;

                  t.deepEqual(data.raw, {
                    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    client_assertion: 'secret',
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: 'code',
                    redirect_uri: url('/connect/visualstudio/callback')
                  });

                case 5:
                case 'end':
                  return _context25.stop();
              }
            }
          }, _callee25, undefined);
        })));
      });

      describe('subdomain', function () {
        it('shopify', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
          var data;
          return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
              switch (_context26.prev = _context26.next) {
                case 0:
                  grant.config.shopify.access_url = url('/[subdomain]');
                  grant.config.shopify.subdomain = 'access_url';
                  _context26.next = 4;
                  return oauth2.access(grant.config.shopify, { code: 'code' }, {});

                case 4:
                  data = _context26.sent;

                  t.deepEqual(data.raw, {
                    grant_type: 'authorization_code',
                    code: 'code',
                    redirect_uri: url('/connect/shopify/callback')
                  });

                case 6:
                case 'end':
                  return _context26.stop();
              }
            }
          }, _callee26, undefined);
        })));
      });

      after(function (done) {
        server.close(done);
      });
    });
  });
});