const helpers = require('./helpers');
const path = require('path');
const webpack = require('webpack');
// Webpack Plugins
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const rxPaths = require('rxjs/_esm5/path-mapping');

const HMR = helpers.hasProcessFlag('hot');
const metadata = {
  title: 'ISAO DEMO',
  baseUrl: '',
  isDevServer: helpers.isWebpackDevServer(),
  HMR: HMR,
};

if (helpers.processFlag('mode') ==='production') {
  environment = 'PROD'
} else environment = 'DEV';

module.exports = function makeWebpackConfig(options) {
  //console.log(`Using developement Webpack configuration...`);
  return {
    resolve: {
      extensions: ['.ts', '.js', '.styl'],
      alias: Object.assign({
        config: path.join(__dirname, './src/environments/environment.' + environment.toLowerCase())
      }, rxPaths())
    },
    module: {
      rules: [
        // {
        //   test: /\.json$/,
        //   use: 'json-loader'
        // },
        {
          test: /\.css$/,
          use: ['to-string-loader', 'css-loader'],
          exclude: [helpers.root('src', 'styles')]
        },
        {
          test: /\.html$/,
          use: 'underscore-template-loader',
          exclude: helpers.root('src', 'assets')
        },
        {
          test: /\.styl$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]___[hash:base64:5]'
              }
            },
            'stylus-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: ['to-string-loader', 'css-loader', 'sass-loader'],
          exclude: [helpers.root('src', 'styles')]
        },
        {
          test: /\.(pug|jade)$/,
          use: ['raw-loader', 'pug-html-loader']
        },
        {
          test: /bootstrap\/dist\/js\/umd\//,
          use: 'imports-loader?jQuery=jquery'
        },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        title: metadata.title,
        metadata: metadata,
        inject: 'body',
        chunksSortMode: function (a, b) {
          var order = ["polyfills", "vendor", "main"];
          return order.indexOf(a.names[0]) - order.indexOf(b.names[0]);
        }
      }),
      new CopyWebpackPlugin([{
        from: 'src/assets',
        to: 'assets'
      }], {
        'ignore': [
          '.gitkeep'
        ],
        'debug': 'warning'
      }),
      new webpack.LoaderOptionsPlugin({
        options: {
          /**
           * Apply the tslint loader as pre/postLoader
           * Reference: https://github.com/wbuchwalter/tslint-loader
           */
          tslint: {
            emitErrors: true,
            failOnHint: false
          },
          /**
           * PostCSS
           * Reference: https://github.com/postcss/autoprefixer-core
           * Add vendor prefixes to your css
           */
          postcss: [
            autoprefixer({
              browsers: ['last 2 version']
            })
          ]
        }
      }),
      new CircularDependencyPlugin({
        // exclude detection of files based on a RegExp
        exclude: /a\.js|node_modules/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      })
    ],
  }
};
