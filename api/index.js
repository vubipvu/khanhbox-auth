const https = require('https');
const url = require('url');

module.exports = (req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // 1. Chuyển hướng đến GitHub để lấy Code
  if (pathname === '/auth') {
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo&state=${query.state}`;
    res.writeHead(302, { Location: githubUrl });
    return res.end();
  }

  // 2. Nhận Code từ GitHub và đổi lấy Token
  if (pathname === '/callback') {
    const postData = JSON.stringify({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code: query.code,
      state: query.state
    });

    const request = https.request('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': postData.length
      }
    }, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        const body = JSON.parse(data);
        const token = body.access_token;
        const content = `authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`;
        
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <html><body><script>
            (function() {
              function receiveMessage(e) {
                window.opener.postMessage("${content}", e.origin);
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script></body></html>
        `);
      });
    });

    request.write(postData);
    request.end();
    return;
  }

  res.end('Auth Server is running!');
};
