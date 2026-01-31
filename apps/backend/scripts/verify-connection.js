/**
 * Verification script to confirm end-to-end API connectivity.
 * This simulates the frontend's fetching patterns.
 */

const BASE_URL = 'http://localhost:3000/api/v1';

async function verify() {
    console.log('🔍 Starting End-to-End Connectivity Check...\n');
    let token = '';

    try {
        // 1. Create a unique test user
        const email = `verify_${Date.now()}@example.com`;
        console.log(`Step 1: Registering User (${email})...`);
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123', name: 'Verification User' })
        });
        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        console.log('✅ Registration: OK\n');

        // 2. Login
        console.log('Step 2: Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok || !loginData.success) throw new Error('Login failed');
        token = loginData.data.accessToken;
        console.log('✅ Login: OK (Token acquired)\n');

        const headers = { 'Authorization': `Bearer ${token}` };

        // 3. Verify /auth/me
        console.log('Step 3: Verifying /auth/me...');
        const meRes = await fetch(`${BASE_URL}/auth/me`, { headers });
        const meData = await meRes.json();
        if (!meRes.ok || !meData.success) throw new Error('Auth Me failed');
        console.log(`✅ Identity: OK (Role: ${meData.data.user.role})\n`);

        // 4. Verify /appointments/my (The one that was 404ing)
        console.log('Step 4: Verifying /appointments/my...');
        const apptsRes = await fetch(`${BASE_URL}/appointments/my`, { headers });
        const apptsData = await apptsRes.json();
        if (!apptsRes.ok || !apptsData.success) throw new Error('Appointments fetch failed');
        console.log(`✅ Appointments: OK (Found ${apptsData.data.length} appointments)\n`);

        // 5. Verify /slots
        console.log('Step 5: Verifying /slots...');
        const slotsRes = await fetch(`${BASE_URL}/slots`, { headers });
        const slotsData = await slotsRes.json();
        if (!slotsRes.ok || !slotsData.success) throw new Error('Slots fetch failed');
        console.log(`✅ Slots: OK (Found ${slotsData.data.length} slots)\n`);

        // 6. Verify /resources
        console.log('Step 6: Verifying /resources...');
        const resRes = await fetch(`${BASE_URL}/resources`, { headers });
        const resData = await resRes.json();
        if (!resRes.ok || !resData.success) throw new Error('Resources fetch failed');
        console.log(`✅ Resources: OK (Found ${resData.data.length} resources)\n`);

        console.log('✨ VERIFICATION COMPLETE: Frontend can now fetch all data perfectly!');
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ VERIFICATION FAILED: ${error.message}`);
        process.exit(1);
    }
}

verify();
