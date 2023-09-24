import React, { useEffect, useState, useRef } from 'react';
import { Alert, SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Image, Platform, BackHandler, AppState } from 'react-native';
import { VideoView } from '../../components/video-view';
import { icons } from '../../components/icon';
import { useIsMounted } from '../../utils/hooks';
import generateJwt from '../../utils/jwt';
import { useSharedValue, Easing, withTiming } from 'react-native-reanimated';
import { CirclesLoader } from 'react-native-indicator';
import { EventType, useZoom, ZoomVideoSdkUser, Errors, MultiCameraStreamStatus } from '@zoom/react-native-videosdk';
import NetInfo from '@react-native-community/netinfo';
import { RNKeyboard, SoftInputMode } from 'react-native-keyboard-area';
import CheckStatusPermission from '../../components/check-status-permission/checkStatusPermission';
export function CallScreen(_ref) {
  let {
    navigation,
    route
  } = _ref;
  const [isInSession, setIsInSession] = useState(false);
  const [users, setUsersInSession] = useState([]);
  const [guestScreenUser, setGuestScreenUser] = useState();
  const [statusVideoCall, setStatusVideoCall] = useState(true);
  const [funcHere, setFunction] = useState();
  const [isHidden, setIsHidden] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const videoInfoTimer = useRef(0);
  // react-native-reanimated issue: https://github.com/software-mansion/react-native-reanimated/issues/920
  // Not able to reuse animated style in multiple views.
  const uiOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  const isMounted = useIsMounted();
  const zoom = useZoom();
  const [internetConnectStatus, setInternetConnectStatus] = useState(true);
  useEffect(() => {
    (async () => {
      const {
        params
      } = route;
      const token = await generateJwt(params.sessionName, params.roleType);
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
        Alert.alert('Không thể tham gia cuộc gọi!');
      }
    })();
    if (Platform.OS === 'android') {
      RNKeyboard.setWindowSoftInputMode(SoftInputMode.SOFT_INPUT_ADJUST_NOTHING);
    }
    return () => {
      if (Platform.OS === 'android') {
        RNKeyboard.setWindowSoftInputMode(SoftInputMode.SOFT_INPUT_ADJUST_RESIZE);
      }
    };
  }, []);
  let waitingConnectFps = 0;
  useEffect(() => {
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
  useEffect(() => {
    if (users.length === 2) {
      // setTimeout(() => {
      setGuestScreenUser(users[1]);
      // }, 2000);
    }
  }, [users]);
  const [leaveCall, setLeaveCall] = useState(false);
  useEffect(() => {
    if (leaveCall === true) {
      leaveSession(true);
      Alert.alert('Cuộc gọi đã kết thúc!');
    }
  }, [leaveCall]);
  useEffect(() => {
    if (internetConnectStatus === false) {
      Alert.alert('Mất kết nối internet!');
    }
  }, [internetConnectStatus]);
  useEffect(() => {
    NetInfo.addEventListener(state => {
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
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const subscription = AppState.addEventListener('change', appState => {
      if (appState !== 'active') {
        return;
      }
      subscription.remove();
    });
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, []);
  useEffect(() => {
    const sessionJoinListener = zoom.addListener(EventType.onSessionJoin, async session => {
      setIsInSession(true);
      toggleUI();
      zoom.session.getSessionName();
      const mySelf = new ZoomVideoSdkUser(session.mySelf);
      const remoteUsers = await zoom.session.getRemoteUsers();
      const muted = await mySelf.audioStatus.isMuted();
      const videoOn = await mySelf.videoStatus.isOn();
      setUsersInSession([mySelf, ...remoteUsers]);
      setIsMuted(muted);
      setIsVideoOn(videoOn);
    });
    const sessionLeaveListener = zoom.addListener(EventType.onSessionLeave, async () => {
      setIsInSession(false);
      setUsersInSession([]);
      setLeaveCall(true);
    });
    const sessionNeedPasswordListener = zoom.addListener(EventType.onSessionNeedPassword, () => {});
    const sessionPasswordWrongListener = zoom.addListener(EventType.onSessionPasswordWrong, () => {});
    const userVideoStatusChangedListener = zoom.addListener(EventType.onUserVideoStatusChanged, async _ref2 => {
      let {
        changedUsers
      } = _ref2;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      changedUsers.map(u => {
        if (mySelf.userId === u.userId) {
          mySelf.videoStatus.isOn().then(on => setIsVideoOn(on));
        }
      });
      // setFullScreenUser(mySelf);
    });

    const userAudioStatusChangedListener = zoom.addListener(EventType.onUserAudioStatusChanged, async _ref3 => {
      let {
        changedUsers
      } = _ref3;
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      changedUsers.map(u => {
        if (mySelf.userId === u.userId) {
          mySelf.audioStatus.isMuted().then(muted => setIsMuted(muted));
        }
      });
    });
    const userJoinListener = zoom.addListener(EventType.onUserJoin, async _ref4 => {
      let {
        remoteUsers
      } = _ref4;
      if (!isMounted()) {
        return;
      }
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
      setUsersInSession([mySelf, ...remote]);
      // setFullScreenUser(mySelf);
    });

    const userLeaveListener = zoom.addListener(EventType.onUserLeave, async _ref5 => {
      let {
        remoteUsers,
        leftUsers
      } = _ref5;
      if (!isMounted()) {
        return;
      }
      setLeaveCall(true);
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
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
    const userNameChangedListener = zoom.addListener(EventType.onUserNameChanged, async _ref6 => {
      let {
        changedUser
      } = _ref6;
      setUsersInSession(users.map(u => {
        if (u && u.userId === changedUser.userId) {
          return new ZoomVideoSdkUser(changedUser);
        }
        return u;
      }));
    });
    const multiCameraStreamStatusChangedListener = zoom.addListener(EventType.onMultiCameraStreamStatusChanged, _ref7 => {
      let {
        status,
        changedUser
      } = _ref7;
      users.map(u => {
        if (changedUser.userId === u.userId) {
          if (status === MultiCameraStreamStatus.Joined) {
            u.hasMultiCamera = true;
          } else if (status === MultiCameraStreamStatus.Left) {
            u.hasMultiCamera = false;
          }
        }
      });
    });
    const eventErrorListener = zoom.addListener(EventType.onError, async error => {
      console.log('Error: ' + JSON.stringify(error));
      switch (error.errorType) {
        case Errors.SessionJoinFailed:
          setLeaveCall(true);
          Alert.alert('Không thể tham gia cuộc gọi!');
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
    const easeIn = Easing.in(Easing.exp);
    const easeOut = Easing.out(Easing.exp);
    uiOpacity.value = withTiming(uiOpacity.value === 0 ? 100 : 0, {
      duration: 300,
      easing: uiOpacity.value === 0 ? easeIn : easeOut
    });
    inputOpacity.value = withTiming(inputOpacity.value === 0 ? 100 : 0, {
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
  return /*#__PURE__*/React.createElement(View, {
    style: styles.backgroundApp
  }, /*#__PURE__*/React.createElement(CheckStatusPermission, {
    callbackFunction: callbackFunction,
    openPopupSettingApp: true
  }), /*#__PURE__*/React.createElement(SafeAreaView, {
    style: styles.safeArea
  }, /*#__PURE__*/React.createElement(View, {
    style: contentStyles
  }, users[0] ? /*#__PURE__*/React.createElement(View, {
    style: styles.fullScreenVideo
  }, /*#__PURE__*/React.createElement(VideoView, {
    preview: false,
    hasMultiCamera: false,
    multiCameraIndex: '0',
    user: users[0],
    onPress: () => {},
    fullScreen: true
  })) : null, /*#__PURE__*/React.createElement(View, {
    style: styles.miniScreenVideo
  }, isInSession && users[1] ? /*#__PURE__*/React.createElement(VideoView, {
    user: users[1],
    onPress: () => {}
  }) : /*#__PURE__*/React.createElement(View, {
    style: styles.connectingWrapper
  }, users[0] && /*#__PURE__*/React.createElement(CirclesLoader, {
    size: 30
  }))), /*#__PURE__*/React.createElement(View, {
    style: styles.safeArea,
    pointerEvents: "box-none"
  }, !isInSession || statusVideoCall === false || !internetConnectStatus ? /*#__PURE__*/React.createElement(View, {
    style: styles.connectingWrapper
  }, /*#__PURE__*/React.createElement(CirclesLoader, {
    size: 50
  }), /*#__PURE__*/React.createElement(Text, {
    style: styles.connectingText
  }, "Connecting...")) : null)), /*#__PURE__*/React.createElement(View, {
    style: styles.ListButton
  }, /*#__PURE__*/React.createElement(TouchableOpacity, {
    activeOpacity: 1,
    onPress: onPressAudio,
    style: [styles.IconButton, {
      backgroundColor: !isMuted ? '#186fe0ff' : '#6c6d78'
    }]
  }, /*#__PURE__*/React.createElement(Image, {
    style: [styles.ImageButton, microphoneStyle],
    source: icons[isMuted ? 'microphoneOff' : 'microphoneOn']
  })), /*#__PURE__*/React.createElement(TouchableOpacity, {
    activeOpacity: 1,
    onPress: onPressVideo,
    style: [styles.IconButton, {
      backgroundColor: isVideoOn ? '#186fe0ff' : '#6c6d78'
    }]
  }, /*#__PURE__*/React.createElement(Image, {
    style: [styles.ImageButton, {
      tintColor: isVideoOn ? '#ffffff' : '#ffffff'
    }],
    source: icons[isVideoOn ? 'videoCamera' : 'videoCameraOff']
  })), /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: () => {
      if (isVideoOn === true) {
        zoom.videoHelper.switchCamera();
      }
    },
    style: styles.IconButton
  }, /*#__PURE__*/React.createElement(Image, {
    style: styles.ImageButton,
    source: icons.switchCameraNew
  })), /*#__PURE__*/React.createElement(TouchableOpacity, {
    onPress: onPressLeave,
    style: [styles.IconButton, {
      backgroundColor: 'red'
    }]
  }, /*#__PURE__*/React.createElement(Image, {
    style: styles.ImageButton,
    source: icons[isMuted ? 'hangUp' : 'hangUp']
  })))));
}
const styles = StyleSheet.create({
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