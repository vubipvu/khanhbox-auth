const { createProxy } = require('netlify-cms-proxy-auth');

module.exports = createProxy({
  config: {
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET
  }
});
