'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var crypto = require('crypto');

var oauth = require('../config/oauth.json');
var reserved = require('../config/reserved.json');

var compose = function compose() {
  for (var _len = arguments.length, fns = Array(_len), _key = 0; _key < _len; _key++) {
    fns[_key] = arguments[_key];
  }

  return fns.reduce(function (x, y) {
    return function () {
      return y(x.apply(undefined, arguments));
    };
  });
};

var dcopy = function dcopy(obj) {
  return JSON.parse(JSON.stringify(obj));
};

var merge = function merge() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return Object.assign.apply(Object, _toConsumableArray(args.filter(Boolean).map(dcopy)));
};

var filter = function filter(obj) {
  return Object.keys(obj).filter(function (key) {
    return (
      // empty string
      obj[key] !== '' && (
      // provider name
      key === obj.name ||
      // reserved key
      reserved.includes(key) ||
      // custom parameter
      obj.custom_parameters && obj.custom_parameters.includes(key) ||
      // static override
      typeof obj[key] === 'object')
    );
  }).reduce(function (all, key) {
    return all[key] = obj[key], all;
  }, {});
};

var format = {

  oauth: function oauth(_ref) {
    var _oauth = _ref.oauth;
    return parseInt(_oauth) || undefined;
  },

  key: function key(_ref2) {
    var oauth = _ref2.oauth,
        _key3 = _ref2.key,
        consumer_key = _ref2.consumer_key,
        client_id = _ref2.client_id;
    return oauth === 1 ? _key3 || consumer_key : oauth === 2 ? _key3 || client_id : undefined;
  },

  secret: function secret(_ref3) {
    var oauth = _ref3.oauth,
        _secret = _ref3.secret,
        consumer_secret = _ref3.consumer_secret,
        client_secret = _ref3.client_secret;
    return oauth === 1 ? _secret || consumer_secret : oauth === 2 ? _secret || client_secret : undefined;
  },

  scope: function scope(_ref4) {
    var _scope = _ref4.scope,
        _ref4$scope_delimiter = _ref4.scope_delimiter,
        scope_delimiter = _ref4$scope_delimiter === undefined ? ',' : _ref4$scope_delimiter;
    return _scope instanceof Array ? _scope.filter(Boolean).join(scope_delimiter) || undefined : typeof _scope === 'object' ? JSON.stringify(_scope) : _scope || undefined;
  },

  state: function state(_ref5) {
    var _state = _ref5.state;
    return _state || undefined;
  },

  nonce: function nonce(_ref6) {
    var _nonce = _ref6.nonce;
    return _nonce || undefined;
  },

  redirect_uri: function redirect_uri(_ref7) {
    var _redirect_uri = _ref7.redirect_uri,
        protocol = _ref7.protocol,
        host = _ref7.host,
        _ref7$path = _ref7.path,
        path = _ref7$path === undefined ? '' : _ref7$path,
        name = _ref7.name;
    return _redirect_uri ? _redirect_uri : protocol && host && name ? `${protocol}://${host}${path}/connect/${name}/callback` : undefined;
  },

  custom_params: function custom_params(provider) {
    var keys = (provider.custom_parameters || []).filter(function (key) {
      return !reserved.includes(key) && key !== provider.name && typeof provider[key] !== 'object';
    });

    // extract
    var direct = keys.reduce(function (all, key) {
      return all[key] = provider[key], all;
    }, {});
    // merge
    var params = Object.assign(direct, provider.custom_params || {});
    // remove
    keys.forEach(function (key) {
      return delete provider[key];
    });

    // remove falsy
    params = Object.keys(params).filter(function (key) {
      return params[key];
    }).reduce(function (all, key) {
      return all[key] = params[key], all;
    }, {});

    return Object.keys(params).length ? params : undefined;
  },

  overrides: function overrides(provider) {

    var keys = Object.keys(provider).filter(function (key) {
      return !reserved.includes(key) && key !== provider.name && typeof provider[key] === 'object';
    });

    // extract
    var direct = keys.reduce(function (all, key) {
      return all[key] = provider[key], all;
    }, {});
    // merge
    var overrides = Object.assign(direct, provider.overrides || {});
    // remove
    keys.forEach(function (key) {
      return delete provider[key];
    });
    delete provider.overrides;

    // remove nested
    Object.keys(overrides).forEach(function (key) {
      overrides[key] = Object.keys(overrides[key]).filter(function (nested) {
        return reserved.includes(nested) && nested !== 'overrides';
      }).reduce(function (all, nested) {
        return all[nested] = overrides[key][nested], all;
      }, {});
    });

    overrides = Object.keys(overrides).reduce(function (all, key) {
      return all[key] = init(provider, overrides[key]), all;
    }, {});

    return Object.keys(overrides).length ? overrides : undefined;
  },

  credentials_fields: function credentials_fields(_ref8) {
    var oauth = _ref8.oauth,
        _credentials_fields = _ref8.credentials_fields;

    var defaultFields = oauth === 1 ? { key: 'consumer_key', secret: 'consumer_secret' } : oauth === 2 ? { key: 'client_id', secret: 'client_secret' } : undefined;

    return _credentials_fields || defaultFields;
  }

};

var state = function state(provider) {
  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'state';
  var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : provider[key];
  return (/string|number/.test(typeof value) ? value.toString() : value === true ? crypto.randomBytes(10).toString('hex') : undefined
  );
};

var transform = function transform(provider) {

  Object.keys(format).forEach(function (key) {
    return provider[key] = format[key](provider);
  });

  // filter undefined
  return dcopy(provider);
};

var init = compose(merge, filter, transform);

var compat = function compat(config) {
  return config.fitbit2 ? Object.assign({}, config, { fitbit2: Object.assign({}, oauth.fitbit, config.fitbit2) }) : config;
};

// init all configured providers
var ctor = function ctor() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : config.defaults || config.server;
  return Object.keys(compat(config)).filter(function (name) {
    return !/defaults|server/.test(name);
  }).reduce(function (all, name) {
    return all[name] = init(oauth[name], defaults, config[name], { name, [name]: true }), all;
  }, defaults ? { defaults } : {});
};

// get provider on connect
var provider = function provider(config, session) {
  var name = session.provider;
  var provider = config[name];

  if (!provider) {
    if ((config.defaults || {}).dynamic !== true) {
      return {};
    }
    provider = init(oauth[name], config.defaults, { name, [name]: true });
  }

  if (session.override && provider.overrides) {
    var override = provider.overrides[session.override];
    if (override) {
      provider = override;
    }
  }

  if (session.dynamic && provider.dynamic) {
    var dynamic = provider.dynamic === true ? session.dynamic : Object.keys(session.dynamic).filter(function (key) {
      return provider.dynamic.includes(key);
    }).reduce(function (all, key) {
      return all[key] = session.dynamic[key], all;
    }, {});
    provider = init(provider, dynamic);
  }

  if (provider.state) {
    provider = dcopy(provider);
    provider.state = state(provider);
  }
  if (provider.nonce) {
    provider = dcopy(provider);
    provider.nonce = state(provider, 'nonce');
  }

  return provider;
};

module.exports = Object.assign(ctor, {
  compose, dcopy, merge, filter, format, state, transform, init, compat, provider
});