const axios = require('axios');
require('dotenv').config({ path: './Passwords/pass.env' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        const models = response.data.models.map(m => m.name.replace('models/', ''));
        const targets = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-2.0-pro-exp-02-05', 'gemini-pro'];

        console.log("--- Status of Target Models ---");
        targets.forEach(t => {
            console.log(`${t}: ${models.includes(t) ? 'FOUND' : 'NOT FOUND'}`);
        });

        console.log("\n--- All Flash/Pro Models ---");
        models.filter(m => m.includes('flash') || m.includes('pro')).forEach(m => console.log(m));

    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
    }
}

listModels();
