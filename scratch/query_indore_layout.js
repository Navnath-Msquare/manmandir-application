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
  try {
    const id = "202606231997556";
    console.log(`Fetching GDS layout details for schedule ID ${id}...`);
    const scheduleRes = await postRequest('https://api.zerofollowup.com/gds', {
      method: 'GET',
      endpoint: `schedule/${id}.json`,
      query: {
        api_key: 'TSHSPFAPI58368531'
      }
    });
    
    const scheduleData = JSON.parse(scheduleRes);
    console.log("Response:", JSON.stringify(scheduleData, null, 2));
  } catch (err) {
    console.error("Error in query:", err);
  }
}

main();
