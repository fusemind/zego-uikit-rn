"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = GalleryLayout;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _ZegoUIKitInternal = _interopRequireDefault(require("../../internal/ZegoUIKitInternal"));

var _ZegoAudioVideoView = _interopRequireDefault(require("../../audio_video/ZegoAudioVideoView"));

var _MoreFrame = _interopRequireDefault(require("./MoreFrame"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function GalleryLayout(props) {
  const {
    config = {},
    foregroundBuilder,
    audioVideoConfig = {}
  } = props;
  const {
    addBorderRadiusAndSpacingBetweenView = true,
    // Whether to display rounded corners and spacing between Views
    ownViewBackgroundColor = '',
    othersViewBackgroundColor = '',
    ownViewBackgroundImage = '',
    othersViewBackgroundImage = ''
  } = config;
  const {
    useVideoViewAspectFill = false,
    showSoundWavesInAudioMode = true
  } = audioVideoConfig;
  const [localUserID, setLocalUserID] = (0, _react.useState)('');
  const [userList, setUserList] = (0, _react.useState)([]);
  const [moreUserList, setMoreUserList] = (0, _react.useState)([]);
  (0, _react.useEffect)(() => {
    const callbackID = 'GalleryLayout' + String(Math.floor(Math.random() * 10000));

    _ZegoUIKitInternal.default.onSDKConnected(callbackID, () => {
      setLocalUserID(_ZegoUIKitInternal.default.getLocalUserInfo().userID);
    });

    _ZegoUIKitInternal.default.onRoomStateChanged(callbackID, (reason, errorCode, extendedData) => {
      if (reason == 1 || reason == 4) {
        setLocalUserID(_ZegoUIKitInternal.default.getLocalUserInfo().userID);
      } else if (reason == 2 || reason == 5 || reason == 6 || reason == 7) {
        // ZegoRoomStateChangedReasonLoginFailed
        // ZegoRoomStateChangedReasonReconnectFailed
        // ZegoRoomStateChangedReasonKickOut
        // ZegoRoomStateChangedReasonLogout
        // ZegoRoomStateChangedReasonLogoutFailed
        setLocalUserID('');
      }
    });

    _ZegoUIKitInternal.default.onUserCountOrPropertyChanged(callbackID, userList => {
      // console.warn('>>>>>>>>>>> onUserCountOrPropertyChanged', userList)
      // Put yourself first
      const index = userList.findIndex(user => user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID);
      index !== -1 && (userList = userList.splice(index, 1).concat(userList));
      setUserList(userList.slice(0, 7));
      setMoreUserList(userList.slice(7));
    });

    return () => {
      _ZegoUIKitInternal.default.onSDKConnected(callbackID);

      _ZegoUIKitInternal.default.onRoomStateChanged(callbackID);

      _ZegoUIKitInternal.default.onUserCountOrPropertyChanged(callbackID);
    };
  }, []);

  const getAudioVideoViewStyle = () => {
    const len = userList.length;
    let audioVideoViewSizeStyle;

    switch (len) {
      case 1:
        audioVideoViewSizeStyle = styles.audioVideoViewSize1;
        break;

      case 2:
        audioVideoViewSizeStyle = styles.audioVideoViewSize2;
        break;

      case 3:
      case 4:
        audioVideoViewSizeStyle = styles.audioVideoViewSize4;
        break;

      case 5:
      case 6:
        audioVideoViewSizeStyle = styles.audioVideoViewSize6;
        break;

      case 7:
      case 8:
        audioVideoViewSizeStyle = styles.audioVideoViewSize8;
        break;

      default:
        audioVideoViewSizeStyle = styles.audioVideoViewSizeMore;
        break;
    }

    return audioVideoViewSizeStyle;
  };

  const isAudioVideoViewPadding = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewPadding : null;
  const isAudioVideoViewBorder = addBorderRadiusAndSpacingBetweenView && userList.length > 1 ? styles.audioVideoViewBorder : null;
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.container, isAudioVideoViewPadding]
  }, userList.map((user, index) => /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    key: user.userID,
    style: [styles.audioVideoViewContainer, getAudioVideoViewStyle(), isAudioVideoViewPadding]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.audioVideoViewSubContainer, isAudioVideoViewBorder]
  }, /*#__PURE__*/_react.default.createElement(_ZegoAudioVideoView.default, {
    userID: user.userID,
    audioViewBackgroudColor: user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor,
    audioViewBackgroudImage: user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage,
    showSoundWave: showSoundWavesInAudioMode,
    useVideoViewAspectFill: useVideoViewAspectFill,
    foregroundBuilder: foregroundBuilder
  })))), moreUserList.length <= 1 ? moreUserList.map((user, index) => /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    key: user.userID,
    style: [styles.audioVideoViewContainer, getAudioVideoViewStyle(), isAudioVideoViewPadding]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.audioVideoViewSubContainer, isAudioVideoViewBorder]
  }, /*#__PURE__*/_react.default.createElement(_ZegoAudioVideoView.default, {
    userID: user.userID,
    audioViewBackgroudColor: user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID ? ownViewBackgroundColor : othersViewBackgroundColor,
    audioViewBackgroudImage: user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID ? ownViewBackgroundImage : othersViewBackgroundImage,
    showSoundWave: showSoundWavesInAudioMode,
    useVideoViewAspectFill: useVideoViewAspectFill,
    foregroundBuilder: foregroundBuilder
  })))) : /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.audioVideoViewContainer, getAudioVideoViewStyle(), isAudioVideoViewPadding]
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.audioVideoViewSubContainer, isAudioVideoViewBorder]
  }, /*#__PURE__*/_react.default.createElement(_MoreFrame.default, {
    userList: moreUserList,
    useVideoViewAspectFill: useVideoViewAspectFill,
    audioViewBackgroudColor: othersViewBackgroundColor,
    audioViewBackgroudImage: othersViewBackgroundImage
  }))));
}

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#171821',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  audioVideoViewContainer: {
    zIndex: 1
  },
  audioVideoViewSubContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#D8D8D8'
  },
  audioVideoViewBorder: {
    borderRadius: 10
  },
  audioVideoViewPadding: {
    paddingLeft: 2.5,
    paddingRight: 2.5,
    paddingTop: 2.5,
    paddingBottom: 2.5
  },
  audioVideoViewSize1: {
    width: '100%',
    height: '100%'
  },
  audioVideoViewSize2: {
    width: '100%',
    height: '50%'
  },
  audioVideoViewSize4: {
    width: '50%',
    height: '50%'
  },
  audioVideoViewSize6: {
    width: '50%',
    height: '33.33%'
  },
  audioVideoViewSize8: {
    width: '50%',
    height: '25%'
  },
  audioVideoViewSizeMore: {
    width: '50%',
    height: '25%'
  }
});
//# sourceMappingURL=GalleryLayout.js.map