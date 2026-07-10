import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from "./Home.module.css";

const Home = () => {
    const navigate = useNavigate();
    return (
        <div className={styles.hero}>
            <h1>Welcome to SwiftShop</h1>
            <p>Discover our curated collection of premium tech items, high-performance components, 
                and modern electronics accessories. Built for creators, developers, and power users.</p>
            <button className={styles.ctaButton} onClick={() => navigate("/products")}>
                Explore Products Now →
            </button>
        </div>
    )
}

export default Home;