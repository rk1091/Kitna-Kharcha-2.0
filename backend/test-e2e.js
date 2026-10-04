const fs = require('fs');

async function run() {
  console.log('1. Logging in...');
  const res = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@example.com', password: 'password' })
  });
  
  const data = await res.json();
  if (!data.token) {
    console.error('Login failed!', data);
    return;
  }
  console.log('Got JWT Token:', data.token.substring(0, 20) + '...');
  
  console.log('\n2. Creating dummy statement...');
  const csvContent = "Date,Description,Amount,Type\n2023-10-01,Zomato Order,500,DEBIT\n2023-10-02,Uber Ride,300,DEBIT\n2023-10-03,Unknown Merchant,1500,CREDIT";
  fs.writeFileSync('dummy.csv', csvContent);
  
  console.log('\n3. Uploading statement...');
  const formData = new FormData();
  const fileBlob = new Blob([csvContent], { type: 'text/csv' });
  formData.append('file', fileBlob, 'dummy.csv');
  
  const uploadRes = await fetch('http://localhost:3001/ingestion/upload', {
    method: 'POST',
    headers: { 'Authorization': Bearer  },
    body: formData
  });
  
  const uploadData = await uploadRes.json();
  console.log('Upload Response:', uploadData);
}
run();
