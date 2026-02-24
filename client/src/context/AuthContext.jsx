import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

// יצירת הקשר (Context) לניהול אימות משתמשים (Authentication)
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // טעינת פרטי המשתמש מה-localStorage בעת עליית האפליקציה (Persistence)
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('userData');
            if (savedUser && savedUser !== "undefined") {
                return JSON.parse(savedUser);
            }
        } catch (e) {
            console.error("שגיאה בקריאת נתוני משתמש מה-localStorage", e);
        }
        return null;
    });

    // טעינת ה-Token לזיהוי המשתמש מול השרת
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // מצב לניהול פתיחה וסגירה של חלון ההתחברות (Modal) מכל מקום באתר
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMessage, setAuthModalMessage] = useState('');

    useEffect(() => {
        setLoading(false);
    }, [token, user]);

    // פונקציה לפתיחת חלון האימות עם הודעה מותאמת אישית (למשל: "התחבר כדי לשמור מסלול")
    const openAuthModal = (message = '') => {
        setAuthModalMessage(message);
        setIsAuthModalOpen(true);
    };

    // פונקציה לסגירת חלון האימות
    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
        setAuthModalMessage('');
    };

    /**
     * פונקציית התחברות (Login)
     * שולחת אימייל וסיסמה לשרת ומקבלת Token ופרטי משתמש
     */
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // שמירת הנתונים ב-State וב-Storage כדי שהמשתמש יישאר מחובר גם ברענון
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                closeAuthModal();
                return { success: true };
            } else {
                return { success: false, message: data.message || 'התחברות נכשלה' };
            }
        } catch (error) {
            console.error('שגיאת התחברות:', error);
            return { success: false, message: 'התחברות נכשלה. אנא נסה שוב.' };
        }
    };

    /**
     * פונקציית הרשמה (Register)
     * יוצרת משתמש חדש במערכת
     */
    const register = async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'הרשמה נכשלה' };
            }
        } catch (error) {
            console.error('שגיאת הרשמה:', error);
            return { success: false, message: 'הרשמה נכשלה. אנא נסה שוב.' };
        }
    };

    /**
     * פונקציית איפוס/עדכון סיסמה
     */
    const resetPassword = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'איפוס סיסמה נכשל' };
            }
        } catch (error) {
            console.error('שגיאת איפוס סיסמה:', error);
            return { success: false, message: 'עדכון הסיסמה נכשל. אנא נסה שוב.' };
        }
    };

    /**
     * פונקציית התנתקות (Logout)
     * מנקה את כל הנתונים מהזיכרון ומפנה לדף הבית
     */
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    };

    // פונקציה לעדכון פרטי המשתמש (למשל שינוי שם) ללא צורך בהתחברות מחדש
    const updateUser = (newUserData) => {
        const updatedUser = { ...user, ...newUserData };
        setUser(updatedUser);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            resetPassword,
            logout,
            updateUser,
            isAuthModalOpen,
            authModalMessage,
            openAuthModal,
            closeAuthModal
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook מותאם אישית לשימוש בנתוני המשתמש והאימות בכל האתר
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
