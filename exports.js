exports.path = require('path')
exports.APP_DIR = exports.path.resolve(__dirname, 'javascript')

exports.entry = {
  setup: exports.APP_DIR + '/Admin/Setup.jsx',
  signup: exports.APP_DIR + '/User/Signup.jsx',
  status: exports.APP_DIR + '/User/Status.jsx'
}
