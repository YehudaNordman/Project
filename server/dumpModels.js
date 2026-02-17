const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: './Passwords/pass.env' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        const models = response.data.models.map(m => m.name.replace('models/', ''));
        fs.writeFileSync('all_models.txt', models.join('\n'));
        console.log("Done");
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

listModels();
