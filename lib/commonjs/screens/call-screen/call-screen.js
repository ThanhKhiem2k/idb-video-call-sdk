"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CallScreen = CallScreen;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _videoView = require("../../components/video-view");
var _icon = require("../../components/icon");
var _hooks = require("../../utils/hooks");
var _jwt = _interopRequireDefault(require("../../utils/jwt"));
var _reactNativeReanimated = require("react-native-reanimated");
var _reactNativeIndicator = require("react-native-indicator");
var _reactNativeVideosdk = require("@zoom/react-native-videosdk");
var _netinfo = _interopRequireDefault(require("@react-native-community/netinfo"));
var _reactNativeKeyboardArea = require("react-native-keyboard-area");
var _checkStatusPermission = _interopRequireDefault(require("../../components/check-status-permission/checkStatusPermission"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function CallScreen(_ref) {
  let {
    navigation,
    route
  } = _ref;
  const [isInSession, setIsInSession] = (0, _react.useState)(false);
  const [users, setUsersInSession] = (0, _react.useState)([]);
  const [guestScreenUser, setGuestScreenUser] = (0, _react.useState)();
  const [statusVideoCall, setStatusVideoCall] = (0, _react.useState)(true);
  const [funcHere, setFunction] = (0, _react.useState)();
  const [isHidden, setIsHidden] = (0, _react.useState)(false);
  const [isMuted, setIsMuted] = (0, _react.useState)(true);
  const [isVideoOn, setIsVideoOn] = (0, _react.useState)(false);
  const videoInfoTimer = (0, _react.useRef)(0);
  // react-native-reanimated issue: https://github.com/software-mansion/react-native-reanimated/issues/920
  // Not able to reuse animated style in multiple views.
  const uiOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
  const inputOpacity = (0, _reactNativeReanimated.useSharedValue)(0);
  const isMounted = (0, _hooks.useIsMounted)();
  const zoom = (0, _reactNativeVideosdk.useZoom)();
  const [internetConnectStatus, setInternetConnectStatus] = (0, _react.useState)(true);
  (0, _react.useEffect)(() => {
    (async () => {
      const {
        params
      } = route;
      const token = await (0, _jwt.default)(params.sessionName, params.roleType);
      try {
        await zoom.joinSession({
          sessionName: params.sessionName,
          sessionPassword: params.sessionPassword,
          token: token,
          userName: params.displayName,
          audioOptions: {
            connect: true,
            mute: true
          },
          videoOptions: {
            localVideoOn: true
          },
          sessionIdleTimeoutMins: parseInt(params.sessionIdleTimeoutMins, 10)
        });
      } catch (e) {
        console.log(e);
        setLeaveCall(true);
        _reactNative.Alert.alert('Không thể tham gia cuộc gọi!');
      }
    })();
    if (_reactNative.Platform.OS === 'android') {
      _reactNativeKeyboardArea.RNKeyboard.setWindowSoftInputMode(_reactNativeKeyboardArea.SoftInputMode.SOFT_INPUT_ADJUST_NOTHING);
    }
    return () => {
      if (_reactNative.Platform.OS === 'android') {
        _reactNativeKeyboardArea.RNKeyboard.setWindowSoftInputMode(_reactNativeKeyboardArea.SoftInputMode.SOFT_INPUT_ADJUST_RESIZE);
      }
    };
  }, []);
  let waitingConnectFps = 0;
  (0, _react.useEffect)(() => {
    const updateVideoInfo = () => {
      videoInfoTimer.current = setTimeout(async () => {
        if (!isMounted()) {
          return;
        }
        const videoOn = await (guestScreenUser === null || guestScreenUser === void 0 ? void 0 : guestScreenUser.videoStatus.isOn());
        // Video statistic info doesn't update when there's no remote users
        if (!guestScreenUser || !videoOn || users.length < 2) {
          clearTimeout(videoInfoTimer.current);
          setStatusVideoCall(true);
          return;
        }
        const fps = await guestScreenUser.videoStatisticInfo.getFps();
        // console.log('fps', fps);
        waitingConnectFps++;
        if (fps === 0 && waitingConnectFps >= 3) {
          setStatusVideoCall(false);
        } else {
          setStatusVideoCall(true);
        }
        updateVideoInfo();
      }, 1000);
    };
    updateVideoInfo();
    return () => clearTimeout(videoInfoTimer.current);
  }, [guestScreenUser, users, isMounted]);
  (0, _react.useEffect)(() => {
    if (users.length === 2) {
      // setTimeout(() => {
      setGuestScreenUser(users[1]);
      // }, 2000);
    }
  }, [users]);
  const [leaveCall, setLeaveCall] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    if (leaveCall === true) {
      leaveSession(true);
      _reactNative.Alert.alert('Cuộc gọi đã kết thúc!');
    }
  }, [leaveCall]);
  (0, _react.useEffect)(() => {
    if (internetConnectStatus === false) {
      _reactNative.Alert.alert('Mất kết nối internet!');
    }
  }, [internetConnectStatus]);
  (0, _react.useEffect)(() => {
    _netinfo.default.addEventListener(state => {
      if (state.isConnected === false) {
        setInternetConnectStatus(false);
      } else {
        setInternetConnectStatus(true);
      }
    });
    const handleBackPress = () => {
      setLeaveCall(true);
      return true;
    };
    _reactNative.BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const subscription = _reactNative.AppState.addEventListener('change', appState => {
      if (appState !== 'active') {
        return;
      }
      subscription.remove();
    });
    return () => {
      _reactNative.BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);
  (0, _react.useEffect)(() => {
    const sessionJoinListener = zoom.addListener(_reactNativeVideosdk.EventType.onSessionJoin, async session => {
      setIsInSession(true);
      toggleUI();
      zoom.session.getSessionName();
      const mySelf = new _reactNativeVideosdk.ZoomVideoSdkUser(session.mySelf);
      const remoteUsers = await zoom.session.getRemoteUsers();
      const muted = await mySelf.audioStatus.isMuted();
      const videoOn = await mySelf.videoStatus.isOn();
      setUsersInSession([mySelf, ...remoteUsers]);
      setIsMuted(muted);
      setIsVideoOn(videoOn);
    });
    const sessionLeaveListener = zoom.addListener(_reactNativeVideosdk.EventType.onSessionLeave, async () => {
      setIsInSession(false);
      setUsersInSession([]);
      setLeaveCall(true);
    });
    const sessionNeedPasswordListener = zoom.addListener(_reactNativeVideosdk.EventType.onSessionNeedPassword, () => {});
    const sessionPasswordWrongListener = zoom.addListener(_reactNativeVideosdk.EventType.onSessionPasswordWrong, () => {});
    const userVideoStatusChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserVideoStatusChanged, async _ref2 => {
      let {
        changedUsers
      } = _ref2;
      const mySelf = new _reactNativeVideosdk.ZoomVideoSdkUser(await zoom.session.getMySelf());
      changedUsers.map(u => {
        if (mySelf.userId === u.userId) {
          mySelf.videoStatus.isOn().then(on => setIsVideoOn(on));
        }
      });
      // setFullScreenUser(mySelf);
    });

    const userAudioStatusChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserAudioStatusChanged, async _ref3 => {
      let {
        changedUsers
      } = _ref3;
      const mySelf = new _reactNativeVideosdk.ZoomVideoSdkUser(await zoom.session.getMySelf());
      changedUsers.map(u => {
        if (mySelf.userId === u.userId) {
          mySelf.audioStatus.isMuted().then(muted => setIsMuted(muted));
        }
      });
    });
    const userJoinListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserJoin, async _ref4 => {
      let {
        remoteUsers
      } = _ref4;
      if (!isMounted()) {
        return;
      }
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new _reactNativeVideosdk.ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
      // setFullScreenUser(mySelf);
    });

    const userLeaveListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserLeave, async _ref5 => {
      let {
        remoteUsers,
        leftUsers
      } = _ref5;
      if (!isMounted()) {
        return;
      }
      setLeaveCall(true);
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new _reactNativeVideosdk.ZoomVideoSdkUser(user));
      if (guestScreenUser) {
        leftUsers.map(user => {
          if (guestScreenUser.userId === user.userId) {
            // setFullScreenUser(mySelf);
            return;
          }
        });
      } else {
        // setFullScreenUser(mySelf);
      }
      setUsersInSession([mySelf, ...remote]);
    });
    const userNameChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserNameChanged, async _ref6 => {
      let {
        changedUser
      } = _ref6;
      setUsersInSession(users.map(u => {
        if (u && u.userId === changedUser.userId) {
          return new _reactNativeVideosdk.ZoomVideoSdkUser(changedUser);
        }
        return u;
      }));
    });
    const multiCameraStreamStatusChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onMultiCameraStreamStatusChanged, _ref7 => {
      let {
        status,
        changedUser
      } = _ref7;
      users.map(u => {
        if (changedUser.userId === u.userId) {
          if (status === _reactNativeVideosdk.MultiCameraStreamStatus.Joined) {
            u.hasMultiCamera = true;
          } else if (status === _reactNativeVideosdk.MultiCameraStreamStatus.Left) {
            u.hasMultiCamera = false;
          }
        }
      });
    });
    const eventErrorListener = zoom.addListener(_reactNativeVideosdk.EventType.onError, async error => {
      console.log('Error: ' + JSON.stringify(error));
      switch (error.errorType) {
        case _reactNativeVideosdk.Errors.SessionJoinFailed:
          setLeaveCall(true);
          _reactNative.Alert.alert('Không thể tham gia cuộc gọi!');
          break;
        default:
      }
    });
    return () => {
      sessionJoinListener.remove();
      sessionLeaveListener.remove();
      sessionPasswordWrongListener.remove();
      sessionNeedPasswordListener.remove();
      userVideoStatusChangedListener.remove();
      userAudioStatusChangedListener.remove();
      userJoinListener.remove();
      userLeaveListener.remove();
      userNameChangedListener.remove();
      multiCameraStreamStatusChangedListener.remove();
      eventErrorListener.remove();
    };
  }, [zoom, route, users, isMounted]);
  const toggleUI = () => {
    setTimeout(() => {
      if (isHidden === true) {
        setIsHidden(false);
      } else {
        setIsHidden(true);
      }
    }, 150);
    const easeIn = _reactNativeReanimated.Easing.in(_reactNativeReanimated.Easing.exp);
    const easeOut = _reactNativeReanimated.Easing.out(_reactNativeReanimated.Easing.exp);
    uiOpacity.value = (0, _reactNativeReanimated.withTiming)(uiOpacity.value === 0 ? 100 : 0, {
      duration: 300,
      easing: uiOpacity.value === 0 ? easeIn : easeOut
    });
    inputOpacity.value = (0, _reactNativeReanimated.withTiming)(inputOpacity.value === 0 ? 100 : 0, {
      duration: 300,
      easing: inputOpacity.value === 0 ? easeIn : easeOut
    });
  };
  const leaveSession = endSession => {
    zoom.leaveSession(endSession);
    navigation.goBack();
  };
  const onPressAudio = async () => {
    if (funcHere) {
      funcHere('audio');
    }
    const mySelf = await zoom.session.getMySelf();
    const muted = await mySelf.audioStatus.isMuted();
    setIsMuted(muted);
    muted ? await zoom.audioHelper.unmuteAudio(mySelf.userId) : await zoom.audioHelper.muteAudio(mySelf.userId);
  };
  const onPressVideo = async () => {
    if (funcHere) {
      funcHere('video');
    }
    const mySelf = await zoom.session.getMySelf();
    const videoOn = await mySelf.videoStatus.isOn();
    setIsVideoOn(videoOn);
    videoOn ? await zoom.videoHelper.stopVideo() : await zoom.videoHelper.startVideo();
  };
  const onPressLeave = async () => {
    setLeaveCall(true);
  };
  const contentStyles = {
    ...styles.container
  };
  const microphoneStyle = {
    height: '40%',
    width: '40%',
    tintColor: isMuted ? 'white' : 'white'
  };
  const callbackFunction = childFunction => {
    setFunction(childFunction);
  };
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.backgroundApp
  }, /*#__PURE__*/_react.default.createElement(_checkStatusPermission.default, {
    callbackFunction: callbackFunction,
    openPopupSettingApp: true
  }), /*#__PURE__*/_react.default.createElement(_reactNative.SafeAreaView, {
    style: styles.safeArea
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: contentStyles
  }, users[0] ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.fullScreenVideo
  }, /*#__PURE__*/_react.default.createElement(_videoView.VideoView, {
    preview: false,
    hasMultiCamera: false,
    multiCameraIndex: '0',
    user: users[0],
    onPress: () => {},
    fullScreen: true
  })) : null, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.miniScreenVideo
  }, isInSession && users[1] ? /*#__PURE__*/_react.default.createElement(_videoView.VideoView, {
    user: users[1],
    onPress: () => {}
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.connectingWrapper
  }, users[0] && /*#__PURE__*/_react.default.createElement(_reactNativeIndicator.CirclesLoader, {
    size: 30
  }))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.safeArea,
    pointerEvents: "box-none"
  }, !isInSession || statusVideoCall === false || !internetConnectStatus ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.connectingWrapper
  }, /*#__PURE__*/_react.default.createElement(_reactNativeIndicator.CirclesLoader, {
    size: 50
  }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.connectingText
  }, "Connecting...")) : null)), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.ListButton
  }, /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    activeOpacity: 1,
    onPress: onPressAudio,
    style: [styles.IconButton, {
      backgroundColor: !isMuted ? '#186fe0ff' : '#6c6d78'
    }]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    style: [styles.ImageButton, microphoneStyle],
    source: _icon.icons[isMuted ? 'microphoneOff' : 'microphoneOn']
  })), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    activeOpacity: 1,
    onPress: onPressVideo,
    style: [styles.IconButton, {
      backgroundColor: isVideoOn ? '#186fe0ff' : '#6c6d78'
    }]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    style: [styles.ImageButton, {
      tintColor: isVideoOn ? '#ffffff' : '#ffffff'
    }],
    source: _icon.icons[isVideoOn ? 'videoCamera' : 'videoCameraOff']
  })), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    onPress: () => {
      if (isVideoOn === true) {
        zoom.videoHelper.switchCamera();
      }
    },
    style: styles.IconButton
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    style: styles.ImageButton,
    source: _icon.icons.switchCameraNew
  })), /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    onPress: onPressLeave,
    style: [styles.IconButton, {
      backgroundColor: 'red'
    }]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    style: styles.ImageButton,
    source: _icon.icons[isMuted ? 'hangUp' : 'hangUp']
  })))));
}
const styles = _reactNative.StyleSheet.create({
  backgroundApp: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a36ff',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    width: '95%',
    backgroundColor: '#383950ff',
    borderRadius: 30,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden'
    // borderWidth: 2,
    // borderColor: 'white',
  },

  miniScreenVideo: {
    overflow: 'hidden',
    position: 'absolute',
    width: 120,
    height: 120,
    margin: 20,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    borderColor: '#fff',
    backgroundColor: '#232323'
  },
  connectingWrapper: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  connectingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20
  },
  safeArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute'
  },
  contents: {
    flex: 1,
    alignItems: 'stretch'
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF'
  },
  videoInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  ListButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 15
  },
  IconButton: {
    height: 65,
    width: 65,
    borderRadius: 40,
    backgroundColor: '#6c6d78',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ImageButton: {
    tintColor: '#fff',
    height: '50%',
    width: '50%'
  }
});
//# sourceMappingURL=call-screen.js.map