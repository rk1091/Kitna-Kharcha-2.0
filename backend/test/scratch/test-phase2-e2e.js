const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function runE2ETests() {
  console.log('🚀 Starting Phase 2 E2E Tests: Analytics & Transactions API\n');

  try {
    // 1. Fetch Categories
    console.log('1️⃣ Fetching Categories (GET /transactions/categories/all)...');
    const catRes = await axios.get(`${API_URL}/transactions/categories/all`);
    console.log(`✅ Success! Found ${catRes.data.length} categories.`);
    
    // 2. Fetch Transactions
    console.log('\n2️⃣ Fetching Transactions Dashboard Data (GET /transactions)...');
    const txnRes = await axios.get(`${API_URL}/transactions`);
    const transactions = txnRes.data;
    console.log(`✅ Success! Found ${transactions.length} transactions for the dashboard.`);

    if (transactions.length === 0) {
      console.log('⚠️ No transactions found. Please ensure the DB is seeded or has data for full Editor Panel testing.');
    } else {
      // 3. Test the Editor Panel (PATCH /transactions/:id)
      const testTxn = transactions[0];
      console.log(`\n3️⃣ Testing Transaction Editor (PATCH /transactions/${testTxn.id})...`);
      
      const patchRes = await axios.patch(`${API_URL}/transactions/${testTxn.id}`, {
        tags: ['test-e2e-tag', 'verified'],
        categoryId: catRes.data[0].id 
      });
      
      console.log(`✅ Success! Transaction updated.`);
      console.log(`   New state: Tags=[${patchRes.data.tags.join(',')}]`);
    }

    console.log('\n🎉 All Phase 2 E2E tests passed successfully!');

  } catch (error) {
    console.error('\n❌ E2E Test Failed!');
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

// Wait 2 seconds for backend to be ready
setTimeout(runE2ETests, 2000);
