"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _videoView = require("./video-view");
Object.keys(_videoView).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _videoView[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _videoView[key];
    }
  });
});
//# sourceMappingURL=index.js.map