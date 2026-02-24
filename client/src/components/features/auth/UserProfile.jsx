import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../constants';
import '../../../assets/styles/components/auth.css';

/**
 * רכיב UserProfile - מציג את אזור הפרופיל האישי של המשתמש.
 * כולל נתונים סטטיסטיים (כמות מסלולים) ואפשרות לעריכת פרטים אישיים.
 */
const UserProfile = ({ onClose }) => {
    const { user, token, updateUser } = useAuth();
    // מצבי עריכה לשדות השונים
    const [stats, setStats] = useState({ savedTripsCount: 0 });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    // ניהול טפסים לעדכון הנתונים
    const [newName, setNewName] = useState(user?.fullName || '');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    /**
     * עדכון שם המשתמש מול השרת
     */
    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        try {
            const response = await fetch(`${API_BASE_URL}/user/update-me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ fullName: newName })
            });
            if (response.ok) {
                const updatedUser = await response.json();
                // עדכון ה-State הגלובלי (Context)
                updateUser({ fullName: updatedUser.fullName });
                setIsEditingName(false);
                alert("השם עודכן בהצלחה!");
            } else {
                alert("עדכון השם נכשל.");
            }
        } catch (error) {
            console.error("שגיאה בעדכון השם:", error);
        }
    };

    /**
     * טעינת סטטיסטיקות המשתמש מהשרת בעת טעינת הרכיב
     */
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            try {
                const response = await fetch(`${API_BASE_URL}/user/my-itineraries`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats({ savedTripsCount: data.length });
                }
            } catch (error) {
                console.error("שגיאה בטעינת סטטיסטיקות:", error);
            }
        };

        fetchStats();
    }, [user, token]);

    if (!user) return null;

    return (
        <div className="profile-overlay animate-in">
            <div className="profile-modal glass">
                {/* כפתור סגירה של המודאל */}
                <button className="close-profile-btn" onClick={onClose} title="סגור">
                    ✕
                </button>

                {/* כותרת הפרופיל עם אווטאר (האות הראשונה של השם) */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <h2>{user.fullName || 'משתמש יקר'}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>

                {/* כרטיסיות נתונים (סטטיסטיקה של פעילות המשתמש) */}
                <div className="profile-stats">
                    <div className="stat-card glass">
                        <span className="stat-icon">💾</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.savedTripsCount}</span>
                            <span className="stat-label">מסלולים שמורים</span>
                        </div>
                    </div>
                </div>

                {/* הגדרות חשבון - שינוי פרטים אישיים */}
                <div className="profile-actions-section">
                    <h3>הגדרות חשבון</h3>

                    {/* שדה שם מלא */}
                    <div className="action-row">
                        <div className="field-info">
                            <label>שם מלא</label>
                            <span>{user.fullName}</span>
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditingName(!isEditingName)}>
                            ✏️ שינוי שם
                        </button>
                    </div>
                    {isEditingName && (
                        <div className="edit-form animate-in">
                            <input
                                type="text"
                                placeholder="שם חדש"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                            />
                            <button className="save-btn" onClick={handleUpdateName}>עדכן שם</button>
                        </div>
                    )}

                    {/* שדה אימייל */}
                    <div className="action-row">
                        <div className="field-info">
                            <label>כתובת אימייל</label>
                            <span>{user.email}</span>
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditingEmail(!isEditingEmail)}>
                            ✏️ שינוי אימייל
                        </button>
                    </div>
                    {isEditingEmail && (
                        <div className="edit-form animate-in">
                            <input
                                type="email"
                                placeholder="אימייל חדש"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <button className="save-btn">עדכן אימייל</button>
                        </div>
                    )}

                    {/* שדה סיסמה */}
                    <div className="action-row">
                        <div className="field-info">
                            <label>סיסמה</label>
                            <span>********</span>
                        </div>
                        <button className="edit-btn" onClick={() => setIsEditingPassword(!isEditingPassword)}>
                            🔒 שינוי סיסמה
                        </button>
                    </div>
                    {isEditingPassword && (
                        <div className="edit-form animate-in">
                            <input
                                type="password"
                                placeholder="סיסמה נוכחית"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="סיסמה חדשה"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button className="save-btn">עדכן סיסמה</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
