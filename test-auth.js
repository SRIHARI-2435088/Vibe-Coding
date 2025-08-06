const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');

    // Test 1: Login with existing user (admin/admin)
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@ktat.com',
      password: 'admin123'
    });

    console.log('✅ Login successful');
    console.log('Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('User:', loginResponse.data.user?.email);

    const token = loginResponse.data.token;

    // Test 2: Validate token
    console.log('\n2. Testing token validation...');
    const validateResponse = await axios.get(`${BASE_URL}/auth/validate`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Token validation successful');
    console.log('User from validation:', validateResponse.data.data?.email);

    // Test 3: Refresh token
    console.log('\n3. Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Token refresh successful');
    console.log('New token received:', refreshResponse.data.data?.token ? 'Yes' : 'No');

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

// Run the test
testAuth(); 