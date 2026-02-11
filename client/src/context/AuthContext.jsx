import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('userData');
            if (savedUser && savedUser !== "undefined") {
                return JSON.parse(savedUser);
            }
        } catch (e) {
            console.error("Error parsing userData from localStorage", e);
        }
        return null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && !user) {
            // If we have a token but no user data (e.g. from old version), 
            // we might want to try to fetch it. For now, we'll just keep it minimal.
        }
        setLoading(false);
    }, [token, user]);

    const login = async (email, password) => {
        try {
            const response = await fetch('http://172.20.10.3:3005/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                return { success: true };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'התחברות נכשלה. אנא נסה שוב.' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://172.20.10.3:3005/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                // After register, you might want to auto-login or just redirect to login modal
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'הרשמה נכשלה. אנא נסה שוב.' };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
