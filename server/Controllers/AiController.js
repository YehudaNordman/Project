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

אלו המקומות שהמשתמש שמר וזמני השהייה: ${prompt}

הנחיות לבניית המסלול:
1. סדר לוגי: התחל בנקודת המוצא (שדה התעופה), סדר את האטרקציות לפי המרחק הגאוגרפי ביניהן, וסיים בחזרה לשדה התעופה.
2. ניהול זמן: כלול שעות מדויקות לכל פעילות. חשב זמן נסיעה משוער (בצורה הגיונית) בין כל נקודה לנקודה.
3. המלצות קולינריות: ליד כל אטרקציה, הצע מסעדה מקומית מומלצת שמתאימה ללו"ז.

פורמט פלט חובה:
החזר אך ורק אובייקט JSON תקין. אל תוסיף טקסט חופשי, הסברים או סימני Markdown (כמו json). 
הפלט חייב להיות מערך של אובייקטים בתוך מפתח שנקרא "itinerary".

מבנה כל אובייקט ב-JSON (הקפד על שמות המפתחות האלו):
{
  "title": "שם האטרקציה והמיקום",
  "hours": "שעות הפעילות (למשל 10:00 - 12:00)",
  "description": "תיאור קצר למה כדאי לבקר",
  "transport": "כמה זמן נסיעה מהשדה תעופה/מהאטרקציה הקודמת",
  "food": "המלצה על מסעדה קרובה"
}
`;
    const result = await model.generateContent(promptText);
    const response = await result.response;
    let text = response.text();

    // Enhanced cleaning: Extract only the content between the first { and the last }
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }

    res.json({ answer: text });

  } catch (error) {
    console.error("❌ AI Error Details:", error);
    res.status(500).json({
      message: "Failed to generate AI response",
      error: error.message
    });
  }
};