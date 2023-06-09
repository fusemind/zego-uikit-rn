"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ZegoInRoomMessageView;

var _react = _interopRequireWildcard(require("react"));

var _reactNative = require("react-native");
const {FlatList} = require("react-native");

var _ZegoUIKitInternal = _interopRequireDefault(require("../internal/ZegoUIKitInternal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ZegoInRoomMessageView(props) {
  const {
    itemBuilder
  } = props;
  const listRef = (0, _react.useRef)(null);
  const [messageList, setMessageList] = (0, _react.useState)([]);

  const refreshMessage = () => {
    // setTimeOut(()=>null)
    // Update list like this will cause rerender
    setMessageList(arr => [..._ZegoUIKitInternal.default.getInRoomMessages()]);
  };

  const renderItem = _ref => {
    let {
      item
    } = _ref;
    return !itemBuilder ? /*#__PURE__*/_react.default.createElement(_reactNative.View, {
      style: styles.messageContainer
    }, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.nameLabel
    }, item.sender.userName, /*#__PURE__*/_react.default.createElement(_reactNative.Text, {
      style: styles.messageLabel
    }, " ", item.message))) : /*#__PURE__*/_react.default.createElement(Delegate, {
      to: itemBuilder,
      props: {
        message: item
      }
    });
  };

  (0, _react.useEffect)(() => {
    refreshMessage();
  }, []);
  (0, _react.useEffect)(() => {
    const callbackID = 'ZegoInRoomMessageView' + String(Math.floor(Math.random() * 10000));

    _ZegoUIKitInternal.default.onInRoomMessageReceived(callbackID, messageList => {
      refreshMessage();
    });

    _ZegoUIKitInternal.default.onInRoomMessageSent(callbackID, (error, messageID) => {
      refreshMessage();
    });

    return () => {
      _ZegoUIKitInternal.default.onInRoomMessageReceived(callbackID);

      _ZegoUIKitInternal.default.onInRoomMessageSent(callbackID);
    };
  }, []);
  return <FlatList data={messageList} onContentSizeChange={() => listRef?.current?.scrollToEnd} showsVerticalScrollIndicator={false} renderItem={renderItem} />
}

const styles = _reactNative.StyleSheet.create({
  messageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(1, 7, 18, 0.3000)',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    paddingLeft: 10
  },
  nameLabel: {
    color: '#8BE7FF',
    fontSize: 13 // marginLeft: 10

  },
  messageLabel: {
    color: 'white',
    fontSize: 13,
    marginLeft: 5
  }
});
//# sourceMappingURL=ZegoInRoomMessageView.js.map