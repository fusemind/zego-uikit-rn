import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import { zloginfo, zlogerror } from '../../../utils/logger';
export default function ZegoAcceptInvitationButton(props) {
  const {
    icon,
    text,
    inviterID,
    data,
    onPressed,
    onWillPressed,
    backgroundColor = '#30D059',
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
    return require('../resources/button_call_audio_accept.png');
  };

  const getRenderView = () => {
    let renderView;

    if (verticalLayout === undefined) {
      // Choose between icon and text
      if (icon) {
        renderView = /*#__PURE__*/React.createElement(Image, {
          resizeMode: "contain",
          source: icon
        });
      } else {
        if (!text) {
          renderView = /*#__PURE__*/React.createElement(Image, {
            resizeMode: "contain",
            source: getImageSourceByPath()
          });
        } else {
          renderView = /*#__PURE__*/React.createElement(Text, {
            style: getCustomTextStyle(fontSize, color).text
          }, text);
        }
      }
    } else {
      // Both icon and text exist
      renderView = /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(Image, {
        resizeMode: "contain",
        source: icon || getImageSourceByPath(),
        style: {
          marginRight: 6
        }
      }), /*#__PURE__*/React.createElement(Text, {
        style: getCustomTextStyle(fontSize, color).text
      }, text));
    }

    return renderView;
  };

  const getCustomTextStyle = (fontSize, color) => StyleSheet.create({
    text: {
      fontSize,
      color
    }
  });

  const getCustomContainerStyle = (width, height, borderRadius, backgroundColor, verticalLayout) => StyleSheet.create({
    customContainer: {
      flexDirection: verticalLayout ? 'column' : 'row',
      width,
      height,
      backgroundColor,
      borderRadius
    }
  });

  const onButtonPress = () => {
    const canAcceptInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canAcceptInvitation) return;
    zloginfo(`[Components]Accept invitation start, inviterID: ${inviterID}, data: ${data}`);
    ZegoUIKitInvitationService.acceptInvitation(inviterID, data).then(() => {
      zloginfo(`[Components]Accept invitation success`);

      if (typeof onPressed === 'function') {
        onPressed();
      }
    }).catch(_ref => {
      let {
        code,
        message
      } = _ref;
      zlogerror(`[Components]Accept invitation error, code: ${code}, message: ${message}`);
    });
  };

  return /*#__PURE__*/React.createElement(TouchableOpacity, {
    style: [styles.container, getCustomContainerStyle(width, height, borderRadius, backgroundColor, verticalLayout).customContainer],
    onPress: onButtonPress
  }, getRenderView());
}
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
//# sourceMappingURL=ZegoAcceptInvitationButton.js.map