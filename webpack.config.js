var webpack = require('webpack');
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
        filename: "[name].dev.js"
    },
    module: {
        loaders: [{
            test: /\.jsx?/,
            include: APP_DIR,
            loader: 'babel'
        }]
    },
    devtool: 'source-map'
}
