const commonConfig = require('./webpack.common.js');
const path = require('path');
const helpers = require('./helpers');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const nodeModules = path.join(process.cwd(), 'node_modules');
// Webpack Plugins
const ModuleConcatenationPlugin = webpack.optimize.ModuleConcatenationPlugin;
const NoEmitOnErrorsPlugin = webpack.NoEmitOnErrorsPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AngularCompilerPlugin = require('@ngtools/webpack').AngularCompilerPlugin;
const PurifyPlugin = require('@angular-devkit/build-optimizer').PurifyPlugin;
const ProgressPlugin = require('webpack/lib/ProgressPlugin');

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 9090;

const metadata = webpackMerge(commonConfig({ENV}).metadata, {
  HOST,
  PORT,
  ENV,
  HMR: false
});

module.exports = webpackMerge(commonConfig({ENV}), {
  devtool: 'source-map',
  entry: {
    'polyfills': './src/polyfills.ts',
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
        "test": /\.(eot|svg)$/,
        "loader": "file-loader?name=assets/[name].[hash:20].[ext]"
      },
      {
        "test": /\.(jpg|png|gif|otf|ttf|woff|woff2|cur|ani)$/,
        "loader": "url-loader?name=assets/[name].[hash:20].[ext]&limit=8192"
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        }),
        include: [helpers.root('src', 'styles')]
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader!sass-loader'
        }),
        include: [helpers.root('src', 'styles')]
      },
      {
        test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
        loader: '@ngtools/webpack'
      },
      {
        test: /\.js$/,
        loader: '@angular-devkit/build-optimizer/webpack-loader',
        options: {
          sourceMap: false
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'ENV': JSON.stringify(metadata.ENV),
      'HMR': metadata.HMR,
      'process.env': {
          'ENV': JSON.stringify(metadata.ENV),
          'NODE_ENV': JSON.stringify(metadata.ENV),
          'HMR': metadata.HMR,
      }
    }),
    new NoEmitOnErrorsPlugin(),
    new ProgressPlugin(),
    new AngularCompilerPlugin({
      "mainPath": "src/main.ts",
      "tsConfigPath": "tsconfig.app.json",
      "skipCodeGeneration": false
    }),
    new ExtractTextPlugin({filename: '[name].[hash].css'}),
    new ModuleConcatenationPlugin(),
    new PurifyPlugin()
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
      hash: true,
      timings: true,
      chuckModules: false,
      modules: true,
      maxModules: 0,
      reasons: false,
      warnings: true,
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
  },
  stats: {
    colors: true,
    hash: true,
    timings: true,
    chunkModules: false,
    modules: true,
    maxModules: 0,
    reasons: false,
    warnings: true,
    version: false,
    assets: true,
    chunks: false,
    children: false
  }
});
