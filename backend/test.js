const axios = require('axios');

async function runTest() {
    let sessionId = null;

    console.log("=== TEST 1: First message (no sessionId) ===");
    try {
        const response1 = await axios.post('http://localhost:5000/api/chat', {
            message: "I have loamy soil and the water level is High. What should I plant next week?"
        });
        
        sessionId = response1.data.sessionId;
        console.log("Session ID:", sessionId);
        console.log("\n--- AI AGENT REPLY 1 ---");
        console.log(response1.data.reply);
        console.log("----------------------\n");
    } catch (error) {
        console.error("Test 1 failed:", error.response ? error.response.data : error.message);
        return;
    }

    console.log("=== TEST 2: Second message (with sessionId for context) ===");
    try {
        const response2 = await axios.post('http://localhost:5000/api/chat', {
            message: "What if the water level becomes Low instead?",
            sessionId: sessionId
        });
        
        console.log("Session ID:", response2.data.sessionId);
        console.log("\n--- AI AGENT REPLY 2 ---");
        console.log(response2.data.reply);
        console.log("----------------------\n");
    } catch (error) {
        console.error("Test 2 failed:", error.response ? error.response.data : error.message);
    }
}

runTest();