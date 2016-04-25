var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: [
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/js/main.jsx',
    './src/index.html'
  ],
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: path.resolve(__dirname) + '/src/js',
    alias: {
      actions: 'actions',
      components: 'components',
      stores: 'stores',
      lib: 'lib',
      styles: 'styles',
      settings: path.resolve(__dirname) + '/config/development.js'
    }
  },
  output: {
    path: path.resolve(__dirname) + '/dist/js',
    filename: 'bundle.js',
    publicPath: 'js'
  },

  externals:[{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'  
  }], 

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test:   /\.jsx?/,
        loader: 'babel',
        include: path.resolve(__dirname) + '/src/js',
        exclude: 'node_modules'
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
}
