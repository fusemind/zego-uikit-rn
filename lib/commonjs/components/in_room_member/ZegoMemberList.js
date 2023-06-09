"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ZegoMemberList;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _ZegoUIKitInternal = _interopRequireDefault(require("../internal/ZegoUIKitInternal"));

var _ZegoMicrophoneStateIcon = _interopRequireDefault(require("../audio_video/ZegoMicrophoneStateIcon"));

var _ZegoCameraStateIcon = _interopRequireDefault(require("../audio_video/ZegoCameraStateIcon"));

var _reactDelegateComponent = _interopRequireDefault(require("react-delegate-component"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ZegoMemberList(props) {
  const {
    showMicrophoneState,
    showCameraState,
    itemBuilder,
    sortUserList
  } = props; // let mockList = [
  //     {
  //       userID: 'bd7acbea',
  //       userName: 'First Item',
  //     },
  //     {
  //       userID: '3ac68afc',
  //       userName: 'Second Item',
  //     },
  //     {
  //       userID: '58694a0f',
  //       userName: 'Third Item',
  //     },
  //     {
  //         userID: '3ac68afa',
  //         userName: 'Four Item',
  //     },
  //     {
  //         userID: '58694a0b',
  //         userName: 'Five Item',
  //     },
  //     {
  //         userID: '3ac68af1',
  //         userName: 'Six Item',
  //     },
  //     {
  //         userID: '58694a0d',
  //         userName: 'Seven Item',
  //     },
  // ];

  const [localUserID, setLocalUserID] = (0, _react.useState)('');
  const [memberList, setMemberList] = (0, _react.useState)([]);

  const refreshMemberList = () => {
    console.log('############refreshMemberList');

    let memberList = _ZegoUIKitInternal.default.getAllUsers();

    if (typeof sortUserList === 'function') {
      const temp = sortUserList(memberList) || memberList;
      setMemberList(arr => [...temp]);
    } else {
      // Update list like this will cause rerender
      memberList.reverse(); // Put yourself first

      const index = memberList.findIndex(user => user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID);
      index !== -1 && (memberList = memberList.splice(index, 1).concat(memberList));
      setMemberList(arr => [...memberList]);
    }
  };

  (0, _react.useEffect)(() => {
    refreshMemberList();
  }, []);

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

  const iconMicView = item => showMicrophoneState ? /*#__PURE__*/_react.default.createElement(_ZegoMicrophoneStateIcon.default, {
    iconMicrophoneOn: require('../internal/resources/gray_icon_video_mic_on.png'),
    iconMicrophoneOff: require('../internal/resources/gray_icon_video_mic_off.png'),
    iconMicrophoneSpeaking: require('../internal/resources/gray_icon_video_mic_speaking.png'),
    userID: item.userID
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.View, null);

  const iconCameraView = item => showCameraState ? /*#__PURE__*/_react.default.createElement(_ZegoCameraStateIcon.default, {
    iconCameraOn: require('../internal/resources/gray_icon_video_camera_on.png'),
    iconCameraOff: require('../internal/resources/gray_icon_video_camera_off.png'),
    userID: item.userID
  }) : /*#__PURE__*/_react.default.createElement(_reactNative.View, null);

  const roleDescription = item => {
    console.warn('===============roleDescription==============', item);

    const localUserID = _ZegoUIKitInternal.default.getLocalUserInfo().userID;

    const showMe = item.userID == localUserID ? 'You' : '';

    if (!showMe) {
      return '';
    } else {
      return `(${showMe})`;
    }
  };

  const renderItem = _ref => {
    let {
      item
    } = _ref;
    return !itemBuilder ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.item
    }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.itemLeft
    }, /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.avatar
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.nameLabel
    }, getShotName(item.userName))), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.name
    }, item.userName + roleDescription(item))), /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.itemRight
    }, iconMicView(item), iconCameraView(item))) : /*#__PURE__*/_react.default.createElement(_reactDelegateComponent.default, {
      to: itemBuilder,
      props: {
        userInfo: item
      }
    });
  };

  (0, _react.useEffect)(() => {
    const callbackID = 'ZegoMemberList' + String(Math.floor(Math.random() * 10000));

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
      console.warn('===============onUserCountOrPropertyChanged==============', userList);

      if (typeof sortUserList === 'function') {
        const temp = sortUserList(userList) || userList;
        setMemberList(arr => [...temp]);
      } else {
        // Put yourself first
        const index = userList.findIndex(user => user.userID == _ZegoUIKitInternal.default.getLocalUserInfo().userID);
        index !== -1 && (userList = userList.splice(index, 1).concat(userList));
        setMemberList(arr => [...userList]);
      }
    });

    _ZegoUIKitInternal.default.onMemberListForceSort(callbackID, userList => {
      console.log('===============onMemberListForceSort==============', userList);

      if (typeof sortUserList === 'function') {
        const temp = sortUserList(userList) || userList;
        setMemberList(arr => [...temp]);
      } else {// Don't deal with
      }
    });

    return () => {
      _ZegoUIKitInternal.default.onSDKConnected(callbackID);

      _ZegoUIKitInternal.default.onRoomStateChanged(callbackID);

      _ZegoUIKitInternal.default.onUserCountOrPropertyChanged(callbackID);

      _ZegoUIKitInternal.default.onMemberListForceSort(callbackID);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return /*#__PURE__*/_react.default.createElement(_reactNative.FlatList, {
    data: memberList,
    renderItem: renderItem,
    keyExtractor: item => item.userID
  });
}

const styles = _reactNative.StyleSheet.create({
  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 17,
    height: 62
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: '#DBDDE3',
    borderRadius: 1000,
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameLabel: {
    flex: 1,
    textAlign: 'center',
    color: '#222222',
    fontSize: 16
  },
  name: {
    fontSize: 16,
    color: '#FFFFFF'
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  }
});
//# sourceMappingURL=ZegoMemberList.js.map