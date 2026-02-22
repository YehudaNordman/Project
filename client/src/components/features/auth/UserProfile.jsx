import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../constants';
import '../../../assets/styles/components/auth.css'; // Assuming we can use auth styles or create new ones

const UserProfile = ({ onClose }) => {
    const { user, token, updateUser } = useAuth();
    const [stats, setStats] = useState({ savedTripsCount: 0 });
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newName, setNewName] = useState(user?.fullName || '');
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

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
                updateUser({ fullName: updatedUser.fullName });
                setIsEditingName(false);
                alert("השם עודכן בהצלחה!");
            } else {
                alert("עדכון השם נכשל.");
            }
        } catch (error) {
            console.error("Error updating name:", error);
        }
    };

    // Fetch user stats (number of saved trips)
    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;

            // Try fetching from server first if available
            try {
                // This is a placeholder for a real endpoint. 
                // If it doesn't exist, we fallback to localStorage for demo purposes
                // or we simply count what is in localStorage if that's the primary storage for now.
                // Given the previous code in SavedItinerariesView:
                const localData = JSON.parse(localStorage.getItem('saved_itineraries') || '[]');
                // In a real app, we filter by user ID. Here we might assume local storage is per browser user 
                // or filter if we saved user ID in the trip.
                // Let's assume for now we count whatever is there, or better, 
                // if we have a server endpoint for "get saved routes", we use that.

                // If we want to be accurate with "according to the data in login by the user's email":
                // We should probably ask the server.
                // Assuming we use the local storage count for now as immediate feedback, 
                // but really we should hit an endpoint.

                // Let's try to simulate a fetch or just use local count + server count logic.
                // For this step, I'll count local items as a baseline.
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
                console.error("Error fetching stats", error);
            }
        };

        fetchStats();
    }, [user]);

    if (!user) return null;

    return (
        <div className="profile-overlay animate-in">
            <div className="profile-modal glass">
                <button className="close-profile-btn" onClick={onClose} title="סגור">
                    ✕
                </button>

                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.fullName ? user.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <h2>{user.fullName || 'משתמש יקר'}</h2>
                    <p className="profile-email">{user.email}</p>
                </div>

                <div className="profile-stats">
                    <div className="stat-card glass">
                        <span className="stat-icon">💾</span>
                        <div className="stat-info">
                            <span className="stat-value">{stats.savedTripsCount}</span>
                            <span className="stat-label">מסלולים שמורים</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions-section">
                    <h3>הגדרות חשבון</h3>

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
