async function testAllLogins() {
    const users = [
        { role: 'Admin', email: 'admin@example.com', password: 'password123' },
        { role: 'Tailor', email: 'tailor@example.com', password: 'password123' },
        { role: 'Customer', email: 'user@example.com', password: 'password123' }
    ];

    console.log('Testing ALL Login Roles on http://localhost:5001/api/auth/login\n');

    for (const user of users) {
        try {
            console.log(`[${user.role}] Attempting login for ${user.email}...`);
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ [${user.role}] SUCCESS! Token received for ${data.name} (${data.role})`);
            } else {
                const text = await response.text();
                console.log(`❌ [${user.role}] FAILED. Status: ${response.status} - ${text}`);
            }
        } catch (error) {
            console.log(`❌ [${user.role}] ERROR:`, error.message);
        }
        console.log('-----------------------------------');
    }
}

testAllLogins();
