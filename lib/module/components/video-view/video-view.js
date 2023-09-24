import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Icon } from '../icon';
import { useIsMounted } from '../../utils/hooks';
import { EventType, VideoAspect, useZoom, ZoomView } from '@zoom/react-native-videosdk';
const SHOW_TALKING_ICON_DURATION = 2000;
export function VideoView(props) {
  const {
    user,
    preview,
    sharing,
    fullScreen,
    focused,
    videoAspect,
    hasMultiCamera,
    multiCameraIndex
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
      const muted = await (user === null || user === void 0 ? void 0 : user.audioStatus.isMuted());
      const talking = await (user === null || user === void 0 ? void 0 : user.audioStatus.isTalking());
      setIsMuted(muted);
      setIsTalking(talking);
      if (talking) {
        setTimeout(() => {
          isMounted() && setIsTalking(false);
        }, SHOW_TALKING_ICON_DURATION);
      }
    };
    updateVideoStatus();
    const userVideoStatusChangedListener = zoom.addListener(EventType.onUserVideoStatusChanged, async _ref => {
      let {
        changedUsers
      } = _ref;
      changedUsers.map(u => {
        if (user && u.userId === user.userId) {
          updateVideoStatus();
          return;
        }
      });
    });
    const userAudioStatusChangedListener = zoom.addListener(EventType.onUserAudioStatusChanged, async _ref2 => {
      let {
        changedUsers
      } = _ref2;
      changedUsers.map(u => {
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
    });
    const userActiveAudioChangedListener = zoom.addListener(EventType.onUserActiveAudioChanged, async _ref3 => {
      let {
        changedUsers
      } = _ref3;
      changedUsers.map(u => {
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
    });
    return () => {
      userVideoStatusChangedListener.remove();
      userAudioStatusChangedListener.remove();
      userActiveAudioChangedListener.remove();
    };
  }, [zoom, user, isMounted]);
  if (!user) {
    return null;
  }
  const audioStatusIcon = isMuted && 'muted' || isTalking && 'talking';
  const smallView = [styles.smallView, focused && styles.focusedBorder];
  const containerStyle = fullScreen ? styles.fullScreen : smallView;
  const avatarStyle = fullScreen ? styles.avatarLarge : styles.avatarSmall;
  const aspect = videoAspect || VideoAspect.PanAndScan;
  return /*#__PURE__*/React.createElement(TouchableWithoutFeedback, {
    onPress: () => {}
  }, /*#__PURE__*/React.createElement(View, {
    style: containerStyle
  }, isVideoOn ? /*#__PURE__*/React.createElement(ZoomView, {
    style: styles.zoomView,
    userId: user.userId,
    sharing: sharing,
    preview: preview,
    hasMultiCamera: hasMultiCamera,
    multiCameraIndex: multiCameraIndex,
    fullScreen: fullScreen,
    videoAspect: aspect
  }) : /*#__PURE__*/React.createElement(Icon, {
    style: avatarStyle,
    name: "defaultAvatar"
  }), !fullScreen && /*#__PURE__*/React.createElement(View, {
    style: styles.userInfo
  }, audioStatusIcon && /*#__PURE__*/React.createElement(Icon, {
    style: styles.audioStatusIcon,
    name: audioStatusIcon
  }))));
}
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  smallView: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
    // overflow: 'hidden',
    // borderWidth: 1.5,
    // borderRadius: 8,
    // borderColor: '#fff',
    // backgroundColor: '#232323',
    // paddingVertical: 7,
  },

  zoomView: {
    width: '100%',
    height: '100%'
  },
  focusedBorder: {
    borderColor: '#0FFF13'
  },
  avatarLarge: {
    width: 200,
    height: 200
  },
  avatarSmall: {
    width: 60,
    height: 60
  },
  userInfo: {
    flexDirection: 'row',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch'
  },
  userName: {
    fontSize: 12,
    color: '#FFF'
  },
  audioStatusIcon: {
    width: 12,
    height: 12
  }
});
//# sourceMappingURL=video-view.js.map