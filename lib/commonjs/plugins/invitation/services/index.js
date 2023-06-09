"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ZegoUIKitInternal = _interopRequireDefault(require("../../../components/internal/ZegoUIKitInternal"));

var _defines = require("../../../components/internal/defines");

var _ZegoUIKitCorePlugin = _interopRequireDefault(require("../../../components/internal/ZegoUIKitCorePlugin"));

var _logger = require("../../../utils/logger");

var _defines2 = require("./defines");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ZegoUIKitSignalingPlugin;
const _localUser = {};
const _queryCount = 20;
const _onRoomPropertiesFullUpdatedCallbackMap = {};

const _usersInRoomAttributes = new Map(); // <userID, attributes> attributes={ string, string }


let _roomAttributes = {}; // ------- live audio room ------

const _queryUsersInRoomAttributesIteration = function () {
  let nextFlag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _queryCount;
  return ZegoUIKitSignalingPlugin.getInstance().invoke('queryUsersInRoomAttributes', {
    nextFlag,
    count
  });
};

const _queryUsersInRoomAttributesFully = (nextFlag, count) => {
  const fullAttributes = [];
  return new Promise((resolve, reject) => {
    _queryUsersInRoomAttributesIteration(nextFlag, count).then(_ref => {
      let {
        nextFlag: resNextFlag,
        infos
      } = _ref;
      fullAttributes.push(...infos);

      if (resNextFlag) {
        _queryUsersInRoomAttributesIteration(resNextFlag);
      } else {
        resolve(fullAttributes);
      }
    }).catch(error => {
      reject(error);
    });
  });
};

const _updateCoreUserAndNofityChanges = (infos, editor) => {
  let shouldNotifyChange = false;
  infos.forEach(info => {
    const coreUser = _ZegoUIKitInternal.default.getUser(info.userID);

    if (coreUser) {
      if (JSON.stringify(coreUser.inRoomAttributes) !== JSON.stringify(info.attributes)) {
        shouldNotifyChange = true; // merge

        Object.assign(coreUser.inRoomAttributes, info.attributes);

        _ZegoUIKitInternal.default.notifyUserInfoUpdate(info.userID);
      }
    }
  });

  if (shouldNotifyChange) {
    (0, _logger.zloginfo)('[Plugins][invitation]Notify changed property of users successfully.');

    _ZegoUIKitInternal.default.notifyUserCountOrPropertyChanged(_defines.ZegoChangedCountOrProperty.attributesUpdate);
  }
};

const _notifyRoomPropertiesFullUpdated = function () {
  for (var _len = arguments.length, notifyData = new Array(_len), _key = 0; _key < _len; _key++) {
    notifyData[_key] = arguments[_key];
  }

  Object.keys(_onRoomPropertiesFullUpdatedCallbackMap).forEach(callbackID => {
    if (_onRoomPropertiesFullUpdatedCallbackMap[callbackID]) {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID](...notifyData);
    }
  });
};

