"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Icon = Icon;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _icons = require("./icons");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function Icon(props) {
  const {
    style: styleOverride,
    name,
    containerStyle,
    onPress
  } = props;
  const style = {
    ...styles.container,
    ...styleOverride
  };
  if (onPress) {
    return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
      onPress: onPress,
      style: containerStyle
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
      style: style,
      source: _icons.icons[name]
    }));
  } else {
    return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: containerStyle
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
      style: style,
      source: _icons.icons[name]
    }));
  }
}
const styles = _reactNative.StyleSheet.create({
  container: {
    resizeMode: 'contain'
  }
});
//# sourceMappingURL=icon.js.map