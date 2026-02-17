const axios = require('axios');
require('dotenv').config({ path: './Passwords/pass.env' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log(JSON.stringify(response.data.models.map(m => m.name), null, 2));
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

listModels();
