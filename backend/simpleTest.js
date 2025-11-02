import fetch from 'node-fetch';

console.log('Testing basic server connectivity...');

fetch('http://localhost:5000/api/home/data')
  .then(response => {
    console.log('Status:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('Response length:', data.length);
    console.log('Response preview:', data.substring(0, 200));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });