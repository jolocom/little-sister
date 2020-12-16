module.exports = {
  assets: [
    "./src/assets/fonts"
  ],

  dependencies: {
  /* if we want to use SQLite bundled with react-native-sqlite-storage
   * (which supports for FTS5 https://www.sqlite.org/fts5.html)
   * we need this bit, but it currently crashes the app on startup and we
   * currently don't need/use it
   *
    "react-native-sqlite-storage": {
      platforms: {
        android: {
          sourceDir:
            "../node_modules/react-native-sqlite-storage/platforms/android-native",
          packageImportPath: "import io.liteglue.SQLitePluginPackage;",
          packageInstance: "new SQLitePluginPackage()"
        }
      }
    },
  /**/
  }
}
