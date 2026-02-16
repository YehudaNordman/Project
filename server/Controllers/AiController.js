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

    console.log(prompt);
    
    const promptText = `
אתה מומחה לתכנון טיולים עבור אפליקציית Layover-Hacker. 
המטרה שלך היא לבנות מסלול טיול אופטימלי בזמן עצירת ביניים (Layover).

אלו המקומות שהמשתמש שמר זמני השהייה: ${prompt}

דגשים לבניית המסלול:
1. סדר לוגי: התחל בנקודת המוצא (שדה התעופה), סדר את האטרקציות לפי המרחק הגאוגרפי ביניהן, וסיים בחזרה לשדה התעופה.
2. ניהול זמן: כלול שעות מדויקות לכל פעילות. חשב זמן נסיעה משוער (בצורה הגיונית) בין כל נקודה לנקודה.
3. המלצות קולינריות: ליד כל אטרקציה, הצע מסעדה מקומית מומלצת שמתאימה ללו"ז.
4. פורמט פלט: החזר קוד HTML נקי בלבד (בלי סימני Markdown של קוד).
   - השתמש ב-<h3> עבור כותרות המקומות.
   - השתמש ב-<strong> עבור השעות וזמני הנסיעה.
   - השתמש ב-<ul> ו-<li> עבור תיאורים והמלצות.

מבנה כל תחנה במסלול:
- שעה (למשל 10:00 - 12:00)
- שם המקום + תיאור קצר למה כדאי לבקר.
- זמן נסיעה משוער לנקודה הבאה.
- המלצה על מסעדה קרובה.
`;
    const result = await model.generateContent(promptText);
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