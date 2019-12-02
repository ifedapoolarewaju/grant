'use strict';

var t = require('assert');

describe('middleware', function () {

  describe('expose config', function () {
    it('express', function () {
      var Grant = require('../').express();
      var grant = Grant();
      t.ok(typeof grant.config === 'object');
    });
    it('koa', function () {
      var Grant = require('../').koa();
      var grant = Grant();
      t.ok(typeof grant.config === 'object');
    });
  });

  describe('constructor', function () {
    it('using new', function () {
      var Grant = require('../').express();
      var grant1 = new Grant({ grant1: {} });
      var grant2 = new Grant({ grant2: {} });
      t.deepEqual(grant1.config, { grant1: { grant1: true, name: 'grant1' } });
      t.deepEqual(grant2.config, { grant2: { grant2: true, name: 'grant2' } });

      var Grant = require('../').koa();
      var grant1 = new Grant({ grant1: {} });
      var grant2 = new Grant({ grant2: {} });
      t.deepEqual(grant1.config, { grant1: { grant1: true, name: 'grant1' } });
      t.deepEqual(grant2.config, { grant2: { grant2: true, name: 'grant2' } });
    });
    it('without using new', function () {
      var Grant = require('../').express();
      var grant1 = Grant({ grant1: {} });
      var grant2 = Grant({ grant2: {} });
      t.deepEqual(grant1.config, { grant1: { grant1: true, name: 'grant1' } });
      t.deepEqual(grant2.config, { grant2: { grant2: true, name: 'grant2' } });

      var Grant = require('../').koa();
      var grant1 = Grant({ grant1: {} });
      var grant2 = Grant({ grant2: {} });
      t.deepEqual(grant1.config, { grant1: { grant1: true, name: 'grant1' } });
      t.deepEqual(grant2.config, { grant2: { grant2: true, name: 'grant2' } });
    });
  });

  describe('hapi options', function () {
    var Hapi = require('hapi');
    var Grant = require('../').hapi();
    var hapi = parseInt(require('hapi/package.json').version.split('.')[0]);

    if (hapi < 17) {
      it('passed in server.register', function (done) {
        var config = { grant: {} };
        var grant = new Grant();
        var server = new Hapi.Server();
        server.connection({ host: 'localhost', port: 5000 });
        server.register([{ register: grant, options: config }], function () {
          t.deepEqual(grant.config, { grant: { grant: true, name: 'grant' } });
          done();
        });
      });
      it('passed in the constructor', function (done) {
        var config = { grant: {} };
        var grant = Grant(config);
        var server = new Hapi.Server();
        server.connection({ host: 'localhost', port: 5000 });
        server.register([{ register: grant }], function () {
          t.deepEqual(grant.config, { grant: { grant: true, name: 'grant' } });
          done();
        });
      });
    } else {
      it('passed in server.register', function (done) {
        var config = { grant: {} };
        var grant = new Grant();
        var server = new Hapi.Server({ host: 'localhost', port: 5000 });
        server.register([{ plugin: grant, options: config }]).then(function () {
          t.deepEqual(grant.config, { grant: { grant: true, name: 'grant' } });
          done();
        });
      });
      it('passed in the constructor', function (done) {
        var config = { grant: {} };
        var grant = Grant(config);
        var server = new Hapi.Server({ host: 'localhost', port: 5000 });
        server.register([{ plugin: grant }]).then(function () {
          t.deepEqual(grant.config, { grant: { grant: true, name: 'grant' } });
          done();
        });
      });
    }
  });
});