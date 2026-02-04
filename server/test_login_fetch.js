async function testLogin() {
    console.log('Testing Login API on http://localhost:5001/api/auth/login');
    try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'tailor@example.com',
                password: 'password123'
            })
        });

        console.log('Status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('SUCCESS Data:', data);
        } else {
            console.log('FAILURE Text:', await response.text());
        }
    } catch (error) {
        console.log('ERROR:', error);
    }
}

testLogin();
