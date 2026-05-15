const https = require('https');
const url = require('url');

module.exports = (req, res) => {
  const { query } = url.parse(req.url, true);

  // 1. Nếu có chữ 'code' trên thanh địa chỉ -> Nhận mã từ GitHub về
  if (query.code) {
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
        res.end(`<html><body><script>
          (function() {
            function receiveMessage(e) { window.opener.postMessage("${content}", e.origin); }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script></body></html>`);
      });
    });
    request.write(postData);
    request.end();
    return;
  }

  // 2. Chuyển thẳng sang trang Đăng nhập của GitHub
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.OAUTH_CLIENT_ID}&scope=repo&state=${query.state || 'random-state'}`;
  res.writeHead(302, { Location: githubUrl });
  res.end();
};
