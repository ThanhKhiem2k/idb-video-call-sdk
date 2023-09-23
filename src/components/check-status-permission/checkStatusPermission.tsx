import * as React from 'react';
import {View, Platform, StyleSheet, Text} from 'react-native';
import {
  checkMultiple,
  requestMultiple,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
  PermissionStatus,
} from 'react-native-permissions';
import {useEffect, useState} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface checkStatusPermission {
  openPopupSettingApp: Boolean;
  callbackFunction: Function | undefined;
}

const CheckStatusPermission = (_props: checkStatusPermission) => {
  const [showNotification, setShowNotification] = useState(false);
  const opacity = useSharedValue(0);
  const handleActionOn = () => {
    opacity.value = withSpring(1, {damping: 100, stiffness: 100});
  };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });
  const platformPermissions = {
    ios: [
      PERMISSIONS.IOS.CAMERA,
      PERMISSIONS.IOS.MICROPHONE,
      //PERMISSIONS.IOS.PHOTO_LIBRARY,
    ],
    android: [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      // PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      // PERMISSIONS.ANDROID.READ_PHONE_STATE,
      // PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ],
  };
  useEffect(() => {
    if (_props.callbackFunction) {
      _props.callbackFunction(() => checkAppAccessRights);
    }
    if (!_props.openPopupSettingApp) {
      checkAppAccessRights('');
    }
  }, []);

  const checkAppAccessRights = (typeCheck: string) => {
    const platformPermissionsSelected =
      typeCheck === 'video'
        ? {
            ios: [PERMISSIONS.IOS.CAMERA],
            android: [PERMISSIONS.ANDROID.CAMERA],
          }
        : typeCheck === 'audio'
        ? {
            ios: [PERMISSIONS.IOS.MICROPHONE],
            android: [PERMISSIONS.ANDROID.RECORD_AUDIO],
          }
        : null;
    // console.log('typeCheck', typeCheck);
    // check()
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }
    const permissions =
      platformPermissionsSelected === null
        ? platformPermissions[Platform.OS]
        : platformPermissionsSelected[Platform.OS];
    let notGranted: Permission[] = [];
    checkMultiple(permissions).then(
      (statuses: Record<Permission[number], PermissionStatus>) => {
        permissions.map((p: Permission) => {
          const status = statuses[p];
          // console.log('status', status);
          // console.log(p);
          if (
            status === RESULTS.BLOCKED &&
            !showNotification &&
            _props.openPopupSettingApp
          ) {
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
      },
    );
  };

  if (!showNotification) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.notificationContainer, animatedStyle]}>
        <Text style={styles.notificationText}>
          Ứng dụng cần quyền truy cập để hoạt động.
        </Text>
        <View style={styles.notificationActions}>
          <TouchableOpacity onPress={openSettings} style={styles.buttonPopup}>
            <Text style={[styles.textButtonPopup, {color: '#4f80b9ff'}]}>
              Mở quyền truy cập ứng dụng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowNotification(false);
              opacity.value = 0;
            }}
            style={styles.buttonPopup}>
            <Text style={[styles.textButtonPopup, {color: '#4f80b99c'}]}>
              Huỷ
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  notificationContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    justifyContent: 'space-between',
  },
  notificationText: {
    marginBottom: 10,
    padding: 20,
    fontSize: 20,
    textAlign: 'center',
  },
  notificationActions: {
    justifyContent: 'space-around',
  },
  buttonPopup: {
    borderTopWidth: 1,
    borderTopColor: '#45454533',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    // backgroundColor: '#45454533',
  },
  textButtonPopup: {
    fontSize: 18,
  },
});
