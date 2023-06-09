"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ZegoLayoutMode", {
  enumerable: true,
  get: function () {
    return _defines.ZegoLayoutMode;
  }
});
exports.default = ZegoAudioVideoContainer;

var _react = _interopRequireDefault(require("react"));

var _reactNative = require("react-native");

var _PictureInPictureLayout = _interopRequireDefault(require("./PictureInPictureLayout"));

var _GalleryLayout = _interopRequireDefault(require("./GalleryLayout"));

var _defines = require("./defines");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ZegoAudioVideoContainer(props) {
  const {
    foregroundBuilder,
    layout,
    audioVideoConfig = {},
    sortAudioVideo
  } = props;
  const {
    mode = _defines.ZegoLayoutMode.pictureInPicture
  } = layout;
  return /*#__PURE__*/_react.default.createElement(_reactNative.View, {
    style: styles.container
  }, mode == 0 ? /*#__PURE__*/_react.default.createElement(_PictureInPictureLayout.default, {
    audioVideoConfig: audioVideoConfig,
    config: layout,
    sortAudioVideo: sortAudioVideo,
    foregroundBuilder: foregroundBuilder
  }) : /*#__PURE__*/_react.default.createElement(_GalleryLayout.default, {
    audioVideoConfig: audioVideoConfig,
    config: layout,
    sortAudioVideo: sortAudioVideo,
    foregroundBuilder: foregroundBuilder
  }));
}

const styles = _reactNative.StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  audioVideoView: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'red',
    zIndex: 1
  }
});
//# sourceMappingURL=index.js.map