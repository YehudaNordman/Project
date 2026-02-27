import React, { useState } from 'react';
import loadingGif from '../assets/Loading 40 _ Paperplane.gif';

const Ai = ({ times, myRoute }) => {
    const [aiInfo, setAi] = useState("");
    const [loading, setLoading] = useState(false);

    const aiFetch = async () => {
        if (!myRoute || myRoute.length === 0) {
            setAi("אנא בחר לפחות אטרקציה אחת כדי שאוכל לבנות לך מסלול.");
            return;
        }

        setLoading(true);
        setAi(""); // ניקוי תשובה קודמת

        // הפרומפט המשופר שלנו
        const promptText = `
        מקומות לביקור: ${myRoute.map(item => item.name).join(", ")}.
        זמנים מבוקשים: ${JSON.stringify(times)}.
        `;

        try {
            const response = await fetch('http://localhost:3005/ai/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText }),
            });

            const data = await response.json();
            let aiContent = data.answer || data;

            // ניקוי תגיות Markdown אם ה-AI הוסיף אותן
            if (typeof aiContent === 'string') {
                aiContent = aiContent.replace(/```html|```/g, '').trim();
            }

            setAi(aiContent);
        } catch (e) {
            console.error("Error in AI Fetch:", e);
            setAi("<p style='color: #e74c3c;'>חלה שגיאה בחיבור לשרת ה-AI. נסה שוב מאוחר יותר.</p>");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            {/* כפתור הפעלה */}
            <button 
                onClick={aiFetch} 
                disabled={loading} 
                style={{...styles.button, ...(loading ? styles.buttonDisabled : {})}}
            >
            </button>

            {/* תצוגת התוצאה */}
            {aiInfo && (
                <div style={styles.responseCard}>
                    <h2 style={styles.cardTitle}>המסלול המומלץ שלך:</h2>
                    <div 
                        className="ai-content"
                        style={styles.htmlContent}
                        dangerouslySetInnerHTML={{ __html: aiInfo }} 
                    />
                </div>
            )}
        </div>
    );
};

// עיצוב בסיסי כדי שהכל ייראה נקי
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
        direction: 'rtl'
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 24px',
        minWidth: '220px',
        minHeight: '56px',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: '#3498db',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, background-color 0.2s'
    },
    buttonDisabled: {
        backgroundColor: '#95a5a6',
        cursor: 'not-allowed'
    },
    loadingImg: {
        width: '36px',
        height: '36px',
        objectFit: 'contain'
    },
    responseCard: {
        width: '100%',
        maxWidth: '700px',
        backgroundColor: '#fff',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
        border: '1px solid #eee',
        lineHeight: '1.6'
    },
    cardTitle: {
        color: '#2c3e50',
        borderBottom: '2px solid #3498db',
        paddingBottom: '10px',
        marginBottom: '20px'
    },
    htmlContent: {
        textAlign: 'right',
        color: '#34495e'
    }
};

export default Ai;