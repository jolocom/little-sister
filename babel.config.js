// babel.config.js
// const plugins = require('./babel-plugins');

console.log('LOADING CONFIG!!!');

module.exports = (api) => {
    api.cache(true);


    const presets = ["react-native"];
    const plugins = [
        ["babel-plugin-inline-import", {
            "extensions": [
                ".xml",
                ".svg"
            ]
        }],
        ["react-native-platform-specific-extensions", {
            "extensions": ["ts"]
        }]
    ];
    return {
        presets,
        plugins
    };
};


