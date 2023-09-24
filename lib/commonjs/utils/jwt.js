"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generateJwt;
var _config = require("../config");
var _reactNativePureJwt = _interopRequireDefault(require("react-native-pure-jwt"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// This util is to generate JWTs.
// THIS IS NOT A SAFE OPERATION TO DO IN YOUR APP IN PRODUCTION.
// JWTs should be provided by a backend server as they require a secret
// WHICH IS NOT SAFE TO STORE ON DEVICE!
// @ts-ignore

// @ts-ignore

function makeId(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
async function generateJwt(sessionName, roleType) {
  try {
    // Ignoring because it hates on this for some reason.
    // @ts-ignore
    const token = await _reactNativePureJwt.default.sign({
      app_key: _config.ZOOM_APP_KEY,
      version: 1,
      user_identity: makeId(10),
      iat: new Date().getTime(),
      exp: new Date(Date.now() + 23 * 3600 * 1000).getTime(),
      tpc: sessionName,
      role_type: parseInt(roleType, 10),
      cloud_recording_option: 1
    }, _config.ZOOM_APP_SECRET, {
      alg: 'HS256'
    });
    return token;
  } catch (e) {
    return '';
  }
}
//# sourceMappingURL=jwt.js.map