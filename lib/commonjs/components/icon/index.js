"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _icon = require("./icon");
Object.keys(_icon).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _icon[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _icon[key];
    }
  });
});
var _icons = require("./icons");
Object.keys(_icons).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _icons[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _icons[key];
    }
  });
});
//# sourceMappingURL=index.js.map