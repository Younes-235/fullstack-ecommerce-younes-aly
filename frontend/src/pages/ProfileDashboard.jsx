import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import styles from './ProfileDashboard.module.css';

const ProfileDashboard = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/users/profile');
                setName(response.data.name || '');
                setEmail(response.data.email || '');
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load profile details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const updatePayload = { name, email };
            if (password) {
                updatePayload.password = password;
            }

            await api.put('/users/profile', updatePayload);
            setSuccess('Profile updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile.');
        }
    };

    if (isLoading) {
        return <div className={styles.loading}>Loading profile data...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles.avatarZone}>
                    <div className={styles.avatar}>{name.charAt(0).toUpperCase() || 'U'}</div>
                    <h3>{name || 'User Profile'}</h3>
                    <p>{email}</p>
                </div>
                <ul className={styles.menu}>
                    <li className={styles.activeItem}>Account Settings</li>
                </ul>
            </div>

            <div className={styles.contentCard}>
                <h2>Account Settings</h2>
                <p className={styles.subtitle}>Update your public info and manage your linked authentication email configuration.</p>
                
                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleUpdateProfile} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <hr className={styles.divider} />
                    <h3>Change Password</h3>
                    <p className={styles.subtitle}>Leave these fields blank if you don't want to change your current password.</p>

                    <div className={styles.formGroup}>
                        <label>New Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Confirm New Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                        />
                    </div>

                    <button type="submit" className={styles.saveBtn}>Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default ProfileDashboard;