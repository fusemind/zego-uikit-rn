"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = AudioFrame;

var _reactNative = require("react-native");

var _react = _interopRequireWildcard(require("react"));

var _ZegoUIKitInternal = _interopRequireDefault(require("../../internal/ZegoUIKitInternal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const defaultAvatarSizeRatio = 129 / 375;
const flexStyle = ['center', 'flex-start', 'flex-end'];

function AudioFrame(props) {
  const {
    userInfo,
    showSoundWave,
    audioViewBackgroudColor,
    audioViewBackgroudImage,
    avatarSize,
    avatarAlignment,
    soundWaveColor = '#6B6A71',
    avatar = ''
  } = props;
  const [soundLevel, setSoundLevel] = (0, _react.useState)(0);
  const [dimensions, setDimensions] = (0, _react.useState)({
    width: 0,
    height: 0
  });
  const [isLoadError, setIsLoadError] = (0, _react.useState)(false);

  const getShotName = name => {
    if (!name) {
      return '';
    }

    const nl = name.split(' ');
    var shotName = '';
    nl.forEach(part => {
      if (part !== '') {
        shotName += part.substring(0, 1);
      }
    });
    return shotName;
  };

  (0, _react.useEffect)(() => {
    _ZegoUIKitInternal.default.onSoundLevelUpdate('AudioFrame' + userInfo.userID, (userID, soundLevel) => {
      if (userInfo.userID == userID) {
        setSoundLevel(soundLevel);
      }
    });

    return () => {
      _ZegoUIKitInternal.default.onSoundLevelUpdate('AudioFrame' + userInfo.userID);
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: cstyle(audioViewBackgroudColor ? audioViewBackgroudColor : '#4A4B4D').container,
    onLayout: event => {
      setDimensions({
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      });
    }
  }, /*#__PURE__*/_react.default.createElement(_reactNative.ImageBackground, {
    source: audioViewBackgroudImage ? {
      uri: audioViewBackgroudImage
    } : null,
    resizeMode: "cover",
    style: [styles.imgBackground, {
      justifyContent: flexStyle[avatarAlignment]
    }]
  }, showSoundWave && soundLevel > 5 ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + 0.04 * dimensions.width, soundWaveColor, 1).circleWave
  }, soundLevel > 10 ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + 0.06 * dimensions.width, soundWaveColor, 0.6).subCircleWave
  }) : null, soundLevel > 15 ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + +0.08 * dimensions.width, soundWaveColor, 0.3).subCircleWave
  }) : null) : /*#__PURE__*/_react.default.createElement(_reactNative.View, null), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: [styles.avatar, {
      width: avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width
    }]
  }, !avatar || isLoadError ? /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
    style: styles.nameLabel
  }, getShotName(userInfo.userName)) : /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
    style: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain'
    },
    resizeMode: "contain",
    source: {
      uri: avatar
    },
    onLoadStart: () => console.log('avatar onLoadStart'),
    onLoadEnd: () => console.log('avatar onLoadEnd'),
    onError: () => {
      console.log('avatar onError');
      setIsLoadError(true);
    },
    onLoad: () => {
      console.log('avatar onLoad');
      setIsLoadError(false);
    }
  }))));
}

const cstyle = bgColor => _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: bgColor
  }
});

const waveStyle = (w, color, opacity) => _reactNative.StyleSheet.create({
  circleWave: {
    flex: 1,
    position: 'absolute',
    alignSelf: 'center',
    width: w,
    //((w / 375) * 100).toString() + '%',
    aspectRatio: 1,
    borderRadius: 1000,
    backgroundColor: color,
    opacity: opacity,
    zIndex: 0,
    justifyContent: 'center',
    alignContent: 'center'
  },
  subCircleWave: {
    flex: 1,
    position: 'absolute',
    alignSelf: 'center',
    width: w,
    //((w / 164) * 100).toString() + '%',
    aspectRatio: 1,
    borderRadius: 1000,
    backgroundColor: color,
    opacity: opacity,
    zIndex: 0
  }
});

const styles = _reactNative.StyleSheet.create({
  imgBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  avatar: {
    flex: 1,
    marginTop: 1.5,
    marginBottom: 1.5,
    width: (129 / 375 * 100).toString() + '%',
    aspectRatio: 1,
    borderRadius: 1000,
    backgroundColor: '#DBDDE3',
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  nameLabel: {
    flex: 1,
    position: 'absolute',
    color: '#222222',
    fontSize: 22
  }
});
//# sourceMappingURL=AudioFrame.js.map