module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ["transform-inline-environment-variables"],

    ["babel-plugin-inline-import", {
      "extensions": [
        ".xml",
        ".svg"
      ]
    }],

    // needed for reflect-metadata to work
    "babel-plugin-transform-typescript-metadata",

    ["@babel/plugin-proposal-decorators", {
      legacy: true
    }],
  ]
};
