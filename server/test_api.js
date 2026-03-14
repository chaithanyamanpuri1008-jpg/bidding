import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function runTests() {
  let userToken;
  let adminToken;
  let auctionId;

  try {
    console.log('--- Starting API Endpoint Tests ---');

    // 1. Register User 1
    console.log('[1/7] Testing User Registration...');
    const userRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: `user${Date.now()}@test.com`,
      password: 'password123',
      role: 'User'
    });
    console.log('User Registration successful');

    // 2. Register Admin
    console.log('[2/7] Testing Admin Registration...');
    const adminRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin User',
      email: `admin${Date.now()}@test.com`,
      password: 'adminpassword123',
      role: 'Admin'
    });
    console.log('Admin Registration successful');

    // 3. Login User
    console.log('[3/7] Testing User Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: userRes.data.email,
      password: 'password123'
    });
    userToken = loginRes.data.token;
    console.log('User Login successful');

    // 3b. Login Admin
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: adminRes.data.email,
      password: 'adminpassword123'
    });
    adminToken = adminLoginRes.data.token;

    // 4. Create Auction (Admin Only)
    console.log('[4/7] Testing Create Auction (Admin protected)...');
    const auctionRes = await axios.post(`${API_URL}/auctions`, {
      title: 'Vintage Rolex Watch',
      description: 'A beautiful vintage timepiece from 1965.',
      image: '',
      startingPrice: 5000,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString()
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    auctionId = auctionRes.data._id;
    console.log('Auction Creation successful (ID: ' + auctionId + ')');

    // 5. Test AI Description Generation
    console.log('[5/7] Testing AI Description Generation...');
    try {
      const aiRes = await axios.post(`${API_URL}/ai/generate-description`, {
        title: 'Rare Diamond Necklace',
        keywords: 'shiny, antique, 18k'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('AI Description Generated Successfully:');
      console.log('   ->', aiRes.data.description.substring(0, 100) + '...');
    } catch (e) {
      console.log('AI description failed:', e.response?.data?.message || e.message);
    }

    // 6. Place Bid (by regular user)
    console.log('[6/7] Testing Placing a Bid...');
    const bidRes = await axios.post(`${API_URL}/bids`, {
      auctionId: auctionId,
      amount: 5500
    }, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Bid placed successfully: Rs.' + bidRes.data.amount);

    // 7. Get Auctions List
    console.log('[7/7] Testing Fetching Auctions...');
    const listRes = await axios.get(`${API_URL}/auctions`);
    console.log(`Fetched ${listRes.data.length} auctions successfully`);

    // 8. Fetch specific auction with bids
    console.log('[8/8] Testing Fetching Specific Auction / Bids...');
    const singleAuctionRes = await axios.get(`${API_URL}/auctions/${auctionId}`);
    const bidsListRes = await axios.get(`${API_URL}/bids/${auctionId}`);
    console.log(`Auction Title: ${singleAuctionRes.data.title}`);
    console.log(`Bids Count: ${bidsListRes.data.length}`);

    console.log('All API checks passed!');
  } catch (error) {
    console.error('API Test Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
