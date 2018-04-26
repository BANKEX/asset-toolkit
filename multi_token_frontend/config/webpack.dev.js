const commonConfig = require('./webpack.common.js');
const helpers = require('./helpers');
const webpackMerge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const nodeModules = path.join(process.cwd(), 'node_modules');
// Webpack Plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;

const ENV = process.env.ENV = process.env.NODE_ENV = 'development';
const AOT = process.env.BUILD_AOT || helpers.hasNpmFlag('aot');
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8000;

const metadata = webpackMerge(commonConfig({ENV}).metadata, {
  HOST,
  PORT,
  ENV,
});

console.log('AOT: ', AOT)
module.exports = webpackMerge(commonConfig({ENV}), {
  devtool: 'cheap-module-source-map',
  entry: {
    'polyfills': './src/polyfills.ts',
    'vendors': './src/vendors.ts',
    'main': ['./src/main.ts', './src/styles/styles.scss']
  },
  output: {
    path: helpers.root('dist'),
    filename: 'js/[name].bundle.js',
    chunkFilename: 'js/[id].chunk.js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    },
  },
  module: {
    rules: [
      {
        test: /\.(eot|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:20].[ext]'
          }
        }]
      },
      {
        test: /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[name].[hash:20].[ext]'
          }
        }]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [helpers.root('src', 'styles')]
      },
      {
        test: /\.s(a|c)ss$/, // .sass || .scss
        loader: 'style-loader!css-loader!sass-loader',
        include: [helpers.root('src', 'styles')]
      },
      {
        test: /\.ts$/,
        loaders: ['@ngtools/webpack']
      }
    ]
  },
  plugins: [
    new AngularCompilerPlugin({
      mainPath: "./src/main.ts",
      tsConfigPath: "./tsconfig.app.json",
      skipCodeGeneration: !AOT
    }),
  ],
  devServer: {
    port: PORT,
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    open: true,
    overlay: true,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chuckModules: false,
      modules: false,
      maxModules: 0,
      reasons: false,
      warnings: false,
      version: false,
      assets: false,
      chunks: true,
      children: false
    } // none (or false), errors-only, minimal, normal (or true) and verbose
  },
  node: {
    global: true,
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
});
