"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _zegoExpressEngineReactnative = _interopRequireDefault(require("zego-express-engine-reactnative"));

var _logger = require("../../utils/logger");

var _defines = require("./defines");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _appInfo = {
  appID: 0,
  appSign: ''
};
var _isRoomConnected = false;
var _currentRoomState = 7; // Logout

var _currentRoomID = '';
var _audioOutputType = 0;
var _usingFrontFacingCamera = true;
var _onMicDeviceOnCallbackMap = {};
var _onCameraDeviceOnCallbackMap = {};
var _onRoomStateChangedCallbackMap = {};
var _onRequireNewTokenCallbackMap = {};
var _onUserJoinCallbackMap = {};
var _onUserLeaveCallbackMap = {};
var _onUserInfoUpdateCallbackMap = {};
var _onSoundLevelUpdateCallbackMap = {};
var _onSDKConnectedCallbackMap = {};
var _onAudioOutputDeviceTypeChangeCallbackMap = {};
var _onOnlySelfInRoomCallbackMap = {};
var _onUserCountOrPropertyChangedCallbackMap = {};
var _onAudioVideoAvailableCallbackMap = {};
var _onAudioVideoUnavailableCallbackMap = {};
var _onInRoomMessageReceivedCallbackMap = {};
var _onInRoomMessageSentCallbackMap = {};
var _onRoomPropertyUpdatedCallbackMap = {};
var _onRoomPropertiesFullUpdatedCallbackMap = {};
var _onInRoomCommandReceivedCallbackMap = {};
var _onMeRemovedFromRoomCallbackMap = {};
var _onTurnOnYourCameraRequestCallbackMap = {};
var _onTurnOnYourMicrophoneRequestCallbackMap = {}; // Force update component callback

var _onMemberListForceSortCallbackMap = {};
var _onAudioVideoListForceSortCallbackMap = {};

var _localCoreUser = _createCoreUser('', '', '', {});

var _streamCoreUserMap = {}; // <streamID, CoreUser>

var _coreUserMap = {}; // <userID, CoreUser>

var _qualityUpdateLogCounter = 0;
var _inRoomMessageList = [];
var _audioVideoResourceMode = _defines.ZegoAudioVideoResourceMode.Default;
var _roomProperties = {};
var _isLargeRoom = false;
var _roomMemberCount = 0;
var _markAsLargeRoom = false;

function _resetData() {
  (0, _logger.zloginfo)('Reset all data.');
  _appInfo = {
    appID: 0,
    appSign: ''
  };
  _localCoreUser = _createCoreUser('', '', '', {});
  _streamCoreUserMap = {};
  _coreUserMap = {};
  _currentRoomID = '';
  _currentRoomState = 7;
  _isRoomConnected = false;
  _audioOutputType = 0;
  _inRoomMessageList = [];
  _audioVideoResourceMode = _defines.ZegoAudioVideoResourceMode.Default;
  _isLargeRoom = false;
  _roomMemberCount = 0;
  _markAsLargeRoom = false;
}

function _resetDataForLeavingRoom() {
  (0, _logger.zloginfo)('Reset data for leaving room.');
  _streamCoreUserMap = {};
  _coreUserMap = {};
  _currentRoomID = '';
  _currentRoomState = 7;
  _isRoomConnected = false;
  const {
    userID,
    userName,
    profileUrl,
    extendInfo
  } = _localCoreUser;
  _localCoreUser = _createCoreUser(userID, userName, profileUrl, extendInfo);
  _coreUserMap[_localCoreUser.userID] = _localCoreUser;
  _inRoomMessageList = [];
  _roomProperties = {};
  _isLargeRoom = false;
  _roomMemberCount = 0;
  _markAsLargeRoom = false;
}

function _createPublicUser(coreUser) {
  return {
    userID: coreUser.userID,
    userName: coreUser.userName,
    extendInfo: coreUser.extendInfo,
    isMicrophoneOn: coreUser.isMicDeviceOn,
    isCameraOn: coreUser.isCameraDeviceOn,
    soundLevel: coreUser.soundLevel,
    inRoomAttributes: coreUser.inRoomAttributes
  };
}

function _createCoreUser(userID, userName, profileUrl, extendInfo) {
  return {
    userID: userID,
    userName: userName,
    profileUrl: profileUrl,
    extendInfo: extendInfo,
    viewID: -1,
    viewFillMode: 1,
    streamID: '',
    isMicDeviceOn: false,
    isCameraDeviceOn: false,
    publisherQuality: 0,
    soundLevel: 0,
    joinTime: 0,
    inRoomAttributes: {}
  };
}

function _isLocalUser(userID) {
  return userID === undefined || userID === '' || _localCoreUser.userID === userID;
}

function _setLocalUserInfo(userInfo) {
  _localCoreUser = _createCoreUser(userInfo.userID, userInfo.userName, userInfo.profileUrl, userInfo.extendInfo);
  _coreUserMap[userInfo.userID] = _localCoreUser;
}

function _onRoomUserUpdate(roomID, updateType, userList) {
  // No need for roomID, does not support multi-room right now.
  const userInfoList = [];

  if (updateType == 0) {
    _roomMemberCount += userList.length;

    if (_roomMemberCount >= 500) {
      _isLargeRoom = true;
    }

    userList.forEach(user => {
      if (!(user.userID in _coreUserMap)) {
        const coreUser = _createCoreUser(user.userID, user.userName);

        _coreUserMap[user.userID] = coreUser;
      }

      const streamID = _getStreamIDByUserID(user.userID);

      if (streamID in _streamCoreUserMap) {
        _coreUserMap[user.userID].streamID = streamID;
      }

      _coreUserMap[user.userID].joinTime = Date.now();

      _notifyUserInfoUpdate(_coreUserMap[user.userID]);

      userInfoList.push(_createPublicUser(_coreUserMap[user.userID])); // Start after user insert into list

      _tryStartPlayStream(user.userID);
    });

    _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.userAdd);

    (0, _logger.zloginfo)('User Join: ', userInfoList);
    Object.keys(_onUserJoinCallbackMap).forEach(callbackID => {
      if (_onUserJoinCallbackMap[callbackID]) {
        _onUserJoinCallbackMap[callbackID](userInfoList);
      }
    });
  } else {
    _roomMemberCount -= userList.length;
    userList.forEach(user => {
      if (user.userID in _coreUserMap) {
        const coreUser = _coreUserMap[user.userID];
        const userInfo = {
          userID: coreUser.userID,
          userName: coreUser.userName,
          profileUrl: coreUser.profileUrl,
          extendInfo: coreUser.extendInfo
        };
        userInfoList.push(userInfo); // Stop play stream before remove user list

        _tryStopPlayStream(coreUser.userID, true);

        delete _coreUserMap[user.userID];
      }
    });

    _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.userDelete);

    (0, _logger.zloginfo)('User Leave: ', userInfoList);
    Object.keys(_onUserLeaveCallbackMap).forEach(callbackID => {
      if (_onUserLeaveCallbackMap[callbackID]) {
        _onUserLeaveCallbackMap[callbackID](userInfoList);
      }
    });

    if (Object.keys(_coreUserMap).length <= 1) {
      Object.keys(_onOnlySelfInRoomCallbackMap).forEach(callbackID => {
        if (_onOnlySelfInRoomCallbackMap[callbackID]) {
          _onOnlySelfInRoomCallbackMap[callbackID]();
        }
      });
    }
  }
}

