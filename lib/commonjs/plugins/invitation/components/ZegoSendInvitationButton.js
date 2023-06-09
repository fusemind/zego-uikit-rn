"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ZegoSendInvitationButton;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _services = _interopRequireDefault(require("../services"));

var _ZegoInvitationType = _interopRequireDefault(require("./ZegoInvitationType"));

var _logger = require("../../../utils/logger");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ZegoSendInvitationButton(props) {
  const {
    icon,
    text,
    invitees = [],
    type = _ZegoInvitationType.default.videoCall,
    data,
    timeout = 60,
    onPressed,
    onWillPressed,
    backgroundColor = '#F3F4F7',
    fontSize = 16,
    color = '#2A2A2A',
    width = 42,
    height = 42,
    borderRadius = 1000,
    verticalLayout,
    // Default row layout, no layout parameters default to precedence icon
    resourceID,
    notificationTitle,
    notificationMessage
  } = props;

  const getImageSourceByPath = () => {
    if (type === _ZegoInvitationType.default.videoCall) {
      return require('../resources/blue_button_video_call.png');
    } else {
      return require('../resources/blue_button_audio_call.png');
    }
  };

  const getRenderView = () => {
    let renderView;

    if (verticalLayout === undefined) {
      // Choose between icon and text
      if (icon) {
        renderView = /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
          resizeMode: "contain",
          source: icon
        });
      } else {
        if (!text) {
          renderView = /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
            resizeMode: "contain",
            source: getImageSourceByPath()
          });
        } else {
          renderView = /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
            style: getCustomTextStyle(fontSize, color).text
          }, text);
        }
      }
    } else {
      // Both icon and text exist
      renderView = /*#__PURE__*/_react.default.createElement(_react.Fragment, null, /*#__PURE__*/_react.default.createElement(_reactNative.Image, {
        resizeMode: "contain",
        source: icon || getImageSourceByPath(),
        style: {
          marginRight: 6
        }
      }), /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
        style: getCustomTextStyle(fontSize, color).text
      }, text));
    }

    return renderView;
  };

  const getCustomTextStyle = (fontSize, color) => _reactNative.StyleSheet.create({
    text: {
      fontSize,
      color
    }
  });

  const getCustomContainerStyle = (width, height, borderRadius, backgroundColor, verticalLayout) => _reactNative.StyleSheet.create({
    customContainer: {
      flexDirection: verticalLayout ? 'column' : 'row',
      width,
      height,
      backgroundColor,
      borderRadius
    }
  });

  const onButtonPress = async () => {
    let canSendInvitation = true;

    if (onWillPressed) {
      console.log('#########onWillPressed judge', typeof onWillPressed === 'object', typeof onWillPressed.then === 'function', typeof onWillPressed.catch === 'function');

      if (typeof onWillPressed === 'object' && typeof onWillPressed.then === 'function' && typeof onWillPressed.catch === 'function') {
        // Promise
        console.log('#########onWillPressed promise', onWillPressed);

        try {
          canSendInvitation = await onWillPressed;
        } catch (error) {
          canSendInvitation = false;
        }
      } else if (typeof onWillPressed === 'function') {
        console.log('#########onWillPressed function', onWillPressed);
        const temp = onWillPressed();

        if (typeof temp === 'object' && typeof temp.then === 'function' && typeof temp.catch === 'function') {
          console.log('#########onWillPressed promise', temp);

          try {
            canSendInvitation = await temp;
          } catch (error) {
            canSendInvitation = false;
          }
        } else {
          canSendInvitation = temp;
        }
      }
    }

    if (!canSendInvitation) return;
    (0, _logger.zloginfo)(`[Components]Send invitation start, invitees: ${invitees}, timeout: ${timeout}, type: ${type}, data: ${data}`);

    _services.default.sendInvitation(invitees, timeout, type, data, {
      resourceID,
      title: notificationTitle,
      message: notificationMessage
    }).then(_ref => {
      let {
        code,
        message,
        callID,
        errorInvitees
      } = _ref;
      (0, _logger.zloginfo)(`[Components]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`);

      if (invitees.length > errorInvitees.length) {
        if (typeof onPressed === 'function') {
          const inviteesBackup = JSON.parse(JSON.stringify(invitees));
          errorInvitees.forEach(errorInviteeID => {
            const index = inviteesBackup.findIndex(inviteeID => errorInviteeID === inviteeID);
            index !== -1 && inviteesBackup.splice(index, 1);
          });
          onPressed({
            invitationID: callID,
            errorCode: code,
            errorMessage: message,
            errorInvitees,
            invitees: inviteesBackup
          });
        }
      }
    }).catch(_ref2 => {
      let {
        code,
        message
      } = _ref2;
      (0, _logger.zlogerror)(`[Components]Send invitation error, code: ${code}, message: ${message}`);
    });
  };

  return /*#__PURE__*/_react.default.createElement(_reactNative.TouchableOpacity, {
    style: [styles.container, getCustomContainerStyle(width, height, borderRadius, backgroundColor, verticalLayout).customContainer],
    onPress: onButtonPress
  }, getRenderView());
}

const styles = _reactNative.StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
//# sourceMappingURL=ZegoSendInvitationButton.js.map