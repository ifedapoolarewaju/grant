'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var t = require('assert');
var http = require('http');
var qs = require('qs');
var request = require('../lib/client');
var compose = require('request-compose');

describe('client', function () {
  describe('parse', function () {
    var server;

    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        if (req.url === '/json') {
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ json: true }));
        }
        if (req.url === '/qs') {
          res.writeHead(200, { 'content-type': 'application/x-www-form-urlencoded' });
          res.end(qs.stringify({ nested: { querystring: true } }));
        }
        if (req.url === '/jsontext') {
          res.writeHead(200, { 'content-type': 'text/plain' });
          res.end(JSON.stringify({ json: true }));
        }
        if (req.url === '/qstext') {
          res.writeHead(200, { 'content-type': 'text/html' });
          res.end(qs.stringify({ nested: { querystring: true } }));
        }
      });
      server.listen(5000, done);
    });

    it('json', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var _ref2, body;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return request({ url: 'http://localhost:5000/json' });

            case 2:
              _ref2 = _context.sent;
              body = _ref2.body;

              t.deepStrictEqual(body, { json: true });

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));

    it('querystring', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _ref4, body;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return request({ url: 'http://localhost:5000/qs' });

            case 2:
              _ref4 = _context2.sent;
              body = _ref4.body;

              t.deepStrictEqual(body, { nested: { querystring: 'true' } });

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('json as text', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var _ref6, body;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return request({ url: 'http://localhost:5000/jsontext' });

            case 2:
              _ref6 = _context3.sent;
              body = _ref6.body;

              t.deepStrictEqual(body, { json: true });

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));

    it('querystring as text', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var _ref8, body;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return request({ url: 'http://localhost:5000/qstext' });

            case 2:
              _ref8 = _context4.sent;
              body = _ref8.body;

              t.deepStrictEqual(body, { nested: { querystring: 'true' } });

            case 5:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));

    it('extend', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var _ref10, body, _ref11;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return request({ url: 'http://localhost:5000/qstext' });

            case 2:
              _ref10 = _context5.sent;
              body = _ref10.body;

              t.deepStrictEqual(body, { nested: { querystring: 'true' } });
              _context5.next = 7;
              return compose.client({ url: 'http://localhost:5000/qstext' });

            case 7:
              _ref11 = _context5.sent;
              body = _ref11.body;

              t.equal(body, 'nested%5Bquerystring%5D=true');

            case 10:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    after(function (done) {
      server.close(done);
    });
  });
});