const http = require('http');

const data = JSON.stringify({
  classId: "4",
  sessionId: "1", 
  termId: "1",
  studentId: "DPS2024001"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/results/check',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