function _onRoomStreamUpdate(roomID, updateType, streamList) {
  (0, _logger.zloginfo)('_onRoomStreamUpdate: ', roomID, updateType, streamList);
  var users = [];

  if (updateType == 0) {
    // Add
    streamList.forEach(stream => {
      const userID = stream.user.userID;
      const userName = stream.user.userName;
      const streamID = stream.streamID;

      if (userID in _coreUserMap) {
        _coreUserMap[userID].streamID = streamID;
        _streamCoreUserMap[streamID] = _coreUserMap[userID];

        _notifyUserInfoUpdate(_coreUserMap[userID]);

        _tryStartPlayStream(userID);

        users.push(_coreUserMap[userID]);
      } else {
        _streamCoreUserMap[streamID] = _createCoreUser(userID, userName, '', {});
        _streamCoreUserMap[streamID].streamID = streamID;
        _coreUserMap[userID] = _streamCoreUserMap[streamID];
        users.push(_streamCoreUserMap[streamID]);
      }
    });
    Object.keys(_onAudioVideoAvailableCallbackMap).forEach(callbackID => {
      if (_onAudioVideoAvailableCallbackMap[callbackID]) {
        _onAudioVideoAvailableCallbackMap[callbackID](users);
      }
    });
  } else {
    streamList.forEach(stream => {
      const userID = stream.user.userID;
      const streamID = stream.streamID;

      if (userID in _coreUserMap) {
        _tryStopPlayStream(userID, true);

        _coreUserMap[userID].isCameraDeviceOn = false;
        _coreUserMap[userID].isMicDeviceOn = false;
        _coreUserMap[userID].streamID = '';

        _notifyUserInfoUpdate(_coreUserMap[userID]);

        users.push(_coreUserMap[userID]);
        delete _streamCoreUserMap[streamID];
      }
    });

    _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.cameraStateUpdate);

    Object.keys(_onAudioVideoUnavailableCallbackMap).forEach(callbackID => {
      if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
        _onAudioVideoUnavailableCallbackMap[callbackID](users);
      }
    });
  }
}

function _onRemoteCameraStateUpdate(userID, isOn) {
  console.warn('>>>>>>>>>>>>> _onRemoteCameraStateUpdate', userID, isOn);

  if (userID in _coreUserMap) {
    _coreUserMap[userID].isCameraDeviceOn = isOn;

    _notifyUserInfoUpdate(_coreUserMap[userID]);

    _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.cameraStateUpdate);

    Object.keys(_onCameraDeviceOnCallbackMap).forEach(callbackID => {
      if (_onCameraDeviceOnCallbackMap[callbackID]) {
        _onCameraDeviceOnCallbackMap[callbackID](userID, isOn);
      }
    });

    if (userID != _localCoreUser.userID) {
      if (isOn) {
        _tryStartPlayStream(userID);
      }
    }
  }
}

function _onAudioRouteChange(type) {
  Object.keys(_onAudioOutputDeviceTypeChangeCallbackMap).forEach(callbackID => {
    if (_onAudioOutputDeviceTypeChangeCallbackMap[callbackID]) {
      _onAudioOutputDeviceTypeChangeCallbackMap[callbackID](type);
    }
  });
  _audioOutputType = type;
}

function _onRemoteMicStateUpdate(userID, isOn) {
  console.warn('>>>>>>>>>>>>> _onRemoteMicStateUpdate', userID, isOn);

  if (userID in _coreUserMap) {
    _coreUserMap[userID].isMicDeviceOn = isOn;

    _notifyUserInfoUpdate(_coreUserMap[userID]);

    _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.microphoneStateUpdate);

    Object.keys(_onMicDeviceOnCallbackMap).forEach(callbackID => {
      if (_onMicDeviceOnCallbackMap[callbackID]) {
        _onMicDeviceOnCallbackMap[callbackID](userID, isOn);
      }
    });

    if (userID != _localCoreUser.userID) {
      if (isOn) {
        _tryStartPlayStream(userID);
      }
    }
  }
}

function _onRoomStateChanged(roomID, reason, errorCode, extendedData) {
  (0, _logger.zloginfo)('Room state chaged: ', roomID, reason, errorCode, extendedData); // Not support multi-room right now

  if (reason == 1 || reason == 4) {
    // Logined || Reconnected
    _isRoomConnected = true;

    _tryStartPublishStream();
  } else {
    _isRoomConnected = false;

    if (reason == 6) {
      // KickOut
      _notifyMeRemovedFromRoom();
    }
  }

  _currentRoomState = reason;
  Object.keys(_onRoomStateChangedCallbackMap).forEach(callbackID => {
    // callback may remove from map during room state chaging
    if (callbackID in _onRoomStateChangedCallbackMap) {
      if (_onRoomStateChangedCallbackMap[callbackID]) {
        _onRoomStateChangedCallbackMap[callbackID](reason, errorCode, extendedData);
      }
    }
  });
}

function _onInRoomMessageReceived(roomID, messageList) {
  (0, _logger.zloginfo)('Received in room message: ', roomID, messageList.length);
  var messages = [];
  messageList.forEach(msg => {
    const message = {
      message: msg.message,
      messageID: msg.messageID,
      sendTime: msg.sendTime,
      sender: _createPublicUser(_coreUserMap[msg.fromUser.userID])
    };
    messages.push(message);

    _inRoomMessageList.push(message);
  });
  Object.keys(_onInRoomMessageReceivedCallbackMap).forEach(callbackID => {
    // callback may remove from map during room state chaging
    if (callbackID in _onInRoomMessageReceivedCallbackMap) {
      if (_onInRoomMessageReceivedCallbackMap[callbackID]) {
        _onInRoomMessageReceivedCallbackMap[callbackID](messages);
      }
    }
  });
}

function _onRequireNewToken() {
  Object.keys(_onRequireNewTokenCallbackMap).forEach(callbackID => {
    if (callbackID in _onRequireNewTokenCallbackMap) {
      if (_onRequireNewTokenCallbackMap[callbackID]) {
        const token = _onRequireNewTokenCallbackMap[callbackID]();

        if (token) {
          _zegoExpressEngineReactnative.default.instance().renewToken(_currentRoomID, token).then(() => {
            (0, _logger.zloginfo)('Renew token success');
          }).catch(error => {
            (0, _logger.zlogerror)('Renew token failed: ', error);
          });
        } else {
          (0, _logger.zlogerror)('Renew token failed: the returned token is abnormal');
        }
      }
    }
  });
}

function _onRoomExtraInfoUpdate(roomID, roomExtraInfoList) {
  (0, _logger.zloginfo)('$$$$$$$$Room extra info update: ', roomID, roomExtraInfoList);
  const updateKeys = [];
  const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
  roomExtraInfoList.forEach(_ref => {
    let {
      key,
      updateTime,
      updateUser,
      value
    } = _ref;

    if (key === 'extra_info') {
      const roomProperties = JSON.parse(value);
      Object.keys(roomProperties).forEach(propertyKey => {
        if (oldRoomProperties[propertyKey] !== roomProperties[propertyKey]) {
          updateKeys.push(propertyKey);
          _roomProperties[propertyKey] = roomProperties[propertyKey];

          _notifyRoomPropertyUpdate(propertyKey, oldRoomProperties[propertyKey], roomProperties[propertyKey], _defines.ZegoRoomPropertyUpdateType.remote);
        }
      });
    }
  });

  if (updateKeys.length > 0) {
    _notifyRoomPropertiesFullUpdate(updateKeys, oldRoomProperties, JSON.parse(JSON.stringify(_roomProperties)), _defines.ZegoRoomPropertyUpdateType.remote);
  }
}

