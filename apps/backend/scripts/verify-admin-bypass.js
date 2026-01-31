
const API_URL = 'http://localhost:3000/api/v1';

async function verifyAdminBypass() {
    console.log('🚀 Verifying Admin Bypass...');

    try {
        // 1. Test /me with bypass token
        console.log('Step 1: Testing /me with dev-bypass-token...');
        const meRes = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': 'Bearer dev-bypass-token' }
        });
        const meData = await meRes.json();

        if (meData.success && meData.data.user.role === 'admin') {
            console.log('✅ Admin Bypass Verified: Authenticated as', meData.data.user.email);
        } else {
            console.error('❌ Admin Bypass Failed: Incorrect response', meData);
            process.exit(1);
        }

        // 2. Test Resource Creation with bypass token
        console.log('\nStep 2: Testing Resource Creation (Admin Only)...');
        const resourceRes = await fetch(`${API_URL}/resources`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer dev-bypass-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Room ' + Date.now(),
                type: 'Meeting Room',
                capacity: 10
            })
        });
        const resourceData = await resourceRes.json();

        if (resourceData.success) {
            console.log('✅ Resource Created Successfully:', resourceData.data.name);
        } else {
            console.error('❌ Resource Creation Failed:', resourceData.error);
            process.exit(1);
        }

        // 3. Test Slot Creation with bypass token
        console.log('\nStep 3: Testing Slot Creation (Admin/Staff Only)...');
        const slotRes = await fetch(`${API_URL}/slots`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer dev-bypass-token',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resourceId: resourceData.data.id,
                startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                endTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours from now
                price: 50
            })
        });
        const slotData = await slotRes.json();

        if (slotData.success) {
            console.log('✅ Slot Created Successfully');
        } else {
            console.error('❌ Slot Creation Failed:', slotData.error);
            process.exit(1);
        }

        // 4. Test Appointments List
        console.log('\nStep 4: Testing Appointments List (My)...');
        const apptsRes = await fetch(`${API_URL}/appointments/my`, {
            headers: { 'Authorization': 'Bearer dev-bypass-token' }
        });
        const apptsData = await apptsRes.json();
        if (apptsData.success) {
            console.log(`✅ Fetched ${apptsData.data.length} appointments`);
        } else {
            console.error('❌ Appointments Fetch Failed:', apptsData.error);
            process.exit(1);
        }

        console.log('\n🎉 ALL ADMIN BYPASS TESTS PASSED!');
    } catch (error) {
        console.error('❌ Verification Error:', error.message);
        process.exit(1);
    }
}

verifyAdminBypass();
