"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ZegoVideoView;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _reactDelegateComponent = _interopRequireDefault(require("react-delegate-component"));

var _AudioFrame = _interopRequireDefault(require("./AudioFrame"));

var _VideoFrame = _interopRequireDefault(require("./VideoFrame"));

var _ZegoUIKitInternal = _interopRequireDefault(require("../../internal/ZegoUIKitInternal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function MaskViewDefault(props) {
  const {
    userInfo
  } = props;
  const {
    userName = ''
  } = userInfo;
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.defaultMaskContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.defaultMaskNameLabelContainer
  }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.defaultMaskNameLabel
  }, userName)));
}

function ZegoVideoView(props) {
  const {
    userID,
    roomID,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    showSoundWave = true,
    useVideoViewAspectFill = false,
    foregroundBuilder,
    avatarSize,
    avatarAlignment = 0,
    soundWaveColor
  } = props;
  const [userInfo, setUserInfo] = (0, _react.useState)({});
  const [isCameraOn, setIsCameraOn] = (0, _react.useState)(true);
  const [propsData, setPropsData] = (0, _react.useState)({
    userInfo: {}
  });

  const userInfo_ = _ZegoUIKitInternal.default.getUser(userID);

  const inRoomAttributes = userInfo_ ? userInfo_.inRoomAttributes : {};
  const [avatar, setAvatarUrl] = (0, _react.useState)(inRoomAttributes ? inRoomAttributes.avatar || '' : '');
  (0, _react.useEffect)(() => {
    const user = _ZegoUIKitInternal.default.getUser(userID);

    if (user) {
      setUserInfo(user);
      setPropsData({
        userInfo: user
      });
      setIsCameraOn(user.isCameraDeviceOn);
    }
  }, []);
  (0, _react.useEffect)(() => {
    const callbackID = 'ZegoVideoView' + String(userID);

    _ZegoUIKitInternal.default.onSDKConnected(callbackID, () => {
      const user = _ZegoUIKitInternal.default.getUser(userID);

      if (user) {
        setUserInfo(user);
        setPropsData({
          userInfo: user
        });
        setIsCameraOn(user.isCameraDeviceOn);
      }
    });

    _ZegoUIKitInternal.default.onUserInfoUpdate(callbackID, info => {
      if (info.userID == userID) {
        setIsCameraOn(info.isCameraDeviceOn);
        setUserInfo(info);
        setPropsData({
          userInfo: info
        });
      }
    });

    _ZegoUIKitInternal.default.onRoomStateChanged(callbackID, (reason, errorCode, extendedData) => {
      if (_ZegoUIKitInternal.default.isRoomConnected()) {
        const user = _ZegoUIKitInternal.default.getUser(userID);

        if (user) {
          setIsCameraOn(user.isCameraDeviceOn);
        }
      }
    });

    _ZegoUIKitInternal.default.onUserCountOrPropertyChanged(callbackID, userList => {
      console.log('=========[ZegoVideoView]onUserCountOrPropertyChanged=========', userID, userList);
      userList.forEach(user => {
        const temp = user.inRoomAttributes ? user.inRoomAttributes.avatar : '';

        if (user.userID === userID && temp) {
          setAvatarUrl(temp);
        }
      });
    });

    return () => {
      _ZegoUIKitInternal.default.onSDKConnected(callbackID);

      _ZegoUIKitInternal.default.onUserInfoUpdate(callbackID);

      _ZegoUIKitInternal.default.onRoomStateChanged(callbackID);

      _ZegoUIKitInternal.default.onUserCountOrPropertyChanged(callbackID);
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/_react.default.createElement(_VideoFrame.default, {
    style: styles.videoContainer,
    userID: userID,
    roomID: roomID,
    fillMode: useVideoViewAspectFill ? 1 : 0 // 1:AspectFill, 0:AspectFit

  }, !isCameraOn ? /*#__PURE__*/_react.default.createElement(_AudioFrame.default, {
    userInfo: userInfo,
    showSoundWave: showSoundWave,
    audioViewBackgroudColor: audioViewBackgroudColor,
    audioViewBackgroudImage: audioViewBackgroudImage,
    avatarSize: avatarSize,
    avatarAlignment: avatarAlignment,
    avatar: avatar,
    soundWaveColor: soundWaveColor
  }) : null), /*#__PURE__*/_react.default.createElement(_reactDelegateComponent.default, {
    style: styles.mask,
    to: foregroundBuilder,
    default: MaskViewDefault,
    props: propsData
  }));
}

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  mask: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 2
  },
  defaultMaskContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2
  },
  defaultMaskNameLabelContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    opacity: 0.5,
    position: 'absolute',
    alignSelf: 'center',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 3,
    paddingTop: 3,
    borderRadius: 6,
    bottom: 5,
    right: 5
  },
  defaultMaskNameLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12
  }
});
//# sourceMappingURL=index.js.map