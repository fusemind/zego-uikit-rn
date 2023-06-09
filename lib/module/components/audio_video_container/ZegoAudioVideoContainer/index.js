import React from "react";
import { Text, View, StyleSheet } from "react-native";
import PictureInPictureWindow from './PictureInPictureLayout';
import GalleryLayout from './GalleryLayout';
import { ZegoLayoutMode } from "./defines";
export default function ZegoAudioVideoContainer(props) {
  const {
    foregroundBuilder,
    layout,
    audioVideoConfig = {},
    sortAudioVideo
  } = props;
  const {
    mode = ZegoLayoutMode.pictureInPicture
  } = layout;
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, mode == 0 ? /*#__PURE__*/React.createElement(PictureInPictureWindow, {
    audioVideoConfig: audioVideoConfig,
    config: layout,
    sortAudioVideo: sortAudioVideo,
    foregroundBuilder: foregroundBuilder
  }) : /*#__PURE__*/React.createElement(GalleryLayout, {
    audioVideoConfig: audioVideoConfig,
    config: layout,
    sortAudioVideo: sortAudioVideo,
    foregroundBuilder: foregroundBuilder
  }));
}
export { ZegoLayoutMode };
const styles = StyleSheet.create({
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