function _onIMCustomCommandReceived(roomID, fromUser, command) {
  try {
    const commandObj = JSON.parse(command);

    if (commandObj && typeof commandObj === 'object') {
      fromUser = _createPublicUser(_coreUserMap[fromUser.userID] || fromUser);
      const removeUserIDList = commandObj.zego_remove_user;
      const turnCameraOnUserID = commandObj.zego_turn_camera_on;
      const turnCameraOffUserID = commandObj.zego_turn_camera_off;
      const turnMicrophoneOnUserID = commandObj.zego_turn_microphone_on;
      const turnMicrophoneOffUserID = commandObj.zego_turn_microphone_off;

      if (removeUserIDList && removeUserIDList.find(removeUserID => removeUserID === _localCoreUser.userID)) {
        _notifyMeRemovedFromRoom(); // Leave the room automatically


        _leaveRoom();
      } else if (turnCameraOnUserID === _localCoreUser.userID) {
        Object.keys(_onTurnOnYourCameraRequestCallbackMap).forEach(callbackID => {
          if (_onTurnOnYourCameraRequestCallbackMap[callbackID]) {
            _onTurnOnYourCameraRequestCallbackMap[callbackID](fromUser);
          }
        });
      } else if (turnMicrophoneOnUserID === _localCoreUser.userID) {
        Object.keys(_onTurnOnYourMicrophoneRequestCallbackMap).forEach(callbackID => {
          if (_onTurnOnYourMicrophoneRequestCallbackMap[callbackID]) {
            _onTurnOnYourMicrophoneRequestCallbackMap[callbackID](fromUser);
          }
        });
      } else if (turnCameraOffUserID === _localCoreUser.userID) {
        _turnCameraDeviceOn(_localCoreUser.userID, false); // Automatic shutdown

      } else if (turnMicrophoneOffUserID === _localCoreUser.userID) {
        // Automatic shutdown
        _turnMicDeviceOn(_localCoreUser.userID, false);
      }
    }
  } catch (error) {
    console.error(error);
  }

  (0, _logger.zloginfo)('_onIMCustomCommandReceived: ', roomID, fromUser, command);
  Object.keys(_onInRoomCommandReceivedCallbackMap).forEach(callbackID => {
    if (callbackID in _onInRoomCommandReceivedCallbackMap) {
      if (_onInRoomCommandReceivedCallbackMap[callbackID]) {
        _onInRoomCommandReceivedCallbackMap[callbackID](fromUser, command);
      }
    }
  });
}

function _sendInRoomCommand(command, toUserList) {
  if (!_isRoomConnected) {
    (0, _logger.zlogerror)('You need to join the room before using this interface!');
    return Promise.reject();
  }

  return new Promise((resolve, reject) => {
    _zegoExpressEngineReactnative.default.instance().sendCustomCommand(_currentRoomID, command, toUserList).then(_ref2 => {
      let {
        errorCode
      } = _ref2;

      if (errorCode === 0) {
        (0, _logger.zloginfo)('[sendInRoomCommand]Send successfully', toUserList);
        resolve();
      } else {
        (0, _logger.zloginfo)('[sendInRoomCommand]Send failure', toUserList);
        reject();
      }
    }).catch(error => {
      (0, _logger.zloginfo)('[sendInRoomCommand]Send error', error);
      reject();
    });
  });
}

function _leaveRoom() {
  return new Promise((resolve, reject) => {
    if (_currentRoomID == '') {
      (0, _logger.zlogwarning)('You are not join in any room, no need to leave room.');
      resolve();
    } else {
      (0, _logger.zloginfo)('leaveRoom: ', _currentRoomID);

      _zegoExpressEngineReactnative.default.instance().logoutRoom(_currentRoomID).then(() => {
        (0, _logger.zloginfo)('Leave room succeed.');

        _zegoExpressEngineReactnative.default.instance().stopSoundLevelMonitor();

        _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.userDelete);

        _resetDataForLeavingRoom();

        resolve();
      }).catch(error => {
        (0, _logger.zlogerror)('Leave room failed: ', error);
        reject(error);
      });
    }
  });
}

function _turnMicDeviceOn(userID, on) {
  return new Promise((resolve, reject) => {
    if (_isLocalUser(userID)) {
      (0, _logger.zloginfo)('turnMicDeviceOn: ', _localCoreUser.userID, on);

      _zegoExpressEngineReactnative.default.instance().muteMicrophone(!on);

      _onRemoteMicStateUpdate(_localCoreUser.userID, on);

      _localCoreUser.isMicDeviceOn = on;
      _coreUserMap[_localCoreUser.userID].isMicDeviceOn = on;

      _notifyUserInfoUpdate(_localCoreUser);

      _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.microphoneStateUpdate); // sync device status via stream extra info


      var extraInfo = {
        isCameraOn: _localCoreUser.isCameraDeviceOn,
        isMicrophoneOn: on
      };

      _zegoExpressEngineReactnative.default.instance().setStreamExtraInfo(JSON.stringify(extraInfo));

      if (on) {
        _tryStartPublishStream();
      } else {
        _tryStopPublishStream();
      }

      resolve();
    } else {
      const isLargeRoom = _isLargeRoom || _markAsLargeRoom;
      const command = on ? JSON.stringify({
        zego_turn_microphone_on: userID
      }) : JSON.stringify({
        zego_turn_microphone_off: userID
      });
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? userInfo.userName || '' : '';
      const toUserList = isLargeRoom ? [] : [{
        userID,
        userName
      }];

      _sendInRoomCommand(command, toUserList).then(() => {
        (0, _logger.zloginfo)('turnMicDeviceOn others: ', userID, on);
        resolve();
      }).catch(() => {
        (0, _logger.zlogerror)('turnMicDeviceOn others error: ', userID, on);
        reject();
      });
    }
  });
}

function _turnCameraDeviceOn(userID, on) {
  return new Promise((resolve, reject) => {
    if (_isLocalUser(userID)) {
      // Default to Main Channel
      (0, _logger.zloginfo)('turnCameraDeviceOn: ', _localCoreUser.userID, on);

      _zegoExpressEngineReactnative.default.instance().enableCamera(on, 0);

      _onRemoteCameraStateUpdate(_localCoreUser.userID, on);

      _localCoreUser.isCameraDeviceOn = on; // if (!on) {
      //     _localCoreUser.viewID = -1;
      // }

      _coreUserMap[_localCoreUser.userID] = _localCoreUser;

      _notifyUserInfoUpdate(_localCoreUser);

      _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.cameraStateUpdate); // sync device status via stream extra info


      var extraInfo = {
        isCameraOn: on,
        isMicrophoneOn: _localCoreUser.isMicDeviceOn
      };

      _zegoExpressEngineReactnative.default.instance().setStreamExtraInfo(JSON.stringify(extraInfo));

      if (on) {
        _tryStartPublishStream();
      } else {
        _tryStopPublishStream();
      }

      resolve();
    } else {
      const isLargeRoom = _isLargeRoom || _markAsLargeRoom;
      const command = on ? JSON.stringify({
        zego_turn_camera_on: userID
      }) : JSON.stringify({
        zego_turn_camera_off: userID
      });
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? userInfo.userName || '' : '';
      const toUserList = isLargeRoom ? [] : [{
        userID,
        userName
      }];

      _sendInRoomCommand(command, toUserList).then(() => {
        (0, _logger.zloginfo)('turnCameraDeviceOn others: ', userID, on);
        resolve();
      }).catch(() => {
        (0, _logger.zlogerror)('turnCameraDeviceOn others error: ', userID, on);
        reject();
      });
    }
  });
}

