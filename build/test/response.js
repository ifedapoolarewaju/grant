'use strict';

var t = require('assert');
var qs = require('qs');
var response = require('../lib/response');

var sign = function sign() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return args.map(function (arg, index) {
    return index < 2 ? Buffer.from(JSON.stringify(arg)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') : arg;
  }).join('.');
};

describe('response', function () {

  it('concur', function () {
    var provider = { concur: true };
    var body = '<Access_Token>\r\n' + '  <Instance_Url>https://www.concursolutions.com/</Instance_Url>\r\n' + '  <Token>q962LLopjMgTOeTn3fRN+5uABCg=</Token>\r\n' + '  <Expiration_date>9/25/2016 1:36:50 PM</Expiration_date>\r\n' + '  <Refresh_Token>AXvRqWeb77Lq9F2WK6TXLCSTuxpwZO6</Refresh_Token>\r\n' + '</Access_Token>';
    t.deepEqual(qs.parse(response(provider, body)), {
      access_token: 'q962LLopjMgTOeTn3fRN+5uABCg=',
      refresh_token: 'AXvRqWeb77Lq9F2WK6TXLCSTuxpwZO6',
      raw: body
    });
  });

  it('getpocket', function () {
    var provider = { getpocket: true };
    var body = { access_token: 'token' };
    t.deepEqual(response(provider, body), { access_token: 'token', raw: { access_token: 'token' } });
  });

  it('yammer', function () {
    var provider = { yammer: true };
    var body = { access_token: { token: 'token' } };
    t.deepEqual(response(provider, body), { access_token: 'token', raw: { access_token: { token: 'token' } } });
  });

  it('oauth1', function () {
    var provider = { oauth: 1 };
    var body = { oauth_token: 'token', oauth_token_secret: 'secret' };
    t.deepEqual(response(provider, body), {
      access_token: 'token', access_secret: 'secret',
      raw: { oauth_token: 'token', oauth_token_secret: 'secret' }
    });
  });

  it('oauth2', function () {
    var provider = { oauth: 2 };
    var body = {
      id_token: sign({ typ: 'JWT' }, { hey: 'hi' }, 'signature'),
      access_token: 'token', refresh_token: 'refresh'
    };
    t.deepEqual(response(provider, body), {
      id_token: {
        header: { typ: 'JWT' }, payload: { hey: 'hi' }, signature: 'signature'
      },
      access_token: 'token',
      refresh_token: 'refresh',
      raw: {
        id_token: 'eyJ0eXAiOiJKV1QifQ.eyJoZXkiOiJoaSJ9.signature',
        access_token: 'token',
        refresh_token: 'refresh'
      }
    });
  });

  describe('id_token', function () {

    it('invalid format', function () {
      var provider = { oauth: 2 };
      var body = { id_token: sign('a', 'b') };
      t.deepEqual(response(provider, body), {
        error: 'Grant: OpenID Connect invalid id_token format'
      });
    });

    it('error decoding', function () {
      var provider = { oauth: 2 };
      var body = { id_token: 'a.b.c' };
      t.deepEqual(response(provider, body), {
        error: 'Grant: OpenID Connect error decoding id_token'
      });
    });

    it('invalid audience - string', function () {
      var provider = { oauth: 2, key: 'simov' };
      var body = { id_token: sign({}, { aud: 'grant' }, 'c') };
      t.deepEqual(response(provider, body), {
        error: 'Grant: OpenID Connect invalid id_token audience'
      });
    });

    it('invalid audience - array', function () {
      var provider = { oauth: 2, key: 'simov' };
      var body = { id_token: sign({}, { aud: ['grant'] }, 'c') };
      t.deepEqual(response(provider, body), {
        error: 'Grant: OpenID Connect invalid id_token audience'
      });
    });

    it('nonce mismatch', function () {
      var provider = { oauth: 2, key: 'grant' };
      var body = { id_token: sign({}, { aud: 'grant', nonce: 'foo' }, 'c') };
      var session = { nonce: 'bar' };
      t.deepEqual(response(provider, body, session), {
        error: 'Grant: OpenID Connect nonce mismatch'
      });
    });

    it('valid jwt', function () {
      var provider = { oauth: 2, key: 'grant' };
      var body = { id_token: sign({ typ: 'JWT' }, { aud: 'grant', nonce: 'foo' }, 'signature') };
      var session = { nonce: 'foo' };
      t.deepEqual(response(provider, body, session), {
        id_token: {
          header: { typ: 'JWT' },
          payload: { aud: 'grant', nonce: 'foo' },
          signature: 'signature'
        },
        raw: {
          id_token: 'eyJ0eXAiOiJKV1QifQ.eyJhdWQiOiJncmFudCIsIm5vbmNlIjoiZm9vIn0.signature'
        }
      });
    });

    it('valid jwt - audience array', function () {
      var provider = { oauth: 2, key: 'grant' };
      var body = { id_token: sign({ typ: 'JWT' }, { aud: ['grant'], nonce: 'foo' }, 'signature') };
      var session = { nonce: 'foo' };
      t.deepEqual(response(provider, body, session), {
        id_token: {
          header: { typ: 'JWT' },
          payload: { aud: ['grant'], nonce: 'foo' },
          signature: 'signature'
        },
        raw: {
          id_token: 'eyJ0eXAiOiJKV1QifQ.eyJhdWQiOlsiZ3JhbnQiXSwibm9uY2UiOiJmb28ifQ.signature'
        }
      });
    });
  });

  describe('response option', function () {
    it('always skip raw and always return tokens', function () {
      var provider = { oauth: 2 };
      var body = { access_token: 'token' };[true, 'tokens', 'jwt', [], ['tokens'], ['jwt'], ['tokens', 'jwt']].forEach(function (value) {
        provider.response = value;
        t.deepEqual(response(provider, body), { access_token: 'token' });
      });
    });
    it('return id_token as raw string', function () {
      var provider = { oauth: 2, response: 'tokens' };
      var body = { id_token: sign({ typ: 'JWT' }, { hey: 'hi' }, 'signature') };
      t.deepEqual(response(provider, body), { id_token: 'eyJ0eXAiOiJKV1QifQ.eyJoZXkiOiJoaSJ9.signature' });
    });
    it('optionally include the decoded id_token', function () {
      var provider = { oauth: 2 };
      var body = { id_token: sign({ typ: 'JWT' }, { hey: 'hi' }, 'signature') };['jwt', ['jwt'], ['tokens', 'jwt']].forEach(function (value) {
        provider.response = value;
        t.deepEqual(response(provider, body), {
          id_token: 'eyJ0eXAiOiJKV1QifQ.eyJoZXkiOiJoaSJ9.signature',
          id_token_jwt: {
            header: { typ: 'JWT' }, payload: { hey: 'hi' }, signature: 'signature'
          }
        });
      });
    });
  });
});