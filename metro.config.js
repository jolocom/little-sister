/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  resolver: {
    extraNodeModules: {
      // Polyfills for node packages
      crypto: require.resolve('react-native-crypto'),
      'crypto-browserify': require.resolve('react-native-crypto'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      src: __dirname + '/src',
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      // https://www.npmjs.com/package/terser#mangle-options
      ecma: 8,
      keep_classnames: true,
      keep_fnames: true,
      module: true,
      mangle: {
        module: true,
        keep_classnames: true,
        keep_fnames: true,
      },
    },
  },
}
