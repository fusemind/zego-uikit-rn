"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZegoUIKitPluginType = exports.ZegoRoomPropertyUpdateType = exports.ZegoChangedCountOrProperty = exports.ZegoAudioVideoResourceMode = void 0;
const ZegoAudioVideoResourceMode = {
  Default: 0,
  CDNOnly: 1,
  L3Only: 2,
  RTCOnly: 3,
  CDNPlus: 4
};
exports.ZegoAudioVideoResourceMode = ZegoAudioVideoResourceMode;
const ZegoChangedCountOrProperty = {
  userAdd: 1,
  userDelete: 2,
  microphoneStateUpdate: 3,
  cameraStateUpdate: 4,
  attributesUpdate: 5
};
exports.ZegoChangedCountOrProperty = ZegoChangedCountOrProperty;
const ZegoUIKitPluginType = {
  signaling: 1,
  // zim, fcm
  beauty: 2,
  // effects or avatar or deepAR
  whiteboard: 3 // superboard

};
exports.ZegoUIKitPluginType = ZegoUIKitPluginType;
const ZegoRoomPropertyUpdateType = {
  set: 0,
  update: 1,
  remote: 2
};
exports.ZegoRoomPropertyUpdateType = ZegoRoomPropertyUpdateType;
//# sourceMappingURL=defines.js.map