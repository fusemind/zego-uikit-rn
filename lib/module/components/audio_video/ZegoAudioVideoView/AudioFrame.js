import { View, StyleSheet, Text, ImageBackground, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';
const defaultAvatarSizeRatio = 129 / 375;
const flexStyle = ['center', 'flex-start', 'flex-end'];
export default function AudioFrame(props) {
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
  const [soundLevel, setSoundLevel] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  });
  const [isLoadError, setIsLoadError] = useState(false);

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

  useEffect(() => {
    ZegoUIKitInternal.onSoundLevelUpdate('AudioFrame' + userInfo.userID, (userID, soundLevel) => {
      if (userInfo.userID == userID) {
        setSoundLevel(soundLevel);
      }
    });
    return () => {
      ZegoUIKitInternal.onSoundLevelUpdate('AudioFrame' + userInfo.userID);
    };
  }, []);
  return /*#__PURE__*/React.createElement(View, {
    style: cstyle(audioViewBackgroudColor ? audioViewBackgroudColor : '#4A4B4D').container,
    onLayout: event => {
      setDimensions({
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height
      });
    }
  }, /*#__PURE__*/React.createElement(ImageBackground, {
    source: audioViewBackgroudImage ? {
      uri: audioViewBackgroudImage
    } : null,
    resizeMode: "cover",
    style: [styles.imgBackground, {
      justifyContent: flexStyle[avatarAlignment]
    }]
  }, showSoundWave && soundLevel > 5 ? /*#__PURE__*/React.createElement(View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + 0.04 * dimensions.width, soundWaveColor, 1).circleWave
  }, soundLevel > 10 ? /*#__PURE__*/React.createElement(View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + 0.06 * dimensions.width, soundWaveColor, 0.6).subCircleWave
  }) : null, soundLevel > 15 ? /*#__PURE__*/React.createElement(View, {
    style: waveStyle((avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width) + +0.08 * dimensions.width, soundWaveColor, 0.3).subCircleWave
  }) : null) : /*#__PURE__*/React.createElement(View, null), /*#__PURE__*/React.createElement(View, {
    style: [styles.avatar, {
      width: avatarSize ? avatarSize.width : defaultAvatarSizeRatio * dimensions.width
    }]
  }, !avatar || isLoadError ? /*#__PURE__*/React.createElement(Text, {
    style: styles.nameLabel
  }, getShotName(userInfo.userName)) : /*#__PURE__*/React.createElement(Image, {
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

const cstyle = bgColor => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: bgColor
  }
});

const waveStyle = (w, color, opacity) => StyleSheet.create({
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

const styles = StyleSheet.create({
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