var webpack = require('webpack');
var WebpackStripLoader = require('strip-loader');
var path = require('path');

var APP_DIR = path.resolve(__dirname, 'javascript');

module.exports = {
    entry: {
        setup: APP_DIR + '/Admin/Setup.jsx',
        signup: APP_DIR + '/User/Signup.jsx',
        status: APP_DIR + '/User/Status.jsx'
    },
    output: {
        path: path.join(APP_DIR, "dist"),
        filename: "[name].prod.js"
    },
    module: {
        loaders: [{
            test: /\.jsx?/,
            include: APP_DIR,
            loader: 'babel'
        }, {
            test: [/\.js$/, /\.es6$/, /\.jsx$/],
            exclude: /node_modules/,
            loader: WebpackStripLoader.loader('console.log')
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            }
        })
    ]
}
