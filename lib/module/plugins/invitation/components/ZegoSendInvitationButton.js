import React, { Fragment } from 'react';
import { Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import ZegoUIKitInvitationService from '../services';
import ZegoInvitationType from './ZegoInvitationType';
import { zloginfo, zlogerror } from '../../../utils/logger';
export default function ZegoSendInvitationButton(props) {
  const {
    icon,
    text,
    invitees = [],
    type = ZegoInvitationType.videoCall,
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
    if (type === ZegoInvitationType.videoCall) {
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
    zloginfo(`[Components]Send invitation start, invitees: ${invitees}, timeout: ${timeout}, type: ${type}, data: ${data}`);
    ZegoUIKitInvitationService.sendInvitation(invitees, timeout, type, data, {
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
      zloginfo(`[Components]Send invitation success, code: ${code}, message: ${message}, errorInvitees: ${errorInvitees}`);

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
      zlogerror(`[Components]Send invitation error, code: ${code}, message: ${message}`);
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
//# sourceMappingURL=ZegoSendInvitationButton.js.map