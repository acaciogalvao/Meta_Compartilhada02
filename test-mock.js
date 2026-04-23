import http from 'http';

const data = JSON.stringify({ amount: 10, goalId: "default_goal", payerId: "P1" });

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/mock-pay',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let resData = '';
  res.on('data', (chunk) => resData += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, resData));
});

req.on('error', (err) => console.log('Error:', err.message));
req.write(data);
req.end();
