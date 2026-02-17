const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ננסה מודלים שונים כ-fallback
// ננסה מודלים שונים כ-fallback לפי מה שזמין ב-API
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "gemini-2.5-flash"
];

exports.askAi = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    console.log("-----------------------------------------");
    console.log("🤖 AI REQUEST RECEIVED");
    console.log("-----------------------------------------");

    const promptText = `
אתה מומחה לתכנון טיולים עבור אפליקציית Layover-Hacker. 
המטרה שלך היא לבנות מסלול טיול אופטימלי בזמן עצירת ביניים (Layover).

אלו המקומות שהמשתמש שמר: ${prompt}

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

    let finalAnswer = null;
    let lastError = null;

    // לולאת Fallback על מודלים שונים
    for (const modelName of MODELS) {
      try {
        console.log(`🤖 Attempting with model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptText);
        const response = await result.response;
        finalAnswer = response.text();

        if (finalAnswer) {
          console.log(`✅ AI SUCCESS WITH ${modelName}`);
          break; // הצלחנו! יוצאים מהלולאה
        }
      } catch (err) {
        console.error(`❌ Error with ${modelName}:`, err.message);
        lastError = err;
        // אם זו שגיאת מכסה (429), נמשיך למודל הבא
        continue;
      }
    }

    if (finalAnswer) {
      return res.json({ answer: finalAnswer });
    } else {
      throw lastError || new Error("All models failed to generate content.");
    }

  } catch (error) {
    console.error("❌ FINAL AI ERROR:", error.message);

    let status = 500;
    let message = "אירעה שגיאה בשרת ה-AI.";

    if (error.message && (error.message.includes("429") || error.message.toLowerCase().includes("quota"))) {
      status = 429;
      message = "QUOTA_EXCEEDED: הגענו למכסת הבקשות של גוגל. המתן דקה ונסה שוב.";
    }

    res.status(status).json({
      message: message,
      error: error.message
    });
  }
};