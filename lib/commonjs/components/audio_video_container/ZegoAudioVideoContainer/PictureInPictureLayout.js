"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PictureInPictureLayout;

var _react = _interopRequireWildcard(require("react"));

var _ZegoUIKitInternal = _interopRequireDefault(require("../../internal/ZegoUIKitInternal"));

var _ZegoAudioVideoView = _interopRequireDefault(require("../../audio_video/ZegoAudioVideoView"));

var _reactNative = require("react-native");

var _defines = require("./defines");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function PictureInPictureLayout(props) {
  const {
    config = {},
    foregroundBuilder,
    audioVideoConfig = {},
    sortAudioVideo
  } = props;
  const {
    isSmallViewDraggable = false,
    // TODO
    smallViewBackgroundColor = '',
    largeViewBackgroundColor = '',
    smallViewBackgroundImage = '',
    largeViewBackgroundImage = '',
    smallViewPostion = _defines.ZegoViewPostion.bottomRight,
    switchLargeOrSmallViewByClick = true,
    smallViewSize = {
      width: 85,
      height: 151
    },
    spacingBetweenSmallViews = 8,
    removeViewWhenAudioVideoUnavailable = false
  } = config;
  const {
    useVideoViewAspectFill = false,
    showSoundWavesInAudioMode = true
  } = audioVideoConfig;
  const realTimeData = (0, _react.useRef)();
  const [globalAudioVideoUserList, setGlobalAudioVideoUserList] = (0, _react.useState)([]);
  const panResponder = (0, _react.useRef)(_reactNative.PanResponder.create({
    onStartShouldSetPanResponderCapture: () => {
      console.log('Switch the big screen');
    }
  })).current;
  (0, _react.useEffect)(() => {
    realTimeData.current = [];
    const callbackID = 'PictureInPictureLayout' + String(Math.floor(Math.random() * 10000));

    _ZegoUIKitInternal.default.onAudioVideoAvailable(callbackID, userList => {
      userList.forEach(user => {
        const result = realTimeData.current.find(item => user.userID === item.userID);

        if (!result) {
          realTimeData.current.push(user);
          setGlobalAudioVideoUserList(arr => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
        }
      });
    });

    _ZegoUIKitInternal.default.onAudioVideoUnavailable(callbackID, userList => {
      if (removeViewWhenAudioVideoUnavailable) {
        userList.forEach(user => {
          const result = realTimeData.current.findIndex(item => user.userID === item.userID);

          if (result !== -1) {
            realTimeData.current.splice(result, 1);
            setGlobalAudioVideoUserList(arr => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
          }
        });
      }
    });

    _ZegoUIKitInternal.default.onAudioVideoListForceSort(callbackID, () => {
      setGlobalAudioVideoUserList(arr => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
    });

    _ZegoUIKitInternal.default.onUserLeave(callbackID, userList => {
      if (!removeViewWhenAudioVideoUnavailable) {
        userList.forEach(user => {
          const result = realTimeData.current.findIndex(item => user.userID === item.userID);

          if (result !== -1) {
            realTimeData.current.splice(result, 1);
            setGlobalAudioVideoUserList(arr => [...(sortAudioVideo ? sortAudioVideo(realTimeData.current) : realTimeData.current)]);
          }
        });
      }
    });

    return () => {
      _ZegoUIKitInternal.default.onAudioVideoListForceSort(callbackID);

      _ZegoUIKitInternal.default.onAudioVideoAvailable(callbackID);

      _ZegoUIKitInternal.default.onAudioVideoUnavailable(callbackID);

      _ZegoUIKitInternal.default.onUserLeave(callbackID);
    };
  }, []);

  const getSmallViewPostStyle = () => {
    const styleList = [styles.smallViewPostTopLeft, styles.smallViewPostTopRight, styles.smallViewPostBottomLeft, styles.smallViewPostBottomRight];

    if (smallViewPostion >= _defines.ZegoViewPostion.topLeft && smallViewPostion <= _defines.ZegoViewPostion.bottomRight) {
      return styleList[smallViewPostion];
    } else {
      return styles.smallViewPostTopLeft;
    }
  };

  const switchLargeOrSmallView = (index, user) => {
    if (switchLargeOrSmallViewByClick) {
      globalAudioVideoUserList[0] = globalAudioVideoUserList.splice(index + 1, 1, globalAudioVideoUserList[0])[0];
      setGlobalAudioVideoUserList(arr => [...globalAudioVideoUserList]);
      realTimeData.current = globalAudioVideoUserList;
    }
  };

  const layoutHandle = event => {
    const {
      nativeEvent
    } = event;
    const {
      layout
    } = nativeEvent;
    const {
      width,
      height,
      x,
      y
    } = layout;
    console.log('######layoutHandle', layout);
  };

  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.container
  }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.smallViewContainer, getSmallViewPostStyle()],
    onLayout: layoutHandle
  }, globalAudioVideoUserList.slice(1, 4).map((user, index) => /*#__PURE__*/_react.default.createElement(_reactNative.TouchableWithoutFeedback, _extends({}, panResponder.panHandlers, {
    onPress: switchLargeOrSmallView.bind(this, index, user)
  }), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    key: user.userID,
    style: [styles.smallView, styles.smallViewBorder, getSmallViewSize(smallViewSize.width, smallViewSize.height).smallViewSize, getSmallViewSpacing(spacingBetweenSmallViews).smallViewSpacing]
  }, /*#__PURE__*/_react.default.createElement(_ZegoAudioVideoView.default, {
    key: user.userID,
    userID: user.userID,
    audioViewBackgroudColor: smallViewBackgroundColor,
    audioViewBackgroudImage: smallViewBackgroundImage,
    showSoundWave: showSoundWavesInAudioMode,
    useVideoViewAspectFill: useVideoViewAspectFill,
    foregroundBuilder: foregroundBuilder
  }))))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.bigView
  }, globalAudioVideoUserList[0] ? /*#__PURE__*/_react.default.createElement(_ZegoAudioVideoView.default, {
    key: globalAudioVideoUserList[0].userID,
    userID: globalAudioVideoUserList[0].userID,
    audioViewBackgroudColor: largeViewBackgroundColor,
    audioViewBackgroudImage: largeViewBackgroundImage,
    showSoundWave: showSoundWavesInAudioMode,
    useVideoViewAspectFill: useVideoViewAspectFill,
    foregroundBuilder: foregroundBuilder
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.View, null)));
}

const getSmallViewSize = (width, height) => _reactNative.StyleSheet.create({
  smallViewSize: {
    width,
    height
  }
});

const getSmallViewSpacing = margin => _reactNative.StyleSheet.create({
  smallViewSpacing: {
    marginBottom: margin
  }
});

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  bigView: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#4A4B4D',
    zIndex: 1
  },
  smallViewContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: 12 // height: '76%',

  },
  smallView: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#4A4B4D'
  },
  smallViewBorder: {
    borderWidth: 0.5,
    borderColor: '#A4A4A4'
  },
  smallViewPostTopLeft: {
    top: 80,
    left: 12
  },
  smallViewPostTopRight: {
    top: 80,
    right: 12
  },
  smallViewPostBottomLeft: {
    bottom: 100,
    left: 12,
    justifyContent: 'flex-end'
  },
  smallViewPostBottomRight: {
    bottom: 100,
    right: 12,
    justifyContent: 'flex-end'
  }
});
//# sourceMappingURL=PictureInPictureLayout.js.map