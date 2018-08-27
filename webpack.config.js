var webpack = require('webpack')
const setup = require('./exports.js')

module.exports = (env, argv) => {
  const inProduction = argv.mode === 'production'
  const inDevelopment = argv.mode === 'development'

  const settings = {
    entry: setup.entry,
    output: {
      path: setup.path.join(setup.APP_DIR, 'dev'),
      filename: '[name].js',
    },
    externals: {
      $: 'jQuery',
      jquery: 'jQuery',
    },
    optimization: {
      splitChunks: {
        minChunks: 3,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            minChunks: 3,
            name: 'vendor',
            enforce: true,
            chunks: 'all',
          }
        }
      }
    },
    resolve: {
      extensions: ['.js', '.jsx',]
    },
    plugins : [],
    module: {
      rules: [
        {
          test: /\.jsx?/,
          include: setup.APP_DIR,
          loader: 'babel-loader',
          query: {
            presets: ['env', 'react',]
          },
        }, {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
        },
      ]
    }
  }

  if (inDevelopment) {
    const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
    settings.plugins.push(
      new BrowserSyncPlugin({host: 'localhost', notify: false, port: 3000, files: ['./javascript/dev/*.js'], proxy: 'localhost/phpwebsite'})
    )
    settings.devtool = 'inline-source-map'
    settings.output = {
      path: setup.path.join(setup.APP_DIR, 'dev'),
      filename: '[name].js'
    }
  }

  if (inProduction) {
    const AssetsPlugin = require('assets-webpack-plugin')
    const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
    settings.plugins.push(
      new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')})
    )
    settings.plugins.push(new UglifyJsPlugin({extractComments: true}))
    settings.plugins.push(
      new AssetsPlugin({filename: 'assets.json', prettyPrint: true})
    )
    settings.output = {
      path: setup.path.join(setup.APP_DIR, 'build'),
      filename: '[name].[chunkhash:8].min.js',
      chunkFilename: '[name].[chunkhash:8].chunk.js'
    }
  }
  return settings
}
