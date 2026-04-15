const https = require(‘https’);

exports.handler = async function(event, context) {
if (event.httpMethod !== ‘POST’) {
return { statusCode: 405, body: ‘Method Not Allowed’ };
}

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
return {
statusCode: 500,
headers: { ‘Access-Control-Allow-Origin’: ‘*’ },
body: JSON.stringify({ error: ‘API key not configured’ })
};
}

try {
const body = JSON.parse(event.body);

```
const requestBody = JSON.stringify({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  messages: body.messages
});

const result = await new Promise((resolve, reject) => {
  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch(e) {
        reject(new Error('Parse error: ' + data.substring(0, 200)));
      }
    });
  });

  req.on('error', (e) => reject(e));
  req.write(requestBody);
  req.end();
});

return {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(result)
};
```

} catch (error) {
return {
statusCode: 500,
headers: { ‘Access-Control-Allow-Origin’: ‘*’ },
body: JSON.stringify({ error: error.message })
};
}
};
