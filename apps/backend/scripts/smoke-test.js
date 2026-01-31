/**
 * Smoke test script for Hyper Backend API
 * Verifies: Health, Auth, and CRUD flows
 * Run: node scripts/smoke-test.js
 */

const BASE_URL = process.env['API_URL'] || 'http://localhost:3000/api/v1';

async function runSmokeTest() {
    console.log('🚀 Starting Smoke Test...\n');
    let authToken = '';
    let taskId = '';

    try {
        // 1. Health Check
        console.log('Step 1: Health Check...');
        const healthRes = await fetch(`${BASE_URL}/health`);
        if (!healthRes.ok) throw new Error('Health check failed');
        console.log('✅ Health check OK\n');

        // 2. Auth Flow: Register
        console.log('Step 2: User Registration...');
        const testUser = {
            email: `smoke_test_${Date.now()}@example.com`,
            password: 'password123',
            name: 'Smoke Test User',
            role: 'student'
        };
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${regData.error?.message || 'Unknown'}`);
        console.log('✅ Registration successful\n');

        // 3. Auth Flow: Login
        console.log('Step 3: User Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUser.email, password: testUser.password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error('Login failed');
        authToken = loginData.data.accessToken;
        console.log('✅ Login successful (Received Token)\n');

        // 4. Auth Flow: GET /me
        console.log('Step 4: Verify /me...');
        const meRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const meData = await meRes.json();
        if (!meRes.ok || meData.data.user.email !== testUser.email) throw new Error('Verify /me failed');
        console.log('✅ Identity verified\n');

        // 5. CRUD: Create Task
        console.log('Step 5: Create Task...');
        const newTask = { title: 'Smoke Test Task', description: 'Testing the API', status: 'active' };
        const createRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(newTask),
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error('Task creation failed');
        taskId = createData.data.task.id;
        console.log(`✅ Task created (ID: ${taskId})\n`);

        // 6. CRUD: List Tasks
        console.log('Step 6: List Tasks...');
        const listRes = await fetch(`${BASE_URL}/tasks`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const listData = await listRes.json();
        if (!listRes.ok || !listData.data.tasks.find((t) => t.id === taskId)) throw new Error('Task list check failed');
        console.log('✅ Task list contains new task\n');

        // 7. CRUD: Update Task
        console.log('Step 7: Update Task...');
        const updateRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ status: 'completed' }),
        });
        if (!updateRes.ok) throw new Error('Task update failed');
        console.log('✅ Task updated to completed\n');

        // 8. Cleanup: Delete Task
        console.log('Step 8: Cleanup (Delete Task)...');
        const delRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!delRes.ok) throw new Error('Task deletion failed');
        console.log('✅ Cleanup successful\n');

        console.log('🎉 SMOKE TEST PASSED SUCCESSFULLY!');
        process.exit(0);
    } catch (error) {
        console.error(`\n❌ SMOKE TEST FAILED: ${error.message}`);
        process.exit(1);
    }
}

runSmokeTest();
