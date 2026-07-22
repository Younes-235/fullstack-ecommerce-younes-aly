import React, { useState } from 'react';
import { useAuth } from "../AuthContext";
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import styles from "./Login.module.css";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post("/login", { email, password });
            localStorage.setItem('token', response.data.token);
            login(response.data.token);
            navigate("/products");
        } catch (err) {
            const message = err.response?.data?.error || err.response?.data?.message || "Invalid credentials";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.card}>
            <h2>Account Login</h2>
            {error && <div className={styles.error}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
};

export default Login;