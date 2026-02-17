const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './Passwords/pass.env' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    const modelName = "gemini-1.5-flash-latest";
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`Success with ${modelName}: ` + (await result.response).text());
    } catch (err) {
        console.error(`Error with ${modelName}: ` + err.message);
    }
}
test();
