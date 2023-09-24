import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { icons } from './icons';
export function Icon(props) {
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
    return /*#__PURE__*/React.createElement(TouchableOpacity, {
      onPress: onPress,
      style: containerStyle
    }, /*#__PURE__*/React.createElement(Image, {
      style: style,
      source: icons[name]
    }));
  } else {
    return /*#__PURE__*/React.createElement(View, {
      style: containerStyle
    }, /*#__PURE__*/React.createElement(Image, {
      style: style,
      source: icons[name]
    }));
  }
}
const styles = StyleSheet.create({
  container: {
    resizeMode: 'contain'
  }
});
//# sourceMappingURL=icon.js.map