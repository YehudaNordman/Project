import React, { createContext, useState, useContext, useEffect } from 'react';

// יצירת ה-Context לניהול המסלול הנבחר של המשתמש ברמה הגלובלית
const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
    // אתחול המצב (State) של המסלול מתוך ה-sessionStorage כדי לשמור נתונים ברענון דף
    const [myRoute, setMyRoute] = useState(() => {
        try {
            const saved = sessionStorage.getItem('userRoute');
            if (saved && saved !== "undefined") {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("שגיאה בקריאת המסלול מהזיכרון הזמני", e);
        }
        return [];
    });

    // עדכון ה-sessionStorage בכל פעם שהמסלול משתנה
    useEffect(() => {
        sessionStorage.setItem('userRoute', JSON.stringify(myRoute));
    }, [myRoute]);

    // פונקציה להוספת אטרקציה למסלול תוך מניעת כפילויות
    const addToRoute = (item) => {
        setMyRoute((prev) => {
            const exists = prev.find(i => (i.place_id && i.place_id === item.place_id) || i.name === item.name);
            if (exists) return prev; // אם כבר קיים, לא מוסיפים שוב
            return [...prev, item];
        });
    };

    // פונקציה להסרת אטרקציה מהמסלול לפי מזהה או שם
    const removeFromRoute = (itemId) => {
        setMyRoute((prev) => prev.filter(item => (item.place_id || item.name) !== itemId));
    };

    // פונקציה לניקוי כל המסלול (למשל אחרי שמירה או יציאה)
    const clearRoute = () => {
        setMyRoute([]);
    };

    return (
        // אספקת הנתונים והפונקציות לכל הקומפוננטות בתוך ה-Provider
        <RouteContext.Provider value={{ myRoute, addToRoute, removeFromRoute, clearRoute }}>
            {children}
        </RouteContext.Provider>
    );
};

// Hook מותאם אישית לשימוש קל בנתוני המסלול בכל מקום באפליקציה
export const useRoute = () => {
    const context = useContext(RouteContext);
    if (!context) {
        throw new Error('useRoute must be used within a RouteProvider');
    }
    return context;
};
