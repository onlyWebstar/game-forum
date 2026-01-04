const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🔐 Testing Authentication API...\n');

    // Test Registration
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
      username: 'testuser1',
      email: 'onlyonewebstarr@gmail.com',
      password: 'password123'
    });
    console.log('✅ Registration:', registerResponse.data.message);
    console.log('   User:', registerResponse.data.data.user.username);
    console.log('   Token received:', !!registerResponse.data.data.token);

    const token = registerResponse.data.data.token;

    // Test Login
    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'onlyonewebstarr@gmail.com',
      password: 'password123'
    });
    console.log('✅ Login:', loginResponse.data.message);

    // Test Get Current User (with token)
    console.log('\n3. Testing get current user...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Current user:', meResponse.data.data.user.username);

    console.log('\n🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();