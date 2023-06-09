import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import { zloginfo, zlogerror } from '../../../utils/logger';
export default function ZegoCancelInvitationButton(props) {
  const {
    icon,
    text,
    invitees = [],
    data,
    onPressed,
    onWillPressed,
    backgroundColor = '#FF4A50',
    fontSize = 16,
    color = '#FFFFFF',
    width = 60,
    height = 60,
    borderRadius = 1000,
    verticalLayout // Default row layout, no layout parameters default to precedence icon

  } = props;

  const getImageSourceByPath = () => {
    return require('../resources/button_call_cancel.png');
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
    const canCancelInvitation = typeof onWillPressed === 'function' ? onWillPressed() : true;
    if (!canCancelInvitation) return;
    zloginfo(`[Components]Cancel invitation start, invitees: ${invitees}, data: ${data}`);
    ZegoUIKitInvitationService.cancelInvitation(invitees, data).then(_ref => {
      let {
        code,
        message,
        errorInvitees
      } = _ref;
      zloginfo(`[Components]Cancel invitation success, errorInvitees: ${errorInvitees}`);

      if (invitees.length > errorInvitees.length) {
        if (typeof onPressed === 'function') {
          const inviteesBackup = JSON.parse(JSON.stringify(invitees));
          errorInvitees.forEach(errorInviteeID => {
            const index = inviteesBackup.findIndex(inviteeID => errorInviteeID === inviteeID);
            index !== -1 && inviteesBackup.splice(index, 1);
          });
          onPressed({
            invitees: inviteesBackup
          });
        }
      }
    }).catch(_ref2 => {
      let {
        code,
        message
      } = _ref2;
      zlogerror(`[Components]Cancel invitation error, code: ${code}, message: ${message}`);
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
//# sourceMappingURL=ZegoCancelInvitationButton.js.map