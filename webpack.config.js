module.exports = {
  entry: {
    main: './demo-tic-tac-toe/main.jsx'
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js(x)?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                'babel-plugin-transform-react-jsx',
                {
                  pragma: 'React.createElement' // default pragma is React.createElement
                }
              ]
            ]
          }
        }
      }
    ]
  }
}
