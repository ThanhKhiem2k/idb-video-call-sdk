"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativePermissions = require("react-native-permissions");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeReanimated = _interopRequireWildcard(require("react-native-reanimated"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const CheckStatusPermission = _props => {
  const [showNotification, setShowNotification] = (0, React.useState)(false);
  const opacity = (0, _reactNativeReanimated.useSharedValue)(0);
  const handleActionOn = () => {
    opacity.value = (0, _reactNativeReanimated.withSpring)(1, {
      damping: 100,
      stiffness: 100
    });
  };
  const animatedStyle = (0, _reactNativeReanimated.useAnimatedStyle)(() => {
    return {
      opacity: opacity.value
    };
  });
  const platformPermissions = {
    ios: [_reactNativePermissions.PERMISSIONS.IOS.CAMERA, _reactNativePermissions.PERMISSIONS.IOS.MICROPHONE
    //PERMISSIONS.IOS.PHOTO_LIBRARY,
    ],

    android: [_reactNativePermissions.PERMISSIONS.ANDROID.CAMERA, _reactNativePermissions.PERMISSIONS.ANDROID.RECORD_AUDIO, _reactNativePermissions.PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, _reactNativePermissions.PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    // PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    // PERMISSIONS.ANDROID.READ_PHONE_STATE,
    // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]
  };

  (0, React.useEffect)(() => {
    if (_props.callbackFunction) {
      _props.callbackFunction(() => checkAppAccessRights);
    }
    if (!_props.openPopupSettingApp) {
      checkAppAccessRights('');
    }
  }, []);
  const checkAppAccessRights = typeCheck => {
    const platformPermissionsSelected = typeCheck === 'video' ? {
      ios: [_reactNativePermissions.PERMISSIONS.IOS.CAMERA],
      android: [_reactNativePermissions.PERMISSIONS.ANDROID.CAMERA]
    } : typeCheck === 'audio' ? {
      ios: [_reactNativePermissions.PERMISSIONS.IOS.MICROPHONE],
      android: [_reactNativePermissions.PERMISSIONS.ANDROID.RECORD_AUDIO]
    } : null;
    // console.log('typeCheck', typeCheck);
    // check()
    if (_reactNative.Platform.OS !== 'ios' && _reactNative.Platform.OS !== 'android') {
      return;
    }
    const permissions = platformPermissionsSelected === null ? platformPermissions[_reactNative.Platform.OS] : platformPermissionsSelected[_reactNative.Platform.OS];
    let notGranted = [];
    (0, _reactNativePermissions.checkMultiple)(permissions).then(statuses => {
      permissions.map(p => {
        const status = statuses[p];
        // console.log('status', status);
        // console.log(p);
        if (status === _reactNativePermissions.RESULTS.BLOCKED && !showNotification && _props.openPopupSettingApp) {
          setShowNotification(true);
          handleActionOn();
        } else if (status === _reactNativePermissions.RESULTS.DENIED) {
          notGranted.push(p);
          if (showNotification) {
            setShowNotification(false);
          }
        } else if (status === _reactNativePermissions.RESULTS.GRANTED && showNotification) {
          setShowNotification(false);
        }
      });
      try {
        notGranted.length && (0, _reactNativePermissions.requestMultiple)(notGranted);
      } catch (error) {
        console.log('errrrrrrr');
      }
    });
  };
  if (!showNotification) {
    return null;
  }
  return /*#__PURE__*/React.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(_reactNativeReanimated.default.View, {
    style: [styles.notificationContainer, animatedStyle]
  }, /*#__PURE__*/React.createElement(_reactNative.Text, {
    style: styles.notificationText
  }, "\u1EE8ng d\u1EE5ng c\u1EA7n quy\u1EC1n truy c\u1EADp \u0111\u1EC3 ho\u1EA1t \u0111\u1ED9ng."), /*#__PURE__*/React.createElement(_reactNative.View, {
    style: styles.notificationActions
  }, /*#__PURE__*/React.createElement(_reactNativeGestureHandler.TouchableOpacity, {
    onPress: _reactNativePermissions.openSettings,
    style: styles.buttonPopup
  }, /*#__PURE__*/React.createElement(_reactNative.Text, {
    style: [styles.textButtonPopup, {
      color: '#4f80b9ff'
    }]
  }, "M\u1EDF quy\u1EC1n truy c\u1EADp \u1EE9ng d\u1EE5ng")), /*#__PURE__*/React.createElement(_reactNativeGestureHandler.TouchableOpacity, {
    onPress: () => {
      setShowNotification(false);
      opacity.value = 0;
    },
    style: styles.buttonPopup
  }, /*#__PURE__*/React.createElement(_reactNative.Text, {
    style: [styles.textButtonPopup, {
      color: '#4f80b99c'
    }]
  }, "Hu\u1EF7")))));
};
var _default = CheckStatusPermission;
exports.default = _default;
const styles = _reactNative.StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  notificationContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    justifyContent: 'space-between'
  },
  notificationText: {
    marginBottom: 10,
    padding: 20,
    fontSize: 20,
    textAlign: 'center'
  },
  notificationActions: {
    justifyContent: 'space-around'
  },
  buttonPopup: {
    borderTopWidth: 1,
    borderTopColor: '#45454533',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5
    // backgroundColor: '#45454533',
  },

  textButtonPopup: {
    fontSize: 18
  }
});
//# sourceMappingURL=checkStatusPermission.js.map