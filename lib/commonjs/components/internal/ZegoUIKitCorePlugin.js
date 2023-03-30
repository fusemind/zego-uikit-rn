"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ZegoUIKitPluginType", {
  enumerable: true,
  get: function () {
    return _defines.ZegoUIKitPluginType;
  }
});
exports.default = void 0;

var _logger = require("../../utils/logger");

var _defines = require("./defines");

const _plugins = new Map(); // type -> plugin


const ZegoUIKitCorePlugin = {
  installPlugins: plugins => {
    if (!plugins || !plugins instanceof Array) {
      (0, _logger.zlogerror)('[installPlugins]The parameter passed in was incorrect');
      return;
    }

    plugins.forEach(plugin => {
      if (plugin.getInstance) {
        const type = plugin.getInstance().getPluginType ? plugin.getInstance().getPluginType() : null;

        if (Object.values(_defines.ZegoUIKitPluginType).includes(type)) {
          if (_plugins.get(type)) {
            (0, _logger.zlogwarning)('[installPlugins]Plugin already exists, will update plugin instance');
          } else {
            _plugins.set(type, plugin);

            (0, _logger.zloginfo)('[installPlugins]Plugin install success, plugins: ', _plugins);
          }
        }
      }
    });
  },
  getPlugin: type => {
    return _plugins.get(type);
  }
};
var _default = ZegoUIKitCorePlugin;
exports.default = _default;
//# sourceMappingURL=ZegoUIKitCorePlugin.js.map