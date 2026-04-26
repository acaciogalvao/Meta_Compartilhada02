import http from 'http';

const req = http.request('http://localhost:3000/api/goal', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers['content-type']);
    console.log('Sample:', data.substring(0, 100));
  });
});

req.on('error', (e) => console.error(e));
req.write(JSON.stringify({ itemName: 'test', totalValue: 100 }));
req.end();
