const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: './src/App.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDev ? 'bundle.js' : 'bundle.[contenthash].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Slot Game',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public/assets',
            to: 'assets',
            noErrorOnMissing: true,
            // NOTE: static assets (Spine JSON, atlas) are not cache-busted here because their
            // paths are referenced by string in Phaser loader calls. To bust cache on asset
            // changes, bump the version in package.json and pass it as a URL query param
            // to the Phaser loader (e.g. scene.load.setPath(`assets?v=${VERSION}`)).
          },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.USE_MOCK':     JSON.stringify(process.env.USE_MOCK     ?? 'true'),
        'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL ?? 'https://api.lucky-reels.com/v1'),
        'process.env.NODE_ENV':     JSON.stringify(argv.mode),
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      port: process.env.PORT ? parseInt(process.env.PORT) : 8090,
      hot: true,
      open: true,
    },
    devtool: isDev ? 'source-map' : false,
    performance: {
      hints: false,
    },
  };
};
