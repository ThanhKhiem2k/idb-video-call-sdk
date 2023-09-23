import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import {Icon} from '../icon';
import {useIsMounted} from '../../utils/hooks';
import {
  EventType,
  VideoAspect,
  useZoom,
  ZoomView,
  ZoomVideoSdkUser,
  ZoomVideoSdkUserType,
} from '@zoom/react-native-videosdk';

const SHOW_TALKING_ICON_DURATION = 2000;

export interface VideoViewInterface {
  user?: ZoomVideoSdkUser;
  sharing?: boolean;
  preview?: boolean;
  fullScreen?: boolean;
  focused?: boolean;
  videoAspect?: VideoAspect;
  hasMultiCamera?: boolean;
  multiCameraIndex?: string;
  onPress?: (user: ZoomVideoSdkUser) => void;
}

export function VideoView(props: VideoViewInterface) {
  const {
    user,
    preview,
    sharing,
    fullScreen,
    focused,
    videoAspect,
    hasMultiCamera,
    multiCameraIndex,
  } = props;
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMounted = useIsMounted();
  const zoom = useZoom();
  //virtualBackgroundHelper
  useEffect(() => {
    const updateVideoStatus = () => {
      if (!user) {
        return;
      }
      (async () => {
        isMounted() && setIsVideoOn(await user.videoStatus.isOn());
      })();
    };

    const resetAudioStatus = () => {
      setIsTalking(false);
      setIsMuted(false);
    };

    const updateAudioStatus = async () => {
      if (!isMounted()) {
        return;
      }
      const muted = await user?.audioStatus.isMuted();
      const talking = await user?.audioStatus.isTalking();
      setIsMuted(muted);
      setIsTalking(talking);
      if (talking) {
        setTimeout(() => {
          isMounted() && setIsTalking(false);
        }, SHOW_TALKING_ICON_DURATION);
      }
    };

    updateVideoStatus();

    const userVideoStatusChangedListener = zoom.addListener(
      EventType.onUserVideoStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (user && u.userId === user.userId) {
            updateVideoStatus();
            return;
          }
        });
      },
    );

    const userAudioStatusChangedListener = zoom.addListener(
      EventType.onUserAudioStatusChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (user && u.userId === user.userId) {
            (async () => {
              if (!isMounted()) {
                return;
              }
              resetAudioStatus();
              await updateAudioStatus();
            })();
            return;
          }
        });
      },
    );

    const userActiveAudioChangedListener = zoom.addListener(
      EventType.onUserActiveAudioChanged,
      async ({changedUsers}: {changedUsers: ZoomVideoSdkUserType[]}) => {
        changedUsers.map((u: ZoomVideoSdkUserType) => {
          if (user && u.userId === user.userId) {
            (async () => {
              if (!isMounted()) {
                return;
              }
              await updateAudioStatus();
            })();
            return;
          }
        });
      },
    );

    return () => {
      userVideoStatusChangedListener.remove();
      userAudioStatusChangedListener.remove();
      userActiveAudioChangedListener.remove();
    };
  }, [zoom, user, isMounted]);

  if (!user) {
    return null;
  }

  const audioStatusIcon = (isMuted && 'muted') || (isTalking && 'talking');
  const smallView = [styles.smallView, focused && styles.focusedBorder];
  const containerStyle = fullScreen ? styles.fullScreen : smallView;
  const avatarStyle = fullScreen ? styles.avatarLarge : styles.avatarSmall;
  const aspect = videoAspect || VideoAspect.PanAndScan;

  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <View style={containerStyle}>
        {isVideoOn ? (
          <ZoomView
            style={styles.zoomView}
            userId={user.userId}
            sharing={sharing}
            preview={preview}
            hasMultiCamera={hasMultiCamera}
            multiCameraIndex={multiCameraIndex}
            fullScreen={fullScreen}
            videoAspect={aspect}
          />
        ) : (
          <Icon style={avatarStyle} name="defaultAvatar" />
        )}
        {!fullScreen && (
          <View style={styles.userInfo}>
            {/* <Text style={styles.userName}>{user.userName}</Text> */}
            {audioStatusIcon && (
              <Icon style={styles.audioStatusIcon} name={audioStatusIcon} />
            )}
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallView: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    // overflow: 'hidden',
    // borderWidth: 1.5,
    // borderRadius: 8,
    // borderColor: '#fff',
    // backgroundColor: '#232323',
    // paddingVertical: 7,
  },
  zoomView: {
    width: '100%',
    height: '100%',
  },
  focusedBorder: {
    borderColor: '#0FFF13',
  },
  avatarLarge: {
    width: 200,
    height: 200,
  },
  avatarSmall: {
    width: 60,
    height: 60,
  },
  userInfo: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  userName: {
    fontSize: 12,
    color: '#FFF',
  },
  audioStatusIcon: {
    width: 12,
    height: 12,
  },
});
