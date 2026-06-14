require('dotenv').config();
const User = require('./models/User'); 
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const ChatSession = require('./models/ChatSession');

// --- 1. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

const app = express();
app.use(cors({
    origin: "*", 
    methods: ['GET', 'POST']
}));
app.use(express.json());

// --- 2. AI CONFIGURATION ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Inside server.js
const aquahTools = [
  {
    functionDeclarations: [
      {
        name: "get_crop_advisory",
        description: "Fetch real-time crop recommendations and flood risk for the Jhelum basin based on soil type and water level.",
        parameters: {
          type: "OBJECT",
          properties: {
             soilType: { 
                 type: "STRING", 
                 description: "The type of soil in the field. Default for Kashmir: Loamy Soil" 
             },
             waterLevel: { 
                 type: "STRING", 
                 description: "Optional. The ML hydrology model will calculate this dynamically if not provided." 
             }
          },
          required: ["soilType"]
        }
      }
    ]
  }
];
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: aquahTools,
    generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
    },
    systemInstruction: `You are AQUAH-CC, a strict, physics-guided agricultural AI for the Jhelum River Basin. 
    
    RULE 1: This app is specifically designed for the Kashmir Jhelum Basin. Soil type comes from the user's saved Farm Profile, or defaults to "Loamy Soil". 
    RULE 2: Water level is NOT provided by the user. It is calculated dynamically by the ML hydrology model based on real-time Jhelum basin data.
    RULE 3: NEVER ask the user for soil type or water level. Use their saved profile soil (or default "Loamy Soil") and pass any water level value — the API will override it with real calculated data.
    RULE 4: Call the get_crop_advisory tool immediately when the user asks about crops.
    RULE 5: When providing crop recommendations, NEVER use a plain comma-separated list. Use a clean, bulleted Markdown format.
    RULE 6: Highlight the #1 TOP recommended crop in bold, and briefly explain WHY it is recommended based on the user's soil, water level, and the API's reasoning note. Include any constraints they need to watch out for.
    RULE 7: After receiving data from the get_crop_advisory tool, you MUST ALWAYS generate a conversational text response. Never return an empty response.`
});
// --- 3. HELPER FUNCTIONS ---

