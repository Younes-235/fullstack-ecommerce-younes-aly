import React, { useState } from 'react';
import api from '../api/axios.js';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
    const [form, setForm] = useState({ name: '', description: '', price: '', category: '', stock: '' });
    const [imageFile, setImageFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(''); 
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('price', parseFloat(form.price));
            formData.append('category', form.category);
            formData.append('stock', parseInt(form.stock));
            
            if (imageFile) {
                formData.append('image', imageFile); 
            }

            await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', 
                },
            });

            setStatus('Product published successfully!');
            setForm({ name: '', description: '', price: '', category: '', stock: '' });
            setImageFile(null);
            setPreviewUrl('');
        } catch (err) {
            setStatus(err.response?.data?.error || 'Failed to authorize product publishing.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <h2>Admin Product Creation</h2>
            {status && <div className={styles.status}>{status}</div>}
            
            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="text" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                <input type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
                <input type="number" placeholder="Inventory Units Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                
                <div className={styles.fileUploadContainer}>
                    <label htmlFor="product-image" className={styles.fileLabel}>
                        Choose Product Image
                    </label>
                    <input 
                        id="product-image"
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className={styles.fileInput}
                    />
                </div>

                {previewUrl && (
                    <div className={styles.previewWrapper}>
                        <p>Selected Image Preview:</p>
                        <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                    </div>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Publishing & Uploading...' : 'Publish Listing'}
                </button>
            </form>
        </div>
    );
};

export default AdminPanel;