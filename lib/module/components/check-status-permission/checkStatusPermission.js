import * as React from 'react';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { checkMultiple, requestMultiple, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
const CheckStatusPermission = _props => {
  const [showNotification, setShowNotification] = useState(false);
  const opacity = useSharedValue(0);
  const handleActionOn = () => {
    opacity.value = withSpring(1, {
      damping: 100,
      stiffness: 100
    });
  };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });
  const platformPermissions = {
    ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE
    //PERMISSIONS.IOS.PHOTO_LIBRARY,
    ],

    android: [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.RECORD_AUDIO, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    // PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    // PERMISSIONS.ANDROID.READ_PHONE_STATE,
    // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]
  };

  useEffect(() => {
    if (_props.callbackFunction) {
      _props.callbackFunction(() => checkAppAccessRights);
    }
    if (!_props.openPopupSettingApp) {
      checkAppAccessRights('');
    }
  }, []);
  const checkAppAccessRights = typeCheck => {
    const platformPermissionsSelected = typeCheck === 'video' ? {
      ios: [PERMISSIONS.IOS.CAMERA],
      android: [PERMISSIONS.ANDROID.CAMERA]
    } : typeCheck === 'audio' ? {
      ios: [PERMISSIONS.IOS.MICROPHONE],
      android: [PERMISSIONS.ANDROID.RECORD_AUDIO]
    } : null;
    // console.log('typeCheck', typeCheck);
    // check()
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }
    const permissions = platformPermissionsSelected === null ? platformPermissions[Platform.OS] : platformPermissionsSelected[Platform.OS];
    let notGranted = [];
    checkMultiple(permissions).then(statuses => {
      permissions.map(p => {
        const status = statuses[p];
        // console.log('status', status);
        // console.log(p);
        if (status === RESULTS.BLOCKED && !showNotification && _props.openPopupSettingApp) {
          setShowNotification(true);
          handleActionOn();
        } else if (status === RESULTS.DENIED) {
          notGranted.push(p);
          if (showNotification) {
            setShowNotification(false);
          }
        } else if (status === RESULTS.GRANTED && showNotification) {
          setShowNotification(false);
        }
      });
      try {
        notGranted.length && requestMultiple(notGranted);
      } catch (error) {
        console.log('errrrrrrr');
      }
    });
  };
  if (!showNotification) {
    return null;
  }
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Animated.View, {
    style: [styles.notificationContainer, animatedStyle]
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.notificationText
  }, "\u1EE8ng d\u1EE5ng c\u1EA7n quy\u1EC1n truy c\u1EADp \u0111\u1EC3 ho\u1EA1t \u0111\u1ED9ng."), /*#__PURE__*/React.createElement(View, {
    style: styles.notificationActions
  }, /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: openSettings,
    style: styles.buttonPopup
  }, /*#__PURE__*/React.createElement(Text, {
    style: [styles.textButtonPopup, {
      color: '#4f80b9ff'
    }]
  }, "M\u1EDF quy\u1EC1n truy c\u1EADp \u1EE9ng d\u1EE5ng")), /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: () => {
      setShowNotification(false);
      opacity.value = 0;
    },
    style: styles.buttonPopup
  }, /*#__PURE__*/React.createElement(Text, {
    style: [styles.textButtonPopup, {
      color: '#4f80b99c'
    }]
  }, "Hu\u1EF7")))));
};
export default CheckStatusPermission;
const styles = StyleSheet.create({
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