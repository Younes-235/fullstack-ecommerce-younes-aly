import React, { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch('http://localhost:5000/api/profile', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({
                            id: payload.id,
                            username: payload.name,
                            email: payload.email,
                            role: payload.role
                        });
                    } else if (response.status === 401) {
                        localStorage.removeItem('token');
                        setUser(null);
                    } else {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({
                            id: payload.id,
                            username: payload.name,
                            email: payload.email,
                            role: payload.role
                        });
                    }
                } catch (error) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({
                            id: payload.id,
                            username: payload.name,
                            email: payload.email,
                            role: payload.role
                        });
                    } catch (e) {
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({
                id: payload.id,
                username: payload.name,
                email: payload.email,
                role: payload.role
            });
        } catch (error) {
            localStorage.removeItem('token');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div>Loading application...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);