function _registerEngineCallback() {
  (0, _logger.zloginfo)('Register callback for ZegoExpressEngine...');

  _zegoExpressEngineReactnative.default.instance().on('roomUserUpdate', (roomID, updateType, userList) => {
    (0, _logger.zloginfo)('[roomUserUpdate callback]', roomID, updateType, userList);

    _onRoomUserUpdate(roomID, updateType, userList);
  });

  _zegoExpressEngineReactnative.default.instance().on('roomStreamUpdate', (roomID, updateType, streamList) => {
    (0, _logger.zloginfo)('[roomStreamUpdate callback]', roomID, updateType, streamList);

    _onRoomStreamUpdate(roomID, updateType, streamList);
  });

  _zegoExpressEngineReactnative.default.instance().on('publisherQualityUpdate', (streamID, quality) => {
    if (_qualityUpdateLogCounter % 10 == 0) {
      _qualityUpdateLogCounter = 0;
      (0, _logger.zloginfo)('[publisherQualityUpdate callback]', streamID, quality);
    }

    _qualityUpdateLogCounter++;

    if (streamID.split('_')[2] === 'main') {
      _localCoreUser.publisherQuality = quality;
      _coreUserMap[_localCoreUser.userID].publisherQuality = quality;

      _notifyUserInfoUpdate(_coreUserMap[_localCoreUser.userID]);
    }
  }); // ZegoExpressEngine.instance().on(
  //     'publisherStateUpdate',
  //     (streamID, state, errorCode, extendedData) => {
  //         zloginfo('publisherStateUpdate#################', streamID, state, errorCode)
  //     },
  // );


  _zegoExpressEngineReactnative.default.instance().on('playerQualityUpdate', (streamID, quality) => {
    if (_qualityUpdateLogCounter % 10 == 0) {// zloginfo('[playerQualityUpdate callback]', streamID, quality);
    } // TODO

  });

  _zegoExpressEngineReactnative.default.instance().on('remoteCameraStateUpdate', (streamID, state) => {
    (0, _logger.zloginfo)('[remoteCameraStateUpdate callback]', streamID, state); // 0 for device is on

    _onRemoteCameraStateUpdate(_getUserIDByStreamID(streamID), state == 0);
  });

  _zegoExpressEngineReactnative.default.instance().on('remoteMicStateUpdate', (streamID, state) => {
    (0, _logger.zloginfo)('[remoteMicStateUpdate callback]', streamID, state); // 0 for device is on

    _onRemoteMicStateUpdate(_getUserIDByStreamID(streamID), state == 0);
  });

  _zegoExpressEngineReactnative.default.instance().on('playerStateUpdate', (streamID, state, errorCode, extendedData) => {
    (0, _logger.zloginfo)('[playerStateUpdate callback]', streamID, state, errorCode, extendedData);
  });

  _zegoExpressEngineReactnative.default.instance().on('remoteSoundLevelUpdate', soundLevels => {
    // {streamID, soundLavel} value from 0.0 to 100.0
    // zloginfo('[remoteSoundLevelUpdate callback]', soundLevels);
    Object.keys(soundLevels).forEach(streamID => {
      const userID = _getUserIDByStreamID(streamID);

      if (userID in _coreUserMap) {
        _coreUserMap[userID].soundLevel = soundLevels[streamID];

        _notifySoundLevelUpdate(userID, soundLevels[streamID]);
      }
    });
  });

  _zegoExpressEngineReactnative.default.instance().on('capturedSoundLevelUpdate', soundLevel => {
    if (_localCoreUser.userID === '' || !(_localCoreUser.userID in _coreUserMap)) {
      return;
    }

    _localCoreUser.soundLevel = soundLevel;
    _coreUserMap[_localCoreUser.userID].soundLevel = soundLevel;

    _notifySoundLevelUpdate(_localCoreUser.userID, soundLevel); // zloginfo('capturedSoundLevelUpdate', soundLevel)

  }); // https://doc-en-api.zego.im/ReactNative/enums/_zegoexpressdefines_.zegoroomstatechangedreason.html


  _zegoExpressEngineReactnative.default.instance().on('roomStateChanged', (roomID, reason, errorCode, extendedData) => {
    (0, _logger.zloginfo)('[roomStateChanged callback]', roomID, reason, errorCode, extendedData);

    _onRoomStateChanged(roomID, reason, errorCode, extendedData);
  });

  _zegoExpressEngineReactnative.default.instance().on('audioRouteChange', audioRoute => {
    (0, _logger.zloginfo)('[audioRouteChange callback]', audioRoute);

    _onAudioRouteChange(audioRoute);
  });

  _zegoExpressEngineReactnative.default.instance().on('IMRecvBroadcastMessage', (roomID, messageList) => {
    _onInRoomMessageReceived(roomID, messageList);
  });

  _zegoExpressEngineReactnative.default.instance().on('roomTokenWillExpire', (roomID, remainTimeInSecond) => {
    _onRequireNewToken();
  });

  _zegoExpressEngineReactnative.default.instance().on('roomExtraInfoUpdate', (roomID, roomExtraInfoList) => {
    _onRoomExtraInfoUpdate(roomID, roomExtraInfoList);
  });

  _zegoExpressEngineReactnative.default.instance().on('roomStreamExtraInfoUpdate', (roomID, streamList) => {
    (0, _logger.zloginfo)('roomStreamExtraInfoUpdate', streamList);
    streamList.forEach(stream => {
      try {
        var extraInfo = JSON.parse(stream.extraInfo);

        if ('isCameraOn' in extraInfo) {
          _onRemoteCameraStateUpdate(stream.user.userID, extraInfo.isCameraOn);
        }

        if ('isMicrophoneOn' in extraInfo) {
          _onRemoteMicStateUpdate(stream.user.userID, extraInfo.isMicrophoneOn);
        }
      } catch (error) {
        (0, _logger.zlogerror)('roomStreamExtraInfoUpdate ERROR: ', error);
      }
    });
  });

  _zegoExpressEngineReactnative.default.instance().on('IMRecvCustomCommand', (roomID, fromUser, command) => {
    (0, _logger.zloginfo)('IMRecvCustomCommand', roomID, fromUser, command);

    _onIMCustomCommandReceived(roomID, fromUser, command);
  });
}

function _unregisterEngineCallback() {
  (0, _logger.zloginfo)('Unregister callback from ZegoExpressEngine...');

  _zegoExpressEngineReactnative.default.instance().off('roomUserUpdate');

  _zegoExpressEngineReactnative.default.instance().off('roomStreamUpdate');

  _zegoExpressEngineReactnative.default.instance().off('publisherQualityUpdate');

  _zegoExpressEngineReactnative.default.instance().off('playerQualityUpdate');

  _zegoExpressEngineReactnative.default.instance().off('remoteCameraStateUpdate');

  _zegoExpressEngineReactnative.default.instance().off('remoteMicStateUpdate');

  _zegoExpressEngineReactnative.default.instance().off('playerStateUpdate');

  _zegoExpressEngineReactnative.default.instance().off('remoteSoundLevelUpdate');

  _zegoExpressEngineReactnative.default.instance().off('capturedSoundLevelUpdate');

  _zegoExpressEngineReactnative.default.instance().off('roomStateChanged');

  _zegoExpressEngineReactnative.default.instance().off('audioRouteChange');

  _zegoExpressEngineReactnative.default.instance().off('IMRecvBroadcastMessage');

  _zegoExpressEngineReactnative.default.instance().off('roomExtraInfoUpdate');

  _zegoExpressEngineReactnative.default.instance().off('roomStreamExtraInfoUpdate');

  _zegoExpressEngineReactnative.default.instance().off('IMRecvCustomCommand');
}

