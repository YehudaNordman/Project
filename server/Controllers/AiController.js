const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ הנה השם הנכון מתוך הרשימה ששלחת
const MODEL_NAME = "gemini-2.5-flash"; 

const model = genAI.getGenerativeModel({ model: MODEL_NAME });

exports.askAi = async (req, res) => {
  try {
    console.log("🤖 Asking Gemini Model:", MODEL_NAME); 
    
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ answer: text });

  } catch (error) {
    console.error("❌ AI Error Details:", error);
    res.status(500).json({ 
        message: "Failed to generate AI response", 
        error: error.message 
    });
  }
};