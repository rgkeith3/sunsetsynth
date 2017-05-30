var path = require('path');

module.exports = {
  context: __dirname,
  entry: "./js/entry.js",
  output: {
    path: path.resolve(__dirname),
    filename: "./js/bundle.js"
  },
  module: {
    loaders: [
      {
        test: [/\.js?$/],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.js', '*']
  }
};
