const ZegoAudioVideoResourceMode = {
  Default: 0,
  CDNOnly: 1,
  L3Only: 2,
  RTCOnly: 3,
  CDNPlus: 4
};
const ZegoChangedCountOrProperty = {
  userAdd: 1,
  userDelete: 2,
  microphoneStateUpdate: 3,
  cameraStateUpdate: 4,
  attributesUpdate: 5
};
const ZegoUIKitPluginType = {
  signaling: 1,
  // zim, fcm
  beauty: 2,
  // effects or avatar or deepAR
  whiteboard: 3 // superboard

};
const ZegoRoomPropertyUpdateType = {
  set: 0,
  update: 1,
  remote: 2
};
export { ZegoAudioVideoResourceMode, ZegoChangedCountOrProperty, ZegoUIKitPluginType, ZegoRoomPropertyUpdateType };
//# sourceMappingURL=defines.js.map