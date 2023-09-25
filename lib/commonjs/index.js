"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Context: true,
  ZoomVideoSdkProvider: true,
  ZoomView: true,
  useZoom: true,
  CallScreen: true
};
Object.defineProperty(exports, "CallScreen", {
  enumerable: true,
  get: function () {
    return _callScreen.CallScreen;
  }
});
Object.defineProperty(exports, "Context", {
  enumerable: true,
  get: function () {
    return _reactNativeVideosdk.Context;
  }
});
Object.defineProperty(exports, "ZoomVideoSdkProvider", {
  enumerable: true,
  get: function () {
    return _reactNativeVideosdk.ZoomVideoSdkProvider;
  }
});
Object.defineProperty(exports, "ZoomView", {
  enumerable: true,
  get: function () {
    return _reactNativeVideosdk.ZoomView;
  }
});
Object.defineProperty(exports, "useZoom", {
  enumerable: true,
  get: function () {
    return _reactNativeVideosdk.useZoom;
  }
});
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
var _callScreen = require("./screens/call-screen");
//# sourceMappingURL=index.js.map