const ZegoUIKitSignalingPluginImpl = {
  getVersion: () => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getVersion();
  },
  init: (appID, appSign) => {
    ZegoUIKitSignalingPlugin = _ZegoUIKitCorePlugin.default.getPlugin(_defines.ZegoUIKitPluginType.signaling);

    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().invoke('init', {
      appID,
      appSign
    });
  },
  uninit: () => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().invoke('uninit');
  },
  login: (userID, userName) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    _localUser.userID = userID;
    _localUser.userName = userName;
    return ZegoUIKitSignalingPlugin.getInstance().invoke('login', {
      userID,
      userName
    });
  },
  logout: () => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('logout');
  },
  enableNotifyWhenAppRunningInBackgroundOrQuit: (enable, isIOSDevelopmentEnvironment) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('enableNotifyWhenAppRunningInBackgroundOrQuit', {
      enable,
      isIOSDevelopmentEnvironment
    });
  },
  sendInvitation: (invitees, timeout, type, data, notificationConfig) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('sendInvitation', {
      inviterName: _localUser.userName,
      invitees,
      timeout,
      type,
      data,
      notificationConfig
    });
  },
  cancelInvitation: (invitees, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('cancelInvitation', {
      invitees,
      data
    });
  },
  refuseInvitation: (inviterID, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('refuseInvitation', {
      inviterID,
      data
    });
  },
  acceptInvitation: (inviterID, data) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return Promise.reject();
    }

    return ZegoUIKitSignalingPlugin.getInstance().invoke('acceptInvitation', {
      inviterID,
      data
    });
  },
  onConnectionStateChanged: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('connectionStateChanged', callbackID, callback);
  },
  onInvitationReceived: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationReceived', callbackID, callback);
  },
  onInvitationTimeout: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationTimeout', callbackID, callback);
  },
  onInvitationResponseTimeout: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationResponseTimeout', callbackID, callback);
  },
  onInvitationAccepted: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationAccepted', callbackID, callback);
  },
  onInvitationRefused: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationRefused', callbackID, callback);
  },
  onInvitationCanceled: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('invitationCanceled', callbackID, callback);
  },

  // ------- live audio room - user------
  joinRoom(roomID) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('joinRoom', {
        roomID
      }).then(async () => {
        try {
          (0, _logger.zloginfo)('[Plugins][invitation]Join room successfully.', roomID); // query the attributes of the users in room
          // const fullAttributes = await _queryUsersInRoomAttributesFully();
          // _usersInRoomAttributes.clear();
          // fullAttributes.forEach((element) => {
          //   _usersInRoomAttributes.set(element.userID, element.attributes);
          // });
          // zloginfo(
          //   `[Plugins][invitation]Auto query the attributes of the users in room successfully.`,
          //   _usersInRoomAttributes
          // );
          // query the room attributes
          // await this.queryRoomProperties();
          // zloginfo(
          //   `[Plugins][invitation]Auto query the room attributes successfully.`,
          //   _roomAttributes
          // );

          resolve(new _defines2.ZegoInvitationImplResult('', ''));
        } catch (error) {
          (0, _logger.zlogerror)(`[Plugins][invitation]Failed to auto query the attributes of the users in room of room attributes.`, error);
        }
      }).catch(error => {
        (0, _logger.zloginfo)('[Plugins][invitation]Failed to join room.', roomID);
        reject(error);
      });
    });
  },

  // getUsersInRoomAttributes: () => {
  //   if (!ZegoUIKitSignalingPlugin) {
  //     zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
  //     return;
  //   }
  //   return _usersInRoomAttributes;
  // },
  setUsersInRoomAttributes: (key, value, userIDs) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    } // The call to the local end also triggers the corresponding callback on the local end


    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('setUsersInRoomAttributes', {
        key,
        value,
        userIDs
      }).then(_ref2 => {
        let {
          errorUserList,
          infos
        } = _ref2;

        // for the time being, consider setting only one property for one user at a time
        if (errorUserList.length) {
          (0, _logger.zlogerror)('[Plugins][invitation]Failed to set attributes of users in room.', errorUserList);
          reject(new _defines2.ZegoInvitationImplResult('1', ''));
        } else {
          const attributes = _usersInRoomAttributes.get(userIDs[0]);

          if (attributes) {
            if (!value) {
              delete attributes[key];
            } else {
              attributes[key] = value;
            }
          } else if (value) {
            _usersInRoomAttributes.set(userIDs[0], {
              [key]: value
            });
          }

          (0, _logger.zloginfo)('[Plugins][invitation]Set attributes of users in room successfully.');
          resolve(new _defines2.ZegoInvitationImplResult('', ''));
        }
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to set attributes of users in room.', error);
        reject(error);
      });
    });
  },
  queryUsersInRoomAttributes: function (nextFlag) {
    let count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _queryCount;

    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      _queryUsersInRoomAttributesFully(nextFlag, count).then(fullAttributes => {
        _usersInRoomAttributes.clear();

        fullAttributes.forEach(element => {
          _usersInRoomAttributes.set(element.userID, element.attributes);
        });
        (0, _logger.zloginfo)('[Plugins][invitation]Query attributes of users in room successfully.', _usersInRoomAttributes);
        resolve({ ...new _defines2.ZegoInvitationImplResult('', ''),
          usersInRoomAttributes: _usersInRoomAttributes
        }); // update the user information of the core layer

        _updateCoreUserAndNofityChanges(fullAttributes);
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to query attributes of users in room.', error);
        reject(error);
      });
    });
  },
  onUsersInRoomAttributesUpdated: (callbackID, callback) => {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    if (typeof callback !== 'function') {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('usersInRoomAttributesUpdated', callbackID, callback);
    } else {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('usersInRoomAttributesUpdated', callbackID, _ref3 => {
        let {
          infos,
          editor
        } = _ref3;
        // incremental information
        const oldAttributes = new Map();
        Array.from(_usersInRoomAttributes.keys()).forEach(key => {
          oldAttributes.set(key, JSON.parse(JSON.stringify(_usersInRoomAttributes.get(key))));
        });
        const updateKeys = [];
        infos.forEach(info => {
          Object.keys(info.attributes).forEach(key => {
            if (!updateKeys.includes(key)) {
              updateKeys.push(key);
            }
          }); // merge

          let temp = _usersInRoomAttributes.get(info.userID);

          !temp && (temp = {});

          _usersInRoomAttributes.set(info.userID, temp);

          Object.assign(temp, info.attributes);
        });
        (0, _logger.zloginfo)('[Plugins][invitation]Notify updated attributes of users in room successfully.', updateKeys, oldAttributes, _usersInRoomAttributes, editor);
        callback(updateKeys, oldAttributes, _usersInRoomAttributes, editor); // update the user information of the core layer

        _updateCoreUserAndNofityChanges(infos, editor);
      });
    }
  },

  // ------- live audio room - room------
  // getRoomProperties() {
  //   if (!ZegoUIKitSignalingPlugin) {
  //     zlogerror(`[Plugins][invitation]Signaling plugin install error.`);
  //     return;
  //   }
  //   return _roomAttributes;
  // },
  updateRoomProperty(key, value, isDeleteAfterOwnerLeft, isForce, isUpdateOwner) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('updateRoomProperty', {
        key,
        value,
        isDeleteAfterOwnerLeft,
        isForce,
        isUpdateOwner
      }).then(_ref4 => {
        let {
          errorKeys
        } = _ref4;

        if (!errorKeys.includes(key)) {
          _roomAttributes[key] = value;
        }

        (0, _logger.zloginfo)('[Plugins][invitation]Update room attributes successfully.', errorKeys);
        resolve({ ...new _defines2.ZegoInvitationImplResult('', ''),
          errorKeys
        });
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to update room attributes.', error);
        reject(error);
      });
    });
  },

  deleteRoomProperties(keys, isForce) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('deleteRoomProperties', {
        keys,
        isForce
      }).then(_ref5 => {
        let {
          errorKeys
        } = _ref5;
        keys.forEach(key => {
          if (!errorKeys.includes(key)) {
            delete _roomAttributes[key];
          }
        });
        (0, _logger.zloginfo)('[Plugins][invitation]Delete room attributes successfully.', errorKeys);
        resolve({ ...new _defines2.ZegoInvitationImplResult('', ''),
          errorKeys
        });
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to delete room attributes.', error);
        reject(error);
      });
    });
  },

  beginRoomPropertiesBatchOperation(isDeleteAfterOwnerLeft, isForce, isUpdateOwner) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    ZegoUIKitSignalingPlugin.getInstance().invoke('beginRoomPropertiesBatchOperation', {
      isDeleteAfterOwnerLeft,
      isForce,
      isUpdateOwner
    });
    (0, _logger.zloginfo)('[Plugins][invitation]Begin room properties batch operation successfully.');
  },

  endRoomPropertiesBatchOperation() {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('endRoomPropertiesBatchOperation').then(async () => {
        try {
          (0, _logger.zloginfo)('[Plugins][invitation]End room properties batch operation successfully.'); // query the room attributes
          // await this.queryRoomProperties();
          // zloginfo(
          //   `[Plugins][invitation]Auto query the room attributes successfully.`,
          //   _roomAttributes
          // );

          resolve(new _defines2.ZegoInvitationImplResult('', ''));
        } catch (error) {
          (0, _logger.zlogerror)(`[Plugins][invitation]Failed to auto query room attributes.`, error);
        }
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to end room attributes batch operation.', error);
        reject(error);
      });
    });
  },

  queryRoomProperties() {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    return new Promise((resolve, reject) => {
      ZegoUIKitSignalingPlugin.getInstance().invoke('queryRoomProperties').then(_ref6 => {
        let {
          roomID,
          roomAttributes
        } = _ref6;
        (0, _logger.zloginfo)('[Plugins][invitation]Query room attributes successfully.', roomAttributes);
        _roomAttributes = roomAttributes;
        resolve({ ...new _defines2.ZegoInvitationImplResult('', ''),
          _roomAttributes
        });
      }).catch(error => {
        (0, _logger.zlogerror)('[Plugins][invitation]Failed to query room attributes.', error);
        reject(error);
      });
    });
  },

  onRoomPropertyUpdated(callbackID, callback) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    if (typeof callback !== 'function') {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('roomPropertyUpdated', callbackID, callback);
    } else {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('roomPropertyUpdated', callbackID, info => {
        const oldRoomAttributes = JSON.parse(JSON.stringify(_roomAttributes));
        const {
          action,
          roomAttributes
        } = info;
        const updateKeys = Object.keys(roomAttributes);
        Object.keys(roomAttributes).forEach(key => {
          const oldValue = _roomAttributes[key]; // action: Set = 0, Delete = 1

          if (action === 0) {
            const value = roomAttributes[key];
            _roomAttributes[key] = value;
            callback(key, oldValue, value);
          } else {
            delete _roomAttributes[key];
            callback(key, oldValue, '');
          }
        });

        _notifyRoomPropertiesFullUpdated([updateKeys, oldRoomAttributes, _roomAttributes]);
      });
    }
  },

  onRoomPropertiesFullUpdated(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in _onRoomPropertiesFullUpdatedCallbackMap) {
        (0, _logger.zloginfo)('[Plugins][invitation][onRoomPropertiesFullUpdated] Remove callback for: [', callbackID, '] because callback is not a valid function!');
        delete _onRoomPropertiesFullUpdatedCallbackMap[callbackID];
      }
    } else {
      _onRoomPropertiesFullUpdatedCallbackMap[callbackID] = callback;
    }
  },

  onInRoomTextMessageReceived(callbackID, callback) {
    if (!ZegoUIKitSignalingPlugin) {
      (0, _logger.zlogerror)(`[Plugins][invitation]Signaling plugin install error.`);
      return;
    }

    if (typeof callback !== 'function') {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('inRoomTextMessageReceived', callbackID, callback);
    } else {
      ZegoUIKitSignalingPlugin.getInstance().registerPluginEventHandler('inRoomTextMessageReceived', callbackID, _ref7 => {
        let {
          messageList,
          fromConversationID
        } = _ref7;
        callback(messageList.map(message => {
          return {
            messageID: message.messageID,
            timestamp: message.timestamp,
            orderKey: message.orderKey,
            senderUserID: message.senderUserID,
            text: message.message
          };
        }));
      });
    }
  }

};
var _default = ZegoUIKitSignalingPluginImpl;
exports.default = _default;
//# sourceMappingURL=index.js.map