import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Unauthorized.module.css';

const Unauthorized = () => (
    <div className={styles.block}>
        <h1>403 - Forbidden</h1>
        <p>Your authorization layer does not have permission keys to access this resource block.</p>
        <Link to="/products" className={styles.link}>Return to Product Catalog</Link>
    </div>
);

export default Unauthorized;