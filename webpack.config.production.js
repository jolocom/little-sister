var path = require('path')

module.exports = {
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    './src/js/main.jsx'
  ],
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    root: path.resolve(__dirname) + '/src/js',
    alias: {
      actions: 'actions',
      components: 'components',
      stores: 'stores',
      lib: 'lib',
      styles: 'styles',
      settings: path.resolve(__dirname) + '/config/production.js'
    }
  },
  output: {
    path: path.resolve(__dirname) + '/dist/js',
    filename: 'bundle.js',
    publicPath: 'js/'
  },
  externals: [{
    xmlhttprequest: '{XMLHttpRequest:XMLHttpRequest}'
  }],
  plugins: [],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      include: [
        path.join(__dirname, 'src', 'js'),
        path.join(__dirname, 'test'),
        path.join(__dirname, 'node_modules', 'ethereumjs-tx')
      ]
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  debug: true
}
