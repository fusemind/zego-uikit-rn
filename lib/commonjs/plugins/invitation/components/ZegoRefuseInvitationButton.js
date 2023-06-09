"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ZegoRefuseInvitationButton;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");

var _services = _interopRequireDefault(require("../services"));

var _logger = require("../../../utils/logger");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ZegoRefuseInvitationButton(props) {
  const {
    icon,
    text,
    inviterID,
    data,
    onPressed,
    onWillPressed,
    backgroundColor = '#FF4A50',
    fontSize = 16,
    color = '#FFFFFF',
    width,
    // The default size was not given in the first release, so I can't add it here
    height,
    // The default size was not given in the first release, so I can't add it here
    borderRadius = 1000,
    verticalLayout // Default row layout, no layout parameters default to precedence icon

  } = props;

  const getImageSourceByPath = () => {
    return require('../resources/button_call_reject.png');
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

  const onButtonPress = () => {
    const canRefuseInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canRefuseInvitation) return;
    (0, _logger.zloginfo)(`[Components]Refuse invitation start, inviterID: ${inviterID}, data: ${data}`);

    _services.default.refuseInvitation(inviterID, data).then(() => {
      (0, _logger.zloginfo)(`[Components]Refuse invitation success`);

      if (typeof onPressed === 'function') {
        onPressed();
      }
    }).catch(_ref => {
      let {
        code,
        message
      } = _ref;
      (0, _logger.zlogerror)(`[Components]Refuse invitation error, code: ${code}, message: ${message}`);
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
//# sourceMappingURL=ZegoRefuseInvitationButton.js.map