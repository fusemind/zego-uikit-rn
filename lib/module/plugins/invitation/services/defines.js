function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

export class ZegoInvitationImplResult {
  constructor() {
    let code = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

    _defineProperty(this, "code", '');

    _defineProperty(this, "message", '');

    this.code = code;
    this.message = message;
  }

}
export const ZegoInvitationConnectionState = {
  disconnected: 0,
  connecting: 1,
  connected: 2,
  reconnecting: 3
};
//# sourceMappingURL=defines.js.map