'use strict';

var qs = require('qs');
var request = require('../client');
var response = require('../response');

var getCredentialsFields = function getCredentialsFields(provider) {
  var keyField = 'consumer_key';
  var secretField = 'consumer_secret';
  if (provider.credentials_fields) {
    keyField = provider.credentials_fields.key || keyField;
    secretField = provider.credentials_fields.secret || secretField;
  }

  return { keyField, secretField };
};
exports.request = function (provider) {
  return new Promise(function (resolve, reject) {
    var _getCredentialsFields = getCredentialsFields(provider),
        keyField = _getCredentialsFields.keyField,
        secretField = _getCredentialsFields.secretField;

    var options = {
      method: 'POST',
      url: provider.request_url,
      oauth: {
        callback: provider.redirect_uri,
        [keyField]: provider.key,
        [secretField]: provider.secret
      }
    };
    if (provider.etsy || provider.linkedin) {
      options.qs = { scope: provider.scope };
    }
    if (provider.getpocket) {
      delete options.oauth;
      options.headers = {
        'x-accept': 'application/x-www-form-urlencoded'
      };
      options.form = {
        [keyField]: provider.key,
        redirect_uri: provider.redirect_uri,
        state: provider.state
      };
    }
    if (provider.discogs) {
      options.headers = { 'user-agent': 'Grant' };
    }
    if (provider.freshbooks) {
      options.oauth.signature_method = 'PLAINTEXT';
    }
    if (provider.subdomain) {
      options.url = options.url.replace('[subdomain]', provider.subdomain);
    }
    request(options).then(resolve).catch(function (err) {
      return reject({ error: err.body || err.message });
    });
  });
};

exports.authorize = function (provider, req) {
  return new Promise(function (resolve, reject) {
    if (!req.oauth_token && !req.code) {
      reject(Object.keys(req).length ? { error: req } : { error: { error: 'Grant: OAuth1 missing oauth_token parameter' } });
      return;
    }
    var url = provider.authorize_url;
    var params = {
      oauth_token: req.oauth_token
    };
    if (provider.custom_params) {
      for (var key in provider.custom_params) {
        params[key] = provider.custom_params[key];
      }
    }
    if (provider.flickr && provider.scope) {
      params.perms = provider.scope;
    }
    if (provider.getpocket) {
      params = {
        request_token: req.code,
        redirect_uri: provider.redirect_uri
      };
    }
    if (provider.ravelry || provider.trello) {
      params.scope = provider.scope;
    }
    if (provider.tripit) {
      params.oauth_callback = provider.redirect_uri;
    }
    if (provider.subdomain) {
      url = url.replace('[subdomain]', provider.subdomain);
    }
    resolve(`${url}?${qs.stringify(params)}`);
  });
};

exports.access = function (provider, req, authorize) {
  return new Promise(function (resolve, reject) {
    if (!authorize.oauth_token && !req.code) {
      reject(Object.keys(authorize).length ? { error: authorize } : { error: 'Grant: OAuth1 missing oauth_token parameter' });
      return;
    }

    var _getCredentialsFields2 = getCredentialsFields(provider),
        keyField = _getCredentialsFields2.keyField,
        secretField = _getCredentialsFields2.secretField;

    var options = {
      method: 'POST',
      url: provider.access_url,
      oauth: {
        [keyField]: provider.key,
        [secretField]: provider.secret,
        token: authorize.oauth_token,
        token_secret: req.oauth_token_secret,
        verifier: authorize.oauth_verifier
      }
    };
    if (provider.discogs) {
      options.headers = { 'user-agent': 'Grant' };
    }
    if (provider.freshbooks) {
      options.oauth.signature_method = 'PLAINTEXT';
    }
    if (provider.getpocket) {
      delete options.oauth;
      options.headers = {
        'x-accept': 'application/x-www-form-urlencoded'
      };
      options.form = {
        [keyField]: provider.key,
        code: req.code
      };
    }
    if (provider.goodreads || provider.tripit) {
      delete options.oauth.verifier;
    }
    if (provider.subdomain) {
      options.url = options.url.replace('[subdomain]', provider.subdomain);
    }
    request(options).then(function (_ref) {
      var body = _ref.body;

      if (provider.intuit) {
        body.realmId = authorize.realmId;
      }
      resolve(response(provider, body));
    }).catch(function (err) {
      return reject({ error: err.body || err.message });
    });
  });
};