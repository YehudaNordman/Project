const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './Passwords/pass.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const result = await genAI.listModels();
        console.log("--- Available Models ---");
        result.models.forEach(model => {
            console.log(`${model.name} (${model.displayName}) - Methods: ${model.supportedMethods.join(', ')}`);
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
