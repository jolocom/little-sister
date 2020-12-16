module.exports = {
  "setupFilesAfterEnv": ["./init.js"],
  "testEnvironment": "node",
  "reporters": ["detox/runners/jest/streamlineReporter"],
  "verbose": true,

  globals: {
    "ts-jest": {
      babelConfig: true,
      diagnostics: {
        warnOnly: true
      }
    }
  },

  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/assetsTransformer.js"
  },

  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],

  moduleDirectories: [
    "<rootDir>/../node_modules",
    "<rootDir>/.."
  ],

  testPathIgnorePatterns: [
    "/node_modules/.*"
  ],

  transform: {
    "^.+\\.tsx?$": "ts-jest"
  }
}