async function fetchPythonAdvisory(soilType, waterLevel) {
    console.log(`[AQUAH-PINN] Fetching Full Report for soil: ${soilType}...`);

    try {
        const baseUrl = process.env.PYTHON_API_URL; 
        if (!baseUrl) throw new Error("PYTHON_API_URL is missing from .env file!");

        // /full_report is a master endpoint — no query params needed
        const url = `${baseUrl}/full_report`;
        console.log(`[AQUAH-PINN] Calling: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`API status: ${response.status}`);

        const data = await response.json();
        console.log(`[AQUAH-PINN] Raw response keys:`, Object.keys(data));
        console.log(`[AQUAH-PINN] Hydrology:`, data.hydrology ? 'present' : 'missing', `forecast length:`, data.hydrology?.forecast?.length || 0);

        // --- Extract the best crops from the nested seasons ---
        let topCrops = [];
        let cropReasoning = "Based on current real-time data.";

        if (data.agriculture) {
            for (const season in data.agriculture) {
                const crops = data.agriculture[season];
                for (const cropName in crops) {
                    if (crops[cropName].rating === "Excellent" || crops[cropName].score >= 80) {
                        topCrops.push(cropName);
                        if (cropReasoning === "Based on current real-time data.") {
                            cropReasoning = `${cropName} is recommended: ${crops[cropName].note}`;
                        }
                    }
                }
            }
        }

        if (topCrops.length === 0) {
            topCrops = ["Consult Agronomist"];
        }

        const result = { 
            flood_risk: data.hydrology?.flood_risk || "UNKNOWN",
            recommended_crops: topCrops,
            reasoning: cropReasoning,
            forecast: data.hydrology?.forecast || [],
            avg_flow: data.hydrology?.avg_flow_m3s,
            max_flow: data.hydrology?.max_flow_m3s,
            soil: data.soil,
            temperature: data.meteorology?.avg_temp_c,
            location: data.location
        };
        
        console.log(`[AQUAH-PINN] Returning widgetData with forecast length:`, result.forecast.length);
        return result;

    } catch (error) {
        console.error("[AQUAH-PINN] CONNECTION FAILED:", error.message);
        return { 
            flood_risk: "SYSTEM OFFLINE",
            recommended_crops: ["N/A"],
            reasoning: "The AQUAH-CC Hydrology Engine is currently unreachable.",
            forecast: [],
            avg_flow: null,
            max_flow: null,
            soil: null,
            temperature: null,
            location: null
        };
    }
}



// NEW: The Auto-Retry Logic for Gemini
async function sendMessageWithRetry(chat, payload, maxRetries = 3) {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await chat.sendMessage(payload); // If it works, instantly return the result
        } catch (error) {
            // Check if it's a server overload (503) or rate limit (429)
            if (error.status === 503 || error.status === 429) {
                attempt++;
                console.log(`[Warning] Gemini API busy (Error ${error.status}). Retrying attempt ${attempt}...`);
                
                if (attempt >= maxRetries) {
                    throw error; // If we tried 3 times and it still failed, crash gracefully
                }
                
                // Exponential Backoff: Wait 2s, then 4s, then 6s before trying again
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            } else {
                throw error; // If it's a different error (like a bad API key), crash immediately
            }
        }
    }
}

// --- 4. ROUTES ---

// Health Check
app.get('/', (req, res) => {
    res.send("AQUAH-CC Node.js Backend is running perfectly!");
});

// Full Report endpoint — used by the Hydrology and Crops tabs
app.get('/api/report', async (req, res) => {
    try {
        const baseUrl = process.env.PYTHON_API_URL;
        if (!baseUrl) throw new Error("PYTHON_API_URL missing from .env");

        const response = await fetch(`${baseUrl}/full_report`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`Python API status: ${response.status}`);

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("[AQUAH] /api/report failed:", error.message);
        res.status(503).json({ error: "Hydrology engine unreachable" });
    }
});

// MEMORY ROUTE: Fetch chat history on page load 
app.get('/api/chat/:sessionId', async (req, res) => {
    try {
        const chatSession = await ChatSession.findOne({ sessionId: req.params.sessionId });
        if (!chatSession) {
            return res.status(404).json({ error: "Session not found" });
        }
        res.json({ messages: chatSession.messages });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

//  Save or Update User Profile ---
app.post('/api/user', async (req, res) => {
    const { uid, email, name, soilType, waterLevel } = req.body;
    try {
        console.log(`Saving profile for ${email}: Soil=${soilType}, Water=${waterLevel}`);
        
        // This is a magic Mongoose function: 'findOneAndUpdate'
        // If the user exists, it updates them. If they don't exist, it creates them!
        const user = await User.findOneAndUpdate(
            { uid: uid },
            { 
                email: email, 
                name: name, 
                'farmDetails.soilType': soilType,
                'farmDetails.waterLevel': waterLevel
            },
            { returnDocument: 'after', upsert: true } // Upsert = Update or Insert
        );

        console.log('Profile saved successfully:', user);
        res.json(user);
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({ error: "Failed to save profile data." });
    }
});

// CHAT ROUTE: Handle new messages and AI logic
app.post('/api/chat', async (req, res) => {
    // --- UPDATED: Extract the 'uid' and 'originalMessage' sent from React ---
    const { message, originalMessage, sessionId, uid } = req.body;

    try {
        // Generate a new sessionId if not provided
        const currentSessionId = sessionId || require('crypto').randomBytes(16).toString('hex');
        
        // Fetch or create chat session from MongoDB
        let chatSession = await ChatSession.findOne({ sessionId: currentSessionId });
        
        // Build chat history for Gemini
        let history = [];
        if (chatSession) {
            history = chatSession.messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));
        }

        // Start chat with history
        const chat = model.startChat({ history });

        // ==========================================
        // --- NEW LOGIC: THE MEMORY INJECTION ---
        // ==========================================
        let finalMessageToGemini = message; // Default to just the user's message

        // If the frontend sent a user ID, look up their profile in the database
        let profileSoil = null;
        
        if (uid) {
            const userProfile = await User.findOne({ uid: uid });
            if (userProfile && userProfile.farmDetails) {
                profileSoil = userProfile.farmDetails.soilType;
            }
        }
        
        // Use saved profile soil OR Kashmir default. Water level is calculated by the ML model, not provided here.
        const finalSoil = profileSoil || 'Loamy Soil';
        
        console.log(`[AQUAH-CC] Using soil=${finalSoil} (profile=${!!profileSoil}). Water level will be calculated by ML model.`);
        
        finalMessageToGemini = `${message} 
                    
        [SECRET SYSTEM CONTEXT: The user's soil type is: ${finalSoil}. Water level is calculated dynamically by the ML hydrology model based on real-time Jhelum basin data — you do NOT need to provide it. Use the soil type and call the get_crop_advisory tool immediately if they ask about crops. The API will return the actual calculated water level and flood risk.]`;
        // ==========================================
        
        // --- UPDATED: Pass 'finalMessageToGemini' instead of just 'message' ---
        let result = await sendMessageWithRetry(chat, finalMessageToGemini);
        let response = result.response;

        // Create a variable to hold the raw data for the frontend charts
        let rawWidgetData = null;

        // Check if Gemini decided it needs to use the tool
        const functionCalls = response.functionCalls();
        
        if (functionCalls && functionCalls.length > 0) {
            console.log("[AQUAH-CC] Gemini requested function call:", functionCalls.map(c => c.name));
            const call = functionCalls[0];
            if (call.name === "get_crop_advisory") {
                // Extract what Gemini understood from the user
                const { soilType, waterLevel = 'Moderate' } = call.args;
                
                if (!soilType) {
                    throw new Error("Gemini called get_crop_advisory without soilType");
                }
                
                // Execute your Python API
                const apiData = await fetchPythonAdvisory(soilType, waterLevel);
                
                // SAVE a copy of the data for the React Frontend!
                rawWidgetData = apiData;

                // --- Use the Auto-Retry wrapper for the tool response ---
                result = await sendMessageWithRetry(chat, [{
                    functionResponse: {
                        name: "get_crop_advisory",
                        response: apiData
                    }
                }]);
                
                response = result.response;
            }
        }

        // Extract text safely - AI might return empty or function-only responses
        let reply = '';
        try {
            reply = response.text();
            console.log("[AQUAH-CC] AI generated reply:", reply.substring(0, 100) + "...");
        } catch (textError) {
            console.warn("[AQUAH-CC] response.text() failed:", textError.message);
            // If text() fails, check if there are function calls that weren't handled
            const remainingCalls = response.functionCalls();
            if (remainingCalls) {
                console.warn("[AQUAH-CC] Unhandled function calls in response:", remainingCalls.map(c => c.name));
            }
        }

        // Save messages to MongoDB
        if (!chatSession) {
            chatSession = new ChatSession({
                sessionId: currentSessionId,
                messages: []
            });
        }

        // --- CRITICAL: We save the clean originalMessage, NOT the modified prompt with system directives ---
        const messageToSave = originalMessage || message;
        const safeMessage = messageToSave && messageToSave.trim() ? messageToSave.trim() : '[No text provided]';
        const safeReply = reply && reply.trim() ? reply.trim() : 'Sorry, I could not generate a response.';
        chatSession.messages.push({ role: 'user', content: safeMessage });
        chatSession.messages.push({ role: 'model', content: safeReply, widgetData: rawWidgetData });
        await chatSession.save();

        // Send the text AND the raw mathematical data back to React
        res.json({ 
            reply: safeReply, 
            sessionId: currentSessionId,
            widgetData: rawWidgetData 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process the request" });
    }
});
// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`AQUAH-CC running on port ${PORT}`);
});