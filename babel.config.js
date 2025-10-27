const nativewind = require('nativewind/babel');

module.exports = function (api) {
  api.cache(true);
  const nativewindConfig = nativewind();
  const nativewindPlugins = Array.isArray(nativewindConfig?.plugins)
    ? nativewindConfig.plugins.filter(
        (plugin) =>
          !(typeof plugin === 'string' && plugin.includes('react-native-worklets'))
      )
    : [];

  return {
    presets: ['babel-preset-expo'],
    plugins: [...nativewindPlugins, 'react-native-reanimated/plugin'],
  };
};
