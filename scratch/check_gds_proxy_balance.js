const http = require('https');

function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', (e) => reject(e));
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  const apiKey = 'TSHSPFAPI58368531';
  try {
    console.log(`Checking GDS balance via proxy with key: ${apiKey}...`);
    const res = await postRequest('https://api.zerofollowup.com/gds', {
      method: 'GET',
      endpoint: 'get_balance.json',
      query: {
        api_key: apiKey
      }
    });
    const parsed = JSON.parse(res);
    console.log("Full Proxy Response:", JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.error("Error checking balance:", err);
  }
}

main();
