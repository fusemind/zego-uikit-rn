"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zlogwarning = exports.zloginfo = exports.zlogerror = void 0;

const zloginfo = function () {
  for (var _len = arguments.length, msg = new Array(_len), _key = 0; _key < _len; _key++) {
    msg[_key] = arguments[_key];
  }

  console.log('ZEGOUIKit[INFO]: ', ...msg);
};

exports.zloginfo = zloginfo;

const zlogwarning = function () {
  for (var _len2 = arguments.length, msg = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    msg[_key2] = arguments[_key2];
  }

  console.warn('ZEGOUIKit[WARNING]: ', ...msg);
};

exports.zlogwarning = zlogwarning;

const zlogerror = function () {
  for (var _len3 = arguments.length, msg = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    msg[_key3] = arguments[_key3];
  }

  console.error('ZEGOUIKit[ERROR]: ', ...msg);
};

exports.zlogerror = zlogerror;
//# sourceMappingURL=logger.js.map