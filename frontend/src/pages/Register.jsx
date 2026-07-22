import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';
import styles from './Register.module.css';

const Register = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/register', { name, email, password, role });
            
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            queryClient.invalidateQueries({ queryKey: ['users'] });

            setSuccess('Account registered successfully! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        }
    };

    return (
        <div className={styles.card}>
            <h2>Create Account</h2>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                />
                
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Create Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                />
                
                <select value={role} onChange={e => setRole(e.target.value)}>
                    <option value="user">Standard Customer</option>
                    <option value="admin">Store Administrator</option>
                </select>

                <button type="submit">Register Account</button>
            </form>

            <div className={styles.switchLink}>
                Already have an account? <Link to="/login">Sign In</Link>
            </div>
        </div>
    );
};

export default Register;