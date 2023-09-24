"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactNative = require("react-native");
const styles = _reactNative.StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#232323'
  },
  fullScreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  connectingWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#232323'
  },
  connectingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  safeArea: {
    flex: 1
  },
  contents: {
    flex: 1,
    alignItems: 'stretch'
  },
  sessionInfo: {
    width: 200,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  sessionInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sessionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF'
  },
  numberOfUsers: {
    fontSize: 13,
    color: '#FFF'
  },
  topWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 8,
    paddingTop: 16
  },
  topRightWrapper: {
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    display: 'flex'
  },
  middleWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  bottomWrapper: {
    paddingHorizontal: 8
  },
  leaveButton: {
    paddingVertical: 4,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  leaveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E02828'
  },
  videoInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  videoInfoText: {
    fontSize: 12,
    color: '#FFF'
  },
  chatList: {
    paddingRight: 16
  },
  chatMessage: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  chatUser: {
    fontSize: 14,
    color: '#CCC'
  },
  chatContent: {
    fontSize: 14,
    color: '#FFF'
  },
  controls: {
    alignSelf: 'center',
    paddingTop: 24
  },
  controlButton: {
    marginBottom: 12
  },
  userList: {
    width: '100%'
  },
  userListContentContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  chatInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  chatInput: {
    flex: 1,
    height: 40,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#666',
    color: '#AAA',
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  chatSendButton: {
    height: 36
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modal: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 16,
    borderRadius: 8,
    backgroundColor: '#FFF'
  },
  modalTitleText: {
    fontSize: 18,
    marginBottom: 8
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  modalAction: {
    marginTop: 16,
    paddingHorizontal: 24
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  },
  moreItem: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  moreItemText: {
    fontSize: 16
  },
  moreItemIcon: {
    width: 36,
    height: 36,
    marginLeft: 48
  },
  moreModalTitle: {
    fontSize: 24
  },
  renameInput: {
    width: 200,
    marginTop: 16,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#AAA',
    color: '#000'
  },
  keyboardArea: {
    height: 0,
    width: 0,
    zIndex: -100
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  smallView: {
    width: 100,
    height: 100,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#666',
    backgroundColor: '#232323'
  },
  zoomView: {
    width: '100%',
    maxWidth: '100%',
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
    alignSelf: 'stretch',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.6)'
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
var _default = styles;
exports.default = _default;
//# sourceMappingURL=call-screen-styles.js.map