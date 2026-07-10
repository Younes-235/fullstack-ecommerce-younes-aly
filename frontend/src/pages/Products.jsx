import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../AuthContext';
import styles from './Products.module.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1 });
    const { user } = useAuth();
    
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.get('/products/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Could not fetch database categories", err));
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = new URLSearchParams({
                    page,
                    limit: 8,
                    sortBy,
                    order,
                    ...(search && { search }),
                    ...(category && { category }),
                    ...(minPrice && { minPrice }),
                    ...(maxPrice && { maxPrice }),
                });

                const response = await api.get(`/products?${params.toString()}`);
                setProducts(response.data.data);
                setMeta(response.data.meta);
            } catch (error) {
                console.error("Error loading catalogue items:", error);
            }
        };
        fetchProducts();
    }, [search, category, minPrice, maxPrice, sortBy, order, page]);

    const handleAddToCart = async (productId) => {
        if (!user) {
            alert("Please sign in to add items to your cart!");
            return;
        }
        try {
            await api.post('/cart', { productId, quantity: 1 });
            alert("Item added to cart successfully!");
        } catch (error) {
            alert(error.response?.data?.error || "Could not add item to cart.");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.filterBar}>
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className={styles.searchInput}
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                />

                <select className={styles.selectInput} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <div className={styles.priceInputs}>
                    <input 
                        type="number" 
                        placeholder="Min $" 
                        value={minPrice} 
                        onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} 
                    />
                    <input 
                        type="number" 
                        placeholder="Max $" 
                        value={maxPrice} 
                        onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} 
                    />
                </div>

                <select className={styles.selectInput} value={`${sortBy}-${order}`} onChange={(e) => {
                    const [field, dir] = e.target.value.split('-');
                    setSortBy(field);
                    setOrder(dir);
                }}>
                    <option value="createdAt-desc">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>

            <div className={styles.grid}>
                {products.map(product => (
                    <div key={product.id} className={styles.card}>
                        <div className={styles.imagePlaceholder}>
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                            ) : (
                                <span className={styles.noImgText}>No Image</span>
                            )}
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeaderRow}>
                                <span className={styles.categoryBadge}>{product.category}</span>
                                {/* 📦 ADDED: Live stock levels visible on layout */}
                                <span className={`${styles.stockIndicator} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                    {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                                </span>
                            </div>
                            <h4 className={styles.productName}>{product.name}</h4>
                            <p className={styles.productDesc}>{product.description}</p>
                            <div className={styles.cardFooter}>
                                <span className={styles.price}>${product.price.toFixed(2)}</span>
                                <button 
                                    className={styles.addToCartButton}
                                    onClick={() => handleAddToCart(product.id)}
                                    disabled={product.stock <= 0}
                                >
                                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.pagination}>
                <button 
                    disabled={page === 1} 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className={styles.pagButton}
                >
                    &larr; Prev
                </button>
                <span className={styles.pagInfo}>Page {meta.currentPage} of {meta.totalPages}</span>
                <button 
                    disabled={page === meta.totalPages} 
                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPages))}
                    className={styles.pagButton}
                >
                    Next &rarr;
                </button>
            </div>
        </div>
    );
};

export default Products;