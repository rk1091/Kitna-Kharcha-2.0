const axios = require('axios');

async function testCopilot() {
  const url = 'http://localhost:3001/copilot/ask';
  
  console.log('🧪 Testing NLP & Tool Calling Integration...\n');

  const questions = [
    "What is the breakdown of my spending by category?",
    "Did I spend anything on Swiggy?",
    "Are there any unusual or massive expenses?"
  ];

  for (const q of questions) {
    console.log(`\n🗣️  User: "${q}"`);
    try {
      const res = await axios.post(url, { question: q });
      console.log(`🤖 Copilot: ${res.data.answer}`);
    } catch (e) {
      console.error(`❌ Error:`, e.response ? e.response.data : e.message);
    }
  }
}

testCopilot();
