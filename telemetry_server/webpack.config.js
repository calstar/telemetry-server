const path = require('path')

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'dist')
  }
}
