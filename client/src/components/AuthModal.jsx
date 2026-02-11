import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * רכיב AuthModal - חלון מודאלי להתחברות והרשמה.
 * כולל מעבר חלק בין מוד התחברות למוד הרשמה.
 */
const AuthModal = ({ isOpen, onClose }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });

    // מניעת גלילה של הדף כשחלון המודאל פתוח
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setError('');
            setMessage('');
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await login(formData.email, formData.password);
                if (result.success) {
                    onClose();
                } else {
                    setError(result.message);
                }
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('הסיסמאות אינן תואמות');
                    setIsLoading(false);
                    return;
                }
                const result = await register({
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName
                });
                if (result.success) {
                    setMessage('נרשמת בהצלחה! כעת ניתן להתחבר');
                    setIsLogin(true);
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('אירעה שגיאה בחיבור לשרת');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container glass animate-in" onClick={e => e.stopPropagation()}>
                {/* כפתור סגירה */}
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-content-wrapper">
                    <div className="auth-tabs">
                        <button
                            className={`tab-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(true)}
                        >
                            התחברות
                        </button>
                        <button
                            className={`tab-btn ${!isLogin ? 'active' : ''}`}
                            onClick={() => setIsLogin(false)}
                        >
                            הרשמה
                        </button>
                        {/* רקע נע לטאבים */}
                        <div className={`tab-slider ${isLogin ? 'at-login' : 'at-register'}`}></div>
                    </div>

                    <div className="auth-header">
                        <h2>{isLogin ? 'ברוכים השבים' : 'מצטרפים לטיסה'}</h2>
                        <p>{isLogin ? 'התחבר כדי לשמור את היעדים שלך' : 'כל הכלים לתכנון עצירה מושלמת מחכים לך'}</p>
                    </div>

                    {error && <div className="auth-error-message">{error}</div>}
                    {message && <div className="auth-success-message">{message}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label>שם מלא</label>
                                <div className="input-with-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="ישראל ישראלי"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>אימייל</label>
                            <div className="input-with-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>סיסמה</label>
                            <div className="input-with-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>אימות סיסמה</label>
                                <div className="input-with-icon">
                                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLogin && (
                            <div className="forgot-password">
                                <a href="#">שכחת סיסמה?</a>
                            </div>
                        )}

                        <button type="submit" className="auth-submit-btn modern" disabled={isLoading}>
                            <span>
                                {isLoading ? (isLogin ? 'מתחבר...' : 'נרשם...') : (isLogin ? 'התחברות מעוררת השראה' : 'צאו לדרך חדשה')}
                            </span>
                            {!isLoading && (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>או התחבר באמצעות</p>
                        <div className="social-login">
                            <button className="social-btn google">
                                <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" width="20" />
                                <span>Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