function _notifyUserCountOrPropertyChanged(type) {
  const msg = ['', 'user add', 'user delete', 'mic update', 'camera update', 'attributes update'];
  const userList = Object.values(_coreUserMap).sort((user1, user2) => {
    return user2.joinTime - user1.joinTime;
  }).map(user => _createPublicUser(user));
  (0, _logger.zloginfo)(`_notifyUserCountOrPropertyChanged ${msg[type]}`, userList);
  Object.keys(_onUserCountOrPropertyChangedCallbackMap).forEach(callbackID => {
    if (_onUserCountOrPropertyChangedCallbackMap[callbackID]) {
      _onUserCountOrPropertyChangedCallbackMap[callbackID](JSON.parse(JSON.stringify(userList)));
    }
  });
} // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Stream Handling <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


function _getUserIDByStreamID(streamID) {
  // StreamID format: roomid_userid_main
  for (const userID in _coreUserMap) {
    if (_coreUserMap[userID].streamID == streamID) {
      return userID;
    }
  }

  return '';
}

function _getPublishStreamID() {
  return _currentRoomID + '_' + _localCoreUser.userID + '_main';
}

function _getStreamIDByUserID(userID) {
  return _currentRoomID + '_' + userID + '_main';
}

function _tryStartPublishStream() {
  if (_localCoreUser.isMicDeviceOn || _localCoreUser.isCameraDeviceOn) {
    (0, _logger.zloginfo)('_tryStartPublishStream', _localCoreUser.isMicDeviceOn, _localCoreUser.isCameraDeviceOn, _localCoreUser.streamID);

    if (!_localCoreUser.streamID) {
      return;
    }

    _zegoExpressEngineReactnative.default.instance().startPublishingStream(_localCoreUser.streamID).then(() => {
      (0, _logger.zloginfo)('Notify local user audioVideoAvailable start', _localCoreUser.streamID + '', JSON.parse(JSON.stringify(_streamCoreUserMap))); // if (_localCoreUser.streamID in _streamCoreUserMap) {

      _streamCoreUserMap[_localCoreUser.streamID] = _localCoreUser;
      (0, _logger.zloginfo)('Notify local user audioVideoAvailable end', _localCoreUser);
      Object.keys(_onAudioVideoAvailableCallbackMap).forEach(callbackID => {
        if (_onAudioVideoAvailableCallbackMap[callbackID]) {
          _onAudioVideoAvailableCallbackMap[callbackID]([_localCoreUser]);
        }
      }); // }
    });

    (0, _logger.zloginfo)('ZegoExpressEngine startPreview:', _localCoreUser);

    if (_localCoreUser.viewID > 0) {
      _zegoExpressEngineReactnative.default.instance().startPreview({
        reactTag: _localCoreUser.viewID,
        viewMode: _localCoreUser.fillMode,
        backgroundColor: 0
      }).catch(error => {
        (0, _logger.zlogerror)(error);
      });
    }
  }
}

function _tryStopPublishStream() {
  let force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  if (!_localCoreUser.isMicDeviceOn && !_localCoreUser.isCameraDeviceOn) {
    (0, _logger.zloginfo)('stopPublishStream');

    _zegoExpressEngineReactnative.default.instance().stopPublishingStream();

    _zegoExpressEngineReactnative.default.instance().stopPreview();

    if (_localCoreUser.streamID in _streamCoreUserMap) {
      delete _streamCoreUserMap[_localCoreUser.streamID];
      Object.keys(_onAudioVideoUnavailableCallbackMap).forEach(callbackID => {
        if (_onAudioVideoUnavailableCallbackMap[callbackID]) {
          _onAudioVideoUnavailableCallbackMap[callbackID]([_localCoreUser]);
        }
      });
    }
  }
}

function _tryStartPlayStream(userID) {
  if (userID in _coreUserMap) {
    const user = _coreUserMap[userID];
    (0, _logger.zloginfo)('########_tryStartPlayStream##############: ', user, user.fillMode, _audioVideoResourceMode);

    if (user.streamID !== '') {
      if (user.viewID > 0) {
        _zegoExpressEngineReactnative.default.instance().startPlayingStream(user.streamID, {
          reactTag: user.viewID,
          viewMode: user.fillMode,
          backgroundColor: 0
        }, {
          resourceMode: _audioVideoResourceMode
        });
      } else {
        _zegoExpressEngineReactnative.default.instance().startPlayingStream(user.streamID, undefined, {
          resourceMode: _audioVideoResourceMode
        });
      }
    }
  }
}

function _tryStopPlayStream(userID) {
  let force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (userID in _coreUserMap) {
    const user = _coreUserMap[userID];

    if (force || !user.isMicDeviceOn && !user.isCameraDeviceOn) {
      _zegoExpressEngineReactnative.default.instance().stopPlayingStream(user.streamID);
    }
  }
}

function _notifyUserInfoUpdate(userInfo) {
  Object.keys(_onUserInfoUpdateCallbackMap).forEach(callbackID => {
    if (_onUserInfoUpdateCallbackMap[callbackID]) {
      _onUserInfoUpdateCallbackMap[callbackID](userInfo);
    }
  });
}

function _notifySoundLevelUpdate(userID, soundLevel) {
  Object.keys(_onSoundLevelUpdateCallbackMap).forEach(callbackID => {
    if (_onSoundLevelUpdateCallbackMap[callbackID]) {
      _onSoundLevelUpdateCallbackMap[callbackID](userID, soundLevel);
    }
  });
}

function _notifyRoomPropertyUpdate(key, oldValue, value, type) {
  Object.keys(_onRoomPropertyUpdatedCallbackMap).forEach(callbackID => {
    if (_onRoomPropertyUpdatedCallbackMap[callbackID]) {
      _onRoomPropertyUpdatedCallbackMap[callbackID](key, oldValue, value, type);
    }
  });
}

function _notifyRoomPropertiesFullUpdate(keys, oldRoomProperties, roomProperties, type) {
  Object.keys(_onRoomPropertiesFullUpdatedCallbackMap).forEach(callbackID => {
    if (_onRoomPropertiesFullUpdatedCallbackMap[callbackID]) {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID](keys, oldRoomProperties, roomProperties, type);
    }
  });
}

function _notifyMeRemovedFromRoom() {
  Object.keys(_onMeRemovedFromRoomCallbackMap).forEach(callbackID => {
    if (_onMeRemovedFromRoomCallbackMap[callbackID]) {
      _onMeRemovedFromRoomCallbackMap[callbackID]();
    }
  });
}

const _isEngineCreated = () => {
  try {
    return _zegoExpressEngineReactnative.default.instance() != undefined;
  } catch (error) {
    return false;
  }
};

