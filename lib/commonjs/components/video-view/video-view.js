"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoView = VideoView;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _icon = require("../icon");
var _hooks = require("../../utils/hooks");
var _reactNativeVideosdk = require("@zoom/react-native-videosdk");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const SHOW_TALKING_ICON_DURATION = 2000;
function VideoView(props) {
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
  const [isVideoOn, setIsVideoOn] = (0, _react.useState)(false);
  const [isTalking, setIsTalking] = (0, _react.useState)(false);
  const [isMuted, setIsMuted] = (0, _react.useState)(false);
  const isMounted = (0, _hooks.useIsMounted)();
  const zoom = (0, _reactNativeVideosdk.useZoom)();
  //virtualBackgroundHelper
  (0, _react.useEffect)(() => {
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
    const userVideoStatusChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserVideoStatusChanged, async _ref => {
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
    const userAudioStatusChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserAudioStatusChanged, async _ref2 => {
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
    const userActiveAudioChangedListener = zoom.addListener(_reactNativeVideosdk.EventType.onUserActiveAudioChanged, async _ref3 => {
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
  const aspect = videoAspect || _reactNativeVideosdk.VideoAspect.PanAndScan;
  return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableWithoutFeedback, {
    onPress: () => {}
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: containerStyle
  }, isVideoOn ? /*#__PURE__*/_react.default.createElement(_reactNativeVideosdk.ZoomView, {
    style: styles.zoomView,
    userId: user.userId,
    sharing: sharing,
    preview: preview,
    hasMultiCamera: hasMultiCamera,
    multiCameraIndex: multiCameraIndex,
    fullScreen: fullScreen,
    videoAspect: aspect
  }) : /*#__PURE__*/_react.default.createElement(_icon.Icon, {
    style: avatarStyle,
    name: "defaultAvatar"
  }), !fullScreen && /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.userInfo
  }, audioStatusIcon && /*#__PURE__*/_react.default.createElement(_icon.Icon, {
    style: styles.audioStatusIcon,
    name: audioStatusIcon
  }))));
}
const styles = _reactNative.StyleSheet.create({
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