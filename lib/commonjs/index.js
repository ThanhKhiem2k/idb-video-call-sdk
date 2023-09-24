"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  CallScreen: true
};
Object.defineProperty(exports, "CallScreen", {
  enumerable: true,
  get: function () {
    return _callScreen.CallScreen;
  }
});
var _callScreen = require("./screens/call-screen");
var _reactNativeVideosdk = require("@zoom/react-native-videosdk");
Object.keys(_reactNativeVideosdk).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactNativeVideosdk[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _reactNativeVideosdk[key];
    }
  });
});
//# sourceMappingURL=index.js.map