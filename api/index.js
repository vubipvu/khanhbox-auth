const { SimpleGatekeeper } = require('simple-gatekeeper');
module.exports = SimpleGatekeeper({
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
});