var _default = {
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Internal <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  isRoomConnected() {
    return _isRoomConnected;
  },

  setAudioVideoResourceMode(audioVideoResourceMode) {
    (0, _logger.zloginfo)('setAudioVideoResourceMode', audioVideoResourceMode);
    _audioVideoResourceMode = audioVideoResourceMode || _defines.ZegoAudioVideoResourceMode.Default;
  },

  updateRenderingProperty(userID, viewID, fillMode) {
    (0, _logger.zloginfo)('updateRenderingProperty: ', userID, viewID, fillMode, '<<<<<<<<<<<<<<<<<<<<<<<<<<');

    if (userID === undefined) {
      (0, _logger.zlogwarning)('updateRenderingProperty: ignore undifine useid. Use empty string for local user.');
      return;
    }

    if (userID === '') {
      userID = _localCoreUser.userID;
    }

    if (userID in _coreUserMap) {
      _coreUserMap[userID].viewID = viewID;
      _coreUserMap[userID].fillMode = fillMode;

      _notifyUserInfoUpdate(_coreUserMap[userID]);

      if (_localCoreUser.userID == userID) {
        _localCoreUser.viewID = viewID;
        _localCoreUser.fillMode = fillMode;

        if (viewID > 0) {
          _tryStartPublishStream();
        } else {
          _tryStopPublishStream();
        }
      } else {
        // Check if stream is ready to play for remote user
        if (viewID > 0) {
          _tryStartPlayStream(userID);
        }
      }
    }
  },

  onUserInfoUpdate(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserInfoUpdateCallbackMap) {
        (0, _logger.zloginfo)('[onUserInfoUpdate] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onUserInfoUpdateCallbackMap[callbackID];
      }
    } else {
      _onUserInfoUpdateCallbackMap[callbackID] = callback;
    }
  },

  onSoundLevelUpdate(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onSoundLevelUpdateCallbackMap) {
        (0, _logger.zloginfo)('[onSoundLevelUpdate] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onSoundLevelUpdateCallbackMap[callbackID];
      }
    } else {
      _onSoundLevelUpdateCallbackMap[callbackID] = callback;
    }
  },

  onSDKConnected(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onSDKConnectedCallbackMap) {
        (0, _logger.zloginfo)('[onSDKConnected] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onSDKConnectedCallbackMap[callbackID];
      }
    } else {
      _onSDKConnectedCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SDK <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  connectSDK(appID, appSign, userInfo) {
    // Solve the problem of repeated initialization
    if (_isEngineCreated()) {
      (0, _logger.zloginfo)('Create ZegoExpressEngine succeed already!');

      _unregisterEngineCallback();

      _registerEngineCallback();

      Object.keys(_onSDKConnectedCallbackMap).forEach(callbackID => {
        // TODO cause  WARN  Possible Unhandled Promise Rejection (id: 56)
        if (_onSDKConnectedCallbackMap[callbackID]) {
          _onSDKConnectedCallbackMap[callbackID]();
        }
      });
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // set advancedConfig to monitor remote user's device changed
      _zegoExpressEngineReactnative.default.setEngineConfig({
        advancedConfig: {
          notify_remote_device_unknown_status: 'true',
          notify_remote_device_init_status: 'true'
        }
      });

      const engineProfile = {
        appID: appID,
        appSign: appSign,
        scenario: 0
      };

      _zegoExpressEngineReactnative.default.createEngineWithProfile(engineProfile).then(engine => {
        (0, _logger.zloginfo)('Create ZegoExpressEngine succeed!');
        _appInfo.appID = appID;
        _appInfo.appSign = appSign;

        _unregisterEngineCallback();

        _registerEngineCallback();

        _setLocalUserInfo(userInfo);

        Object.keys(_onSDKConnectedCallbackMap).forEach(callbackID => {
          // TODO cause  WARN  Possible Unhandled Promise Rejection (id: 56)
          if (_onSDKConnectedCallbackMap[callbackID]) {
            _onSDKConnectedCallbackMap[callbackID]();
          }
        });
        resolve();
      }).catch(error => {
        (0, _logger.zlogerror)('Create ZegoExpressEngine Failed: ', error);
        reject(error);
      });
    });
  },

  disconnectSDK() {
    return new Promise((resolve, reject) => {
      if (_zegoExpressEngineReactnative.default.instance()) {
        _zegoExpressEngineReactnative.default.destroyEngine().then(() => {
          (0, _logger.zloginfo)('Destroy ZegoExpressEngine finished!');
          resolve();
        }).catch(error => {
          (0, _logger.zlogerror)('Destroy ZegoExpressEngine failed!', error);
          reject(error);
        }).finally(() => {
          _resetData();
        });
      } else {
        resolve();
      }
    });
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Audio Video <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  useFrontFacingCamera(isFrontFacing) {
    (0, _logger.zloginfo)('Use front facing camera: ', isFrontFacing);
    _usingFrontFacingCamera = isFrontFacing;
    return _zegoExpressEngineReactnative.default.instance().useFrontCamera(isFrontFacing, 0);
  },

  isUsingFrontFacingCamera() {
    return _usingFrontFacingCamera;
  },

  isMicDeviceOn(userID) {
    if (!userID) {
      return _localCoreUser.isMicDeviceOn;
    } else if (userID in _coreUserMap) {
      return _coreUserMap[userID].isMicDeviceOn;
    } else {
      (0, _logger.zlogwarning)('Can not check mic device is on for user[', userID, '], because no record!');
      return true;
    }
  },

  isCameraDeviceOn(userID) {
    if (!userID) {
      return _localCoreUser.isCameraDeviceOn;
    } else if (userID in _coreUserMap) {
      return _coreUserMap[userID].isCameraDeviceOn;
    } else {
      (0, _logger.zlogwarning)('No record for user: ', userID, '. Can not check camera device is on.');
      return true;
    }
  },

  enableSpeaker(enable) {
    // TODO
    return new Promise((resolve, reject) => {
      if (!_isRoomConnected) {
        (0, _logger.zlogerror)('You are not connect to any room.');
        reject();
      } else {
        _zegoExpressEngineReactnative.default.instance().muteSpeaker(!enable);

        resolve();
      }
    });
  },

  audioOutputDeviceType() {
    return _audioOutputType;
  },

  turnMicDeviceOn(userID, on) {
    return _turnMicDeviceOn(userID, on);
  },

  turnCameraDeviceOn(userID, on) {
    return _turnCameraDeviceOn(userID, on);
  },

  onMicDeviceOn(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMicDeviceOnCallbackMap) {
        (0, _logger.zloginfo)('[onMicDeviceOn] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onMicDeviceOnCallbackMap[callbackID];
      }
    } else {
      _onMicDeviceOnCallbackMap[callbackID] = callback;
    }
  },

  onCameraDeviceOn(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onCameraDeviceOnCallbackMap) {
        (0, _logger.zloginfo)('[onCameraDeviceOn] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onCameraDeviceOnCallbackMap[callbackID];
      }
    } else {
      _onCameraDeviceOnCallbackMap[callbackID] = callback;
    }
  },

  setAudioOutputToSpeaker(isSpeaker) {
    _zegoExpressEngineReactnative.default.instance().setAudioRouteToSpeaker(isSpeaker);
  },

  onAudioOutputDeviceTypeChange(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioOutputDeviceTypeChangeCallbackMap) {
        (0, _logger.zloginfo)('[onAudioOutputDeviceTypeChange] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onAudioOutputDeviceTypeChangeCallbackMap[callbackID];
      }
    } else {
      _onAudioOutputDeviceTypeChangeCallbackMap[callbackID] = callback;
    }
  },

  setAudioConfig(config) {// TODO
  },

  setVideoConfig(config) {// TODO
  },

  onAudioVideoAvailable(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoAvailableCallbackMap) {
        (0, _logger.zloginfo)('[onAudioVideoAvailable] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onAudioVideoAvailableCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoAvailableCallbackMap[callbackID] = callback;
    }
  },

  onAudioVideoUnavailable(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoUnavailableCallbackMap) {
        (0, _logger.zloginfo)('[onAudioVideoUnavailable] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onAudioVideoUnavailableCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoUnavailableCallbackMap[callbackID] = callback;
    }
  },

  startPlayingAllAudioVideo() {
    _zegoExpressEngineReactnative.default.instance().muteAllPlayStreamAudio(false);

    _zegoExpressEngineReactnative.default.instance().muteAllPlayStreamVideo(false);
  },

  stopPlayingAllAudioVideo() {
    _zegoExpressEngineReactnative.default.instance().muteAllPlayStreamAudio(true);

    _zegoExpressEngineReactnative.default.instance().muteAllPlayStreamVideo(true);
  },

  onTurnOnYourCameraRequest(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onTurnOnYourCameraRequestCallbackMap) {
        (0, _logger.zloginfo)('[onTurnOnYourCameraRequest] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onTurnOnYourCameraRequestCallbackMap[callbackID];
      }
    } else {
      _onTurnOnYourCameraRequestCallbackMap[callbackID] = callback;
    }
  },

  onTurnOnYourMicrophoneRequest(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onTurnOnYourMicrophoneRequestCallbackMap) {
        (0, _logger.zloginfo)('[onTurnOnYourMicrophoneRequest] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onTurnOnYourMicrophoneRequestCallbackMap[callbackID];
      }
    } else {
      _onTurnOnYourMicrophoneRequestCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  joinRoom(roomID, token) {
    let markAsLargeRoom = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // Solve the problem of repeated join
    if (_isRoomConnected && _currentRoomID === roomID) {
      (0, _logger.zloginfo)('Join room success already');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const user = {
        userID: _localCoreUser.userID,
        userName: _localCoreUser.userName
      };
      const config = {
        isUserStatusNotify: true
      };
      token && (config.token = token);
      _currentRoomID = roomID;

      _zegoExpressEngineReactnative.default.instance().loginRoom(roomID, user, config).then(() => {
        (0, _logger.zloginfo)('Join room success.', user);
        _roomMemberCount = 1;
        _markAsLargeRoom = markAsLargeRoom;

        _zegoExpressEngineReactnative.default.instance().startSoundLevelMonitor();

        _localCoreUser.streamID = _getPublishStreamID();
        _coreUserMap[_localCoreUser.userID] = _localCoreUser;

        _notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.userAdd);

        _tryStartPublishStream();

        resolve();
      }).catch(error => {
        (0, _logger.zlogerror)('Join room falied: ', error);
        _currentRoomID = '';
        reject(error);
      });
    });
  },

  leaveRoom() {
    return _leaveRoom();
  },

  onRoomStateChanged(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomStateChangedCallbackMap) {
        (0, _logger.zloginfo)('[onRoomStateChanged] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onRoomStateChangedCallbackMap[callbackID];
      }
    } else {
      _onRoomStateChangedCallbackMap[callbackID] = callback;
    }
  },

  onRequireNewToken(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRequireNewTokenCallbackMap) {
        (0, _logger.zloginfo)('[onRequireNewToken] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onRequireNewTokenCallbackMap[callbackID];
      }
    } else {
      _onRequireNewTokenCallbackMap[callbackID] = callback;
    }
  },

  setRoomProperty(key, value) {
    if (!_isRoomConnected) {
      (0, _logger.zlogerror)('You need to join the room before using this interface!');
      return;
    }

    if (_roomProperties[key] === value) {
      return;
    }

    const oldValue = _roomProperties[key];
    const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
    _roomProperties[key] = value;
    const extraInfo = JSON.stringify(_roomProperties);
    (0, _logger.zloginfo)('[updateRoomProperties]Set start', extraInfo);
    return new Promise((resolve, reject) => {
      _zegoExpressEngineReactnative.default.instance().setRoomExtraInfo(_currentRoomID, 'extra_info', extraInfo).then(_ref3 => {
        let {
          errorCode
        } = _ref3;

        if (errorCode === 0) {
          (0, _logger.zloginfo)('[updateRoomProperties]Set success');
          resolve(); // Notify

          _notifyRoomPropertyUpdate(key, oldValue, value, _defines.ZegoRoomPropertyUpdateType.set);

          _notifyRoomPropertiesFullUpdate([key], oldRoomProperties, JSON.parse(extraInfo), _defines.ZegoRoomPropertyUpdateType.set);
        } else {
          // Restore
          _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
          (0, _logger.zlogwarning)('[setRoomProperty]Set failed, errorCode: ', errorCode);
          reject({
            code: errorCode
          });
        }
      }).catch(error => {
        // Restore
        _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
        (0, _logger.zlogerror)('[setRoomProperty]Set error', error);
        reject(error);
      });
    });
  },

  updateRoomProperties(newRoomProperties) {
    if (!_isRoomConnected) {
      (0, _logger.zlogerror)('You need to join the room before using this interface!');
      return Promise.reject();
    }

    const updateKeys = [];
    const oldRoomProperties = JSON.parse(JSON.stringify(_roomProperties));
    Object.keys(newRoomProperties).forEach(key => {
      if (oldRoomProperties[key] !== newRoomProperties[key]) {
        updateKeys.push(key);
        _roomProperties[key] = newRoomProperties[key];
      }
    });
    const extraInfo = JSON.stringify(_roomProperties);
    (0, _logger.zloginfo)('[updateRoomProperties]Update start', extraInfo);
    return new Promise((resolve, reject) => {
      _zegoExpressEngineReactnative.default.instance().setRoomExtraInfo(_currentRoomID, 'extra_info', extraInfo).then(_ref4 => {
        let {
          errorCode
        } = _ref4;

        if (errorCode === 0) {
          (0, _logger.zloginfo)('[updateRoomProperties]Update success');
          resolve(); // Notify

          updateKeys.forEach(updateKey => {
            const oldValue = oldRoomProperties[updateKey];
            const value = newRoomProperties[updateKey];

            _notifyRoomPropertyUpdate(updateKey, oldValue, value, _defines.ZegoRoomPropertyUpdateType.update);
          });
          updateKeys.length && _notifyRoomPropertiesFullUpdate(updateKeys, oldRoomProperties, JSON.parse(extraInfo), _defines.ZegoRoomPropertyUpdateType.update);
        } else {
          // Restore
          _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
          (0, _logger.zlogwarning)('[updateRoomProperties]Update failed, errorCode: ', errorCode);
          reject({
            code: errorCode
          });
        }
      }).catch(error => {
        // Restore
        _roomProperties = JSON.parse(JSON.stringify(oldRoomProperties));
        (0, _logger.zlogerror)('[updateRoomProperties]Update error', error);
        reject(error);
      });
    });
  },

  getRoomProperties() {
    return _roomProperties;
  },

  onRoomPropertyUpdated(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertyUpdatedCallbackMap) {
        (0, _logger.zloginfo)('[onRoomPropertyUpdated] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onRoomPropertyUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertyUpdatedCallbackMap[callbackID] = callback;
    }
  },

  onRoomPropertiesFullUpdated(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertiesFullUpdatedCallbackMap) {
        (0, _logger.zloginfo)('[onRoomPropertiesFullUpdated] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onRoomPropertiesFullUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID] = callback;
    }
  },

  sendInRoomCommand(command) {
    let toUserIDs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    const toUserList = toUserIDs.map(userID => {
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? userInfo.userName || '' : '';
      return {
        userID,
        userName
      };
    });
    return _sendInRoomCommand(command, toUserList);
  },

  onInRoomCommandReceived(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomCommandReceivedCallbackMap) {
        (0, _logger.zloginfo)('[onInRoomCommandReceived] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onInRoomCommandReceivedCallbackMap[callbackID];
      }
    } else {
      _onInRoomCommandReceivedCallbackMap[callbackID] = callback;
    }
  },

  onMeRemovedFromRoom(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMeRemovedFromRoomCallbackMap) {
        (0, _logger.zloginfo)('[onMeRemovedFromRoom] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onMeRemovedFromRoomCallbackMap[callbackID];
      }
    } else {
      _onMeRemovedFromRoomCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> User <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  connectUser(userID, userName) {
    _setLocalUserInfo({
      userID: userID,
      userName: userName
    }); // TODO ZIM login

  },

  disconnectUser() {
    delete _coreUserMap[_localCoreUser.userID];
    _localCoreUser = _createCoreUser('', '', '', {}); // TODO ZIM logout
  },

  getLocalUserInfo() {
    return _localCoreUser;
  },

  getUser(userID) {
    return _coreUserMap[userID];
  },

  getAllUsers() {
    const users = Object.values(_coreUserMap);
    users.sort((a, b) => {
      return a.joinTime > b.joinTime;
    });
    var publicUsers = [];
    users.forEach(user => {
      publicUsers.push(_createPublicUser(user));
    });
    return publicUsers;
  },

  onUserJoin(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserJoinCallbackMap) {
        (0, _logger.zloginfo)('[onUserJoin] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onUserJoinCallbackMap[callbackID];
      }
    } else {
      _onUserJoinCallbackMap[callbackID] = callback;
    }
  },

  onUserLeave(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserLeaveCallbackMap) {
        (0, _logger.zloginfo)('[onUserLeave] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onUserLeaveCallbackMap[callbackID];
      }
    } else {
      _onUserLeaveCallbackMap[callbackID] = callback;
    }
  },

  onOnlySelfInRoom(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onOnlySelfInRoomCallbackMap) {
        (0, _logger.zloginfo)('[onOnlySelfInRoom] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onOnlySelfInRoomCallbackMap[callbackID];
      }
    } else {
      _onOnlySelfInRoomCallbackMap[callbackID] = callback;
    }
  },

  onUserCountOrPropertyChanged(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onUserCountOrPropertyChangedCallbackMap) {
        (0, _logger.zloginfo)('[onUserCountOrPropertyChanged] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onUserCountOrPropertyChangedCallbackMap[callbackID];
      }
    } else {
      _onUserCountOrPropertyChangedCallbackMap[callbackID] = callback;
    }
  },

  removeUserFromRoom() {
    let userIDs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    const command = JSON.stringify({
      zego_remove_user: userIDs
    });
    const toUserList = _isLargeRoom || _markAsLargeRoom ? [] : userIDs.map(userID => {
      const userInfo = _coreUserMap[userID];
      const userName = userInfo ? userInfo.userName || '' : '';
      return {
        userID,
        userName
      };
    });
    return _sendInRoomCommand(command, toUserList);
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Message <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  getInRoomMessages() {
    return _inRoomMessageList;
  },

  sendInRoomMessage(message) {
    return new Promise((resolve, reject) => {
      _zegoExpressEngineReactnative.default.instance().sendBroadcastMessage(_currentRoomID, message).then(result => {
        (0, _logger.zloginfo)('SendInRoomMessage finished.', result);
        const {
          errorCode,
          messageID
        } = result;

        if (errorCode > 0) {
          reject(errorCode);
        } else {
          const inRoomMessage = {
            message: message,
            messageID: messageID,
            sendTime: Date.now(),
            sender: _createPublicUser(_localCoreUser)
          };

          _inRoomMessageList.push(inRoomMessage);

          Object.keys(_onInRoomMessageSentCallbackMap).forEach(callbackID => {
            // callback may remove from map during room state chaging
            if (callbackID in _onInRoomMessageSentCallbackMap) {
              if (_onInRoomMessageSentCallbackMap[callbackID]) {
                _onInRoomMessageSentCallbackMap[callbackID](errorCode, messageID);
              }
            }
          });
          resolve(result);
        }
      }).catch(error => {
        (0, _logger.zlogerror)('SendInRoomMessage falied: ', error);
        reject(error);
      });
    });
  },

  onInRoomMessageReceived(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomMessageReceivedCallbackMap) {
        (0, _logger.zloginfo)('[onInRoomMessageReceived] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onInRoomMessageReceivedCallbackMap[callbackID];
      }
    } else {
      _onInRoomMessageReceivedCallbackMap[callbackID] = callback;
    }
  },

  onInRoomMessageSent(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onInRoomMessageSentCallbackMap) {
        (0, _logger.zloginfo)('[onInRoomMessageSent] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onInRoomMessageSentCallbackMap[callbackID];
      }
    } else {
      _onInRoomMessageSentCallbackMap[callbackID] = callback;
    }
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Live audio room <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  notifyUserCountOrPropertyChanged(type) {
    _notifyUserCountOrPropertyChanged(type);
  },

  notifyUserInfoUpdate(userID) {
    _notifyUserInfoUpdate(_coreUserMap[userID]);
  },

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Force update component <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  forceSortMemberList() {
    (0, _logger.zloginfo)('[forceSortMemberList callback]');
    const userList = Object.values(_coreUserMap).sort((user1, user2) => {
      return user2.joinTime - user1.joinTime;
    }).map(user => _createPublicUser(user));
    Object.keys(_onMemberListForceSortCallbackMap).forEach(callbackID => {
      if (_onMemberListForceSortCallbackMap[callbackID]) {
        _onMemberListForceSortCallbackMap[callbackID](userList);
      }
    });
  },

  onMemberListForceSort(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onMemberListForceSortCallbackMap) {
        (0, _logger.zloginfo)('[onMemberListForceSort] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onMemberListForceSortCallbackMap[callbackID];
      }
    } else {
      _onMemberListForceSortCallbackMap[callbackID] = callback;
    }
  },

  forceSortAudioVideoList() {
    (0, _logger.zloginfo)('[forceSortAudioVideoList callback]');
    Object.keys(_onAudioVideoListForceSortCallbackMap).forEach(callbackID => {
      if (_onAudioVideoListForceSortCallbackMap[callbackID]) {
        _onAudioVideoListForceSortCallbackMap[callbackID]();
      }
    });
  },

  onAudioVideoListForceSort(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onAudioVideoListForceSortCallbackMap) {
        (0, _logger.zloginfo)('[onAudioVideoListForceSort] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onAudioVideoListForceSortCallbackMap[callbackID];
      }
    } else {
      _onAudioVideoListForceSortCallbackMap[callbackID] = callback;
    }
  }

};
exports.default = _default;
//# sourceMappingURL=ZegoUIKitInternal.js.map