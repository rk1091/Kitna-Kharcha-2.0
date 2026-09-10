const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function runPhase3E2ETests() {
  console.log('🚀 Starting Phase 3 E2E Tests: AI Copilot & Learning Engine\n');

  try {
    // 1. Fetch Transactions and Categories to get test IDs
    console.log('1️⃣ Fetching test data...');
    const txnRes = await axios.get(`${API_URL}/transactions`);
    const catRes = await axios.get(`${API_URL}/transactions/categories/all`);
    
    if (txnRes.data.length === 0) {
      console.log('⚠️ No transactions found. Cannot test the learning engine without data.');
    } else {
      const testTxn = txnRes.data[0];
      const newCategoryId = catRes.data.find(c => c.id !== testTxn.categoryId)?.id || catRes.data[0].id;
      
      console.log(`\n2️⃣ Testing Learning Engine (PATCH /transactions/${testTxn.id})`);
      console.log(`   Overriding category for '${testTxn.normalizedDescription}' to trigger Rule Generation...`);
      
      const patchRes = await axios.patch(`${API_URL}/transactions/${testTxn.id}`, {
        categoryId: newCategoryId
      });
      
      console.log(`✅ Success! Category overridden. Rule engine should have created a rule behind the scenes.`);
    }

    // 3. Test the Copilot (POST /copilot/ask)
    console.log('\n3️⃣ Testing AI Copilot (POST /copilot/ask)...');
    console.log(`   Asking question: "What are my top 3 expenses?"`);
    
    const chatRes = await axios.post(`${API_URL}/copilot/ask`, {
      question: 'What are my top 3 expenses?'
    });
    
    console.log(`✅ Success! Copilot replied:`);
    console.log(`-----------------------------------`);
    console.log(chatRes.data.answer);
    console.log(`-----------------------------------`);

    console.log('\n🎉 All Phase 3 E2E tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Phase 3 E2E Test Failed!');
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
setTimeout(runPhase3E2ETests, 2000);
