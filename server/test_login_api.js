const axios = require('axios'); // You might need to install axios or use http
// using http to avoid dependency issues if axios isnt in server node_modules (it is in package.json though)

async function testLogin() {
    console.log('Testing Login API on http://localhost:5001/api/auth/login');
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'tailor@example.com',
            password: 'password123'
        });
        console.log('SUCCESS:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('FAILURE Status:', error.response.status);
            console.log('FAILURE Data:', error.response.data);
        } else if (error.request) {
            console.log('FAILURE: No response received. Server might be down or incorrect port.');
            console.log('Error:', error.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testLogin();
