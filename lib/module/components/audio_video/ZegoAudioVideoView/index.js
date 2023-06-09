import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Delegate from 'react-delegate-component';
import AudioFrame from './AudioFrame';
import VideoFrame from './VideoFrame';
import ZegoUIKitInternal from '../../internal/ZegoUIKitInternal';

function MaskViewDefault(props) {
  const {
    userInfo
  } = props;
  const {
    userName = ''
  } = userInfo;
  return /*#__PURE__*/React.createElement(View, {
    style: styles.defaultMaskContainer
  }, /*#__PURE__*/React.createElement(View, {
    style: styles.defaultMaskNameLabelContainer
  }, /*#__PURE__*/React.createElement(Text, {
    style: styles.defaultMaskNameLabel
  }, userName)));
}

export default function ZegoVideoView(props) {
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
  const [userInfo, setUserInfo] = useState({});
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [propsData, setPropsData] = useState({
    userInfo: {}
  });
  const userInfo_ = ZegoUIKitInternal.getUser(userID);
  const inRoomAttributes = userInfo_ ? userInfo_.inRoomAttributes : {};
  const [avatar, setAvatarUrl] = useState(inRoomAttributes ? inRoomAttributes.avatar || '' : '');
  useEffect(() => {
    const user = ZegoUIKitInternal.getUser(userID);

    if (user) {
      setUserInfo(user);
      setPropsData({
        userInfo: user
      });
      setIsCameraOn(user.isCameraDeviceOn);
    }
  }, []);
  useEffect(() => {
    const callbackID = 'ZegoVideoView' + String(userID);
    ZegoUIKitInternal.onSDKConnected(callbackID, () => {
      const user = ZegoUIKitInternal.getUser(userID);

      if (user) {
        setUserInfo(user);
        setPropsData({
          userInfo: user
        });
        setIsCameraOn(user.isCameraDeviceOn);
      }
    });
    ZegoUIKitInternal.onUserInfoUpdate(callbackID, info => {
      if (info.userID == userID) {
        setIsCameraOn(info.isCameraDeviceOn);
        setUserInfo(info);
        setPropsData({
          userInfo: info
        });
      }
    });
    ZegoUIKitInternal.onRoomStateChanged(callbackID, (reason, errorCode, extendedData) => {
      if (ZegoUIKitInternal.isRoomConnected()) {
        const user = ZegoUIKitInternal.getUser(userID);

        if (user) {
          setIsCameraOn(user.isCameraDeviceOn);
        }
      }
    });
    ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID, userList => {
      console.log('=========[ZegoVideoView]onUserCountOrPropertyChanged=========', userID, userList);
      userList.forEach(user => {
        const temp = user.inRoomAttributes ? user.inRoomAttributes.avatar : '';

        if (user.userID === userID && temp) {
          setAvatarUrl(temp);
        }
      });
    });
    return () => {
      ZegoUIKitInternal.onSDKConnected(callbackID);
      ZegoUIKitInternal.onUserInfoUpdate(callbackID);
      ZegoUIKitInternal.onRoomStateChanged(callbackID);
      ZegoUIKitInternal.onUserCountOrPropertyChanged(callbackID);
    };
  }, []);
  return /*#__PURE__*/React.createElement(View, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(VideoFrame, {
    style: styles.videoContainer,
    userID: userID,
    roomID: roomID,
    fillMode: useVideoViewAspectFill ? 1 : 0 // 1:AspectFill, 0:AspectFit

  }, !isCameraOn ? /*#__PURE__*/React.createElement(AudioFrame, {
    userInfo: userInfo,
    showSoundWave: showSoundWave,
    audioViewBackgroudColor: audioViewBackgroudColor,
    audioViewBackgroudImage: audioViewBackgroudImage,
    avatarSize: avatarSize,
    avatarAlignment: avatarAlignment,
    avatar: avatar,
    soundWaveColor: soundWaveColor
  }) : null), /*#__PURE__*/React.createElement(Delegate, {
    style: styles.mask,
    to: foregroundBuilder,
    default: MaskViewDefault,
    props: propsData
  }));
}
const styles = StyleSheet.create({
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