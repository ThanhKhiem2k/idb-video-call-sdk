import React, {useEffect, useState, useRef} from 'react';
import {
  Alert,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  BackHandler,
  AppState,
} from 'react-native';
import {VideoView} from '../../components/video-view';
import {icons} from '../../components/icon';
import {useIsMounted} from '../../utils/hooks';
import generateJwt from '../../utils/jwt';
import {useSharedValue, Easing, withTiming} from 'react-native-reanimated';
import {CirclesLoader} from 'react-native-indicator';
import {
  EventType,
  useZoom,
  ZoomVideoSdkUser,
  ZoomVideoSdkUserType,
  Errors,
  MultiCameraStreamStatus,
} from '@zoom/react-native-videosdk';
import NetInfo from '@react-native-community/netinfo';
import {RNKeyboard, SoftInputMode} from 'react-native-keyboard-area';
import CheckStatusPermission from '../../components/check-status-permission/checkStatusPermission';
interface CallScreenProps {
  route: any;
}

export function CallScreen({route}: CallScreenProps) {
  const [isInSession, setIsInSession] = useState(false);
  const [users, setUsersInSession] = useState<ZoomVideoSdkUser[]>([]);
  const [guestScreenUser, setGuestScreenUser] = useState<ZoomVideoSdkUser>();
  const [statusVideoCall, setStatusVideoCall] = useState<boolean>(true);
  const [funcHere, setFunction] = useState<Function>();
  const [isHidden, setIsHidden] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const videoInfoTimer = useRef<any>(0);
  // react-native-reanimated issue: https://github.com/software-mansion/react-native-reanimated/issues/920
  // Not able to reuse animated style in multiple views.
  const uiOpacity = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  const isMounted = useIsMounted();
  const zoom = useZoom();
  const [internetConnectStatus, setInternetConnectStatus] =
    useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const {params} = route;
      const token = await generateJwt(params.sessionName, params.roleType);
      try {
        await zoom.joinSession({
          sessionName: params.sessionName,
          sessionPassword: params.sessionPassword,
          token: token,
          userName: params.displayName,
          audioOptions: {
            connect: true,
            mute: true,
          },
          videoOptions: {
            localVideoOn: true,
          },
          sessionIdleTimeoutMins: parseInt(params.sessionIdleTimeoutMins, 10),
        });
      } catch (e) {
        console.log(e);
        setLeaveCall(true);
        Alert.alert('Không thể tham gia cuộc gọi!');
      }
    })();

    if (Platform.OS === 'android') {
      RNKeyboard.setWindowSoftInputMode(
        SoftInputMode.SOFT_INPUT_ADJUST_NOTHING,
      );
    }

    return () => {
      if (Platform.OS === 'android') {
        RNKeyboard.setWindowSoftInputMode(
          SoftInputMode.SOFT_INPUT_ADJUST_RESIZE,
        );
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
        const videoOn = await guestScreenUser?.videoStatus.isOn();
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

  const [leaveCall, setLeaveCall] = useState<boolean>(false);
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
    const sessionJoinListener = zoom.addListener(
      EventType.onSessionJoin,
      async (session: any) => {
        setIsInSession(true);
        toggleUI();
        zoom.session.getSessionName();
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(session.mySelf);
        const remoteUsers: ZoomVideoSdkUser[] =
          await zoom.session.getRemoteUsers();
        const muted = await mySelf.audioStatus.isMuted();
        const videoOn = await mySelf.videoStatus.isOn();
        setUsersInSession([mySelf, ...remoteUsers]);
        setIsMuted(muted);
        setIsVideoOn(videoOn);
      },
    );

    const sessionLeaveListener = zoom.addListener(
      EventType.onSessionLeave,
      async () => {
        setIsInSession(false);
        setUsersInSession([]);
        setLeaveCall(true);
      },
    );

    const sessionNeedPasswordListener = zoom.addListener(
      EventType.onSessionNeedPassword,
      () => {},
    );

    const sessionPasswordWrongListener = zoom.addListener(
      EventType.onSessionPasswordWrong,
      () => {},
    );

    const userVideoStatusChangedListener = zoom.addListener(
      EventType.onUserVideoStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf(),
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.videoStatus.isOn().then((on: boolean) => setIsVideoOn(on));
          }
        });
        // setFullScreenUser(mySelf);
      },
    );

    const userAudioStatusChangedListener = zoom.addListener(
      EventType.onUserAudioStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        const mySelf: ZoomVideoSdkUser = new ZoomVideoSdkUser(
          await zoom.session.getMySelf(),
        );
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (mySelf.userId === u.userId) {
            mySelf.audioStatus
              .isMuted()
              .then((muted: boolean) => setIsMuted(muted));
          }
        });
      },
    );

    const userJoinListener = zoom.addListener(
      EventType.onUserJoin,
      async ({remoteUsers}: {remoteUsers: ZoomVideoSdkUserType[]}) => {
        if (!isMounted()) {
          return;
        }
        const mySelf: ZoomVideoSdkUser = await zoom.session.getMySelf();
        const remote: ZoomVideoSdkUser[] = remoteUsers.map(
          (user: ZoomVideoSdkUserType) => new ZoomVideoSdkUser(user),
        );
        setUsersInSession([mySelf, ...remote]);
        // setFullScreenUser(mySelf);
      },
    );

    const userLeaveListener = zoom.addListener(
      EventType.onUserLeave,
      async ({
        remoteUsers,
        leftUsers,
      }: {
        remoteUsers: ZoomVideoSdkUserType[];
        leftUsers: ZoomVideoSdkUserType[];
      }) => {
        if (!isMounted()) {
          return;
        }
        setLeaveCall(true);
        const mySelf: ZoomVideoSdkUser = await zoom.session.getMySelf();
        const remote: ZoomVideoSdkUser[] = remoteUsers.map(
          (user: ZoomVideoSdkUserType) => new ZoomVideoSdkUser(user),
        );
        if (guestScreenUser) {
          leftUsers.map((user: ZoomVideoSdkUserType) => {
            if (guestScreenUser.userId === user.userId) {
              // setFullScreenUser(mySelf);
              return;
            }
          });
        } else {
          // setFullScreenUser(mySelf);
        }
        setUsersInSession([mySelf, ...remote]);
      },
    );

    const userNameChangedListener = zoom.addListener(
      EventType.onUserNameChanged,
      async ({changedUser}) => {
        setUsersInSession(
          users.map((u: ZoomVideoSdkUser) => {
            if (u && u.userId === changedUser.userId) {
              return new ZoomVideoSdkUser(changedUser);
            }
            return u;
          }),
        );
      },
    );

    const multiCameraStreamStatusChangedListener = zoom.addListener(
      EventType.onMultiCameraStreamStatusChanged,
      ({
        status,
        changedUser,
      }: {
        status: MultiCameraStreamStatus;
        changedUser: ZoomVideoSdkUser;
      }) => {
        users.map((u: ZoomVideoSdkUserType) => {
          if (changedUser.userId === u.userId) {
            if (status === MultiCameraStreamStatus.Joined) {
              u.hasMultiCamera = true;
            } else if (status === MultiCameraStreamStatus.Left) {
              u.hasMultiCamera = false;
            }
          }
        });
      },
    );

    const eventErrorListener = zoom.addListener(
      EventType.onError,
      async (error: any) => {
        console.log('Error: ' + JSON.stringify(error));
        switch (error.errorType) {
          case Errors.SessionJoinFailed:
            setLeaveCall(true);
            Alert.alert('Không thể tham gia cuộc gọi!');
            break;
          default:
        }
      },
    );

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
      easing: uiOpacity.value === 0 ? easeIn : easeOut,
    });
    inputOpacity.value = withTiming(inputOpacity.value === 0 ? 100 : 0, {
      duration: 300,
      easing: inputOpacity.value === 0 ? easeIn : easeOut,
    });
  };

  const leaveSession = (endSession: boolean) => {
    zoom.leaveSession(endSession);
    // navigation.goBack();
  };

  const onPressAudio = async () => {
    if (funcHere) {
      funcHere('audio');
    }
    const mySelf = await zoom.session.getMySelf();
    const muted = await mySelf.audioStatus.isMuted();
    setIsMuted(muted);
    muted
      ? await zoom.audioHelper.unmuteAudio(mySelf.userId)
      : await zoom.audioHelper.muteAudio(mySelf.userId);
  };

  const onPressVideo = async () => {
    if (funcHere) {
      funcHere('video');
    }
    const mySelf = await zoom.session.getMySelf();
    const videoOn = await mySelf.videoStatus.isOn();
    setIsVideoOn(videoOn);
    videoOn
      ? await zoom.videoHelper.stopVideo()
      : await zoom.videoHelper.startVideo();
  };

  const onPressLeave = async () => {
    setLeaveCall(true);
  };

  const contentStyles = {
    ...styles.container,
  };
  const microphoneStyle = {
    height: '40%',
    width: '40%',
    tintColor: isMuted ? 'white' : 'white',
  };
  const callbackFunction = (childFunction: Function) => {
    setFunction(childFunction);
  };

  return (
    <View style={styles.backgroundApp}>
      <CheckStatusPermission
        callbackFunction={callbackFunction}
        openPopupSettingApp={true}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={contentStyles}>
          {users[0] ? (
            <View style={styles.fullScreenVideo}>
              <VideoView
                preview={false}
                hasMultiCamera={false}
                multiCameraIndex={'0'}
                user={users[0]}
                onPress={() => {}}
                fullScreen
              />
            </View>
          ) : null}
          <View style={styles.miniScreenVideo}>
            {isInSession && users[1] ? (
              <VideoView user={users[1]} onPress={() => {}} />
            ) : (
              <View style={styles.connectingWrapper}>
                {users[0] && <CirclesLoader size={30} />}
              </View>
            )}
          </View>
          <View style={styles.safeArea} pointerEvents="box-none">
            {!isInSession ||
            statusVideoCall === false ||
            !internetConnectStatus ? (
              <View style={styles.connectingWrapper}>
                <CirclesLoader size={50} />
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.ListButton}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onPressAudio}
            style={[
              styles.IconButton,
              {backgroundColor: !isMuted ? '#186fe0ff' : '#6c6d78'},
            ]}>
            <Image
              style={[styles.ImageButton, microphoneStyle]}
              source={icons[isMuted ? 'microphoneOff' : 'microphoneOn']}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={onPressVideo}
            style={[
              styles.IconButton,
              {backgroundColor: isVideoOn ? '#186fe0ff' : '#6c6d78'},
            ]}>
            <Image
              style={[
                styles.ImageButton,
                {tintColor: isVideoOn ? '#ffffff' : '#ffffff'},
              ]}
              source={icons[isVideoOn ? 'videoCamera' : 'videoCameraOff']}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (isVideoOn === true) {
                zoom.videoHelper.switchCamera();
              }
            }}
            style={styles.IconButton}>
            <Image style={styles.ImageButton} source={icons.switchCameraNew} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onPressLeave}
            style={[styles.IconButton, {backgroundColor: 'red'}]}>
            <Image
              style={styles.ImageButton}
              source={icons[isMuted ? 'hangUp' : 'hangUp']}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundApp: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a36ff',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '95%',
    backgroundColor: '#383950ff',
    borderRadius: 30,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
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
    backgroundColor: '#232323',
  },
  connectingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 20,
  },
  safeArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  contents: {
    flex: 1,
    alignItems: 'stretch',
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  videoInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  ListButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    margin: 15,
  },
  IconButton: {
    height: 65,
    width: 65,
    borderRadius: 40,
    backgroundColor: '#6c6d78',
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ImageButton: {
    tintColor: '#fff',
    height: '50%',
    width: '50%',
  },
});
