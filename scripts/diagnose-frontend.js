// Simple diagnostic script to test API calls from frontend
const API_BASE_URL = 'http://localhost:8000';

async function diagnoseFrontendAPI() {
    console.log('🔍 Diagnosing Frontend API Issues');
    console.log('=' .repeat(40));
    
    // Test 1: Basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health check:', data);
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return;
    }
    
    // Test 2: Master skills endpoint
    console.log('\n2️⃣ Testing master skills endpoint...');
    try {
        const response = await fetch(`${API_BASE_URL}/skills/master`);
        if (response.ok) {
            const skills = await response.json();
            console.log(`✅ Master skills: ${skills.length} skills loaded`);
            console.log('Sample skill:', skills[0]);
        } else {
            console.error(`❌ Master skills failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Master skills error:', error);
    }
    
    // Test 3: Job roles endpoint
    console.log('\n3️⃣ Testing job roles endpoint...');
    try {
        const response = await fetch(`${API_BASE_URL}/roles`);
        if (response.ok) {
            const roles = await response.json();
            console.log(`✅ Job roles: ${roles.length} roles loaded`);
            console.log('Sample role:', roles[0]);
        } else {
            console.error(`❌ Job roles failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Job roles error:', error);
    }
    
    // Test 4: CORS headers
    console.log('\n4️⃣ Testing CORS headers...');
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
        const corsHeaders = response.headers.get('Access-Control-Allow-Headers');
        console.log('CORS Origin:', corsOrigin);
        console.log('CORS Headers:', corsHeaders);
    } catch (error) {
        console.error('❌ CORS test error:', error);
    }
    
    console.log('\n🎉 Frontend API diagnosis completed!');
}

// Run diagnosis
diagnoseFrontendAPI();