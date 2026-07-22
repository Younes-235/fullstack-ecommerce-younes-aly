import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../AuthContext';
import { useNavigate } from "react-router-dom";
import styles from './Products.module.css';

const Products = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(1);

    const [editingProductId, setEditingProductId] = useState(null);
    const [stockInput, setStockInput] = useState('');
    
    // Track which specific product ID is currently adding to cart
    const [addingProductId, setAddingProductId] = useState(null);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/products/categories');
            return res.data;
        }
    });

    const { data: cart } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await api.get("/cart");
            return res.data;
        },
        enabled: !!user
    });

    const { data, isLoading } = useQuery({
        queryKey: ['products', { page, search, category, minPrice, maxPrice, sortBy, order }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page, limit: 8, sortBy, order,
                ...(search && { search }),
                ...(category && { category }),
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
            });
            const res = await api.get(`/products?${params.toString()}`);
            return res.data;
        }
    });

    const addToCartMutation = useMutation({
        mutationFn: async (productId) => {
            const res = await api.post('/cart', { productId, quantity: 1 });
            return res.data;
        },
        onSuccess: () => {
            alert("Item added to cart successfully!");
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Could not add item to cart.");
        },
        onSettled: () => {
            setAddingProductId(null); 
        }
    });

    const updateStockMutation = useMutation({
        mutationFn: async ({ productId, stock }) => {
            const res = await api.patch(`/products/${productId}`, { stock: Number(stock) });
            return res.data;
        },
        onSuccess: (updatedProduct) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', String(updatedProduct.id)] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            setEditingProductId(null);
            setStockInput('');
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Could not update stock.");
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (productId) => {
            await api.delete(`/products/${productId}`);
            return productId;
        },
        onSuccess: (deletedId) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['product', String(deletedId)] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Failed to delete product.");
        }
    });

    const products = data?.data || [];
    const meta = {
        currentPage: data?.meta?.currentPage || 1,
        totalPages: Math.max(1, data?.meta?.totalPages || 0)
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation(); 
        if (!user) {
            alert("Please sign in to add items to your cart!");
            return;
        }

        const cartItem = cart?.items?.find(item => item.productId === product.id);
        const currentQtyInCart = cartItem ? cartItem.quantity : 0;

        if (currentQtyInCart + 1 > product.stock) {
            alert(`Cannot add more. Only ${product.stock} units available in stock.`);
            return;
        }

        setAddingProductId(product.id); 
        addToCartMutation.mutate(product.id);
    };

    const handleDeleteClick = (e, productId) => {
        e.stopPropagation();
        if (window.confirm("Are you sure?")) deleteProductMutation.mutate(productId);
    };

    const handleEditStockClick = (e, product) => {
        e.stopPropagation();
        setEditingProductId(product.id);
        setStockInput(String(product.stock));
    };

    const handleSaveStockClick = (e, productId) => {
        e.stopPropagation();
        updateStockMutation.mutate({ productId, stock: stockInput });
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.filterBar}>
                <input 
                    type="text" 
                    className={styles.searchInput}
                    placeholder="Search products..." 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                />
                
                <select 
                    className={styles.selectInput}
                    value={category} 
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                
                <div className={styles.priceInputs}>
                    <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} />
                    <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} />
                </div>
                
                <select 
                    className={styles.selectInput}
                    onChange={(e) => { const [field, dir] = e.target.value.split('-'); setSortBy(field); setOrder(dir); }}
                >
                    <option value="createdAt-desc">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                </select>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading catalog items...</div>
            ) : products.length === 0 ? (
                <div className={styles.noProducts} style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    No products found.
                </div>
            ) : (
                <div className={styles.grid}>
                    {products.map(product => {
                        const isThisCardAdding = addingProductId === product.id;

                        return (
                            <div key={product.id} className={styles.card} onClick={() => navigate(`/products/${product.id}`)}>
                                <div className={styles.imagePlaceholder}>
                                    {product.imageUrl ? (
                                        <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} className={styles.productImage} />
                                    ) : (
                                        <span className={styles.noImgText}>No Image Available</span>
                                    )}
                                </div>
                                
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeaderRow}>
                                        <span className={styles.categoryBadge}>{product.category}</span>
                                        <span className={`${styles.stockIndicator} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                                            {editingProductId === product.id ? (
                                                <span onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                                                    <input 
                                                        type="number" 
                                                        value={stockInput} 
                                                        onChange={(e) => setStockInput(e.target.value)} 
                                                        style={{ width: '50px', padding: '2px', borderRadius: '4px', border: '1px solid #ccc' }}
                                                    />
                                                    <button onClick={(e) => handleSaveStockClick(e, product.id)} style={{ padding: '2px 6px', cursor: 'pointer' }}>✓</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingProductId(null); }} style={{ padding: '2px 6px', cursor: 'pointer' }}>X</button>
                                                </span>
                                            ) : (
                                                <>
                                                    {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                                                    {user?.role === 'admin' && (
                                                        <button 
                                                            onClick={(e) => handleEditStockClick(e, product)} 
                                                            style={{ marginLeft: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    
                                    <h4 className={styles.productName}>{product.name}</h4>
                                    <p className={styles.productDesc}>{product.description || "No description available."}</p>
                                    
                                    <div className={styles.cardFooter}>
                                        <span className={styles.price}>${product.price.toFixed(2)}</span>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button 
                                                className={styles.addToCartButton}
                                                onClick={(e) => handleAddToCart(e, product)} 
                                                disabled={product.stock <= 0 || isThisCardAdding}
                                            >
                                                {isThisCardAdding ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                                            </button>
                                            {user?.role === 'admin' && (
                                                <button 
                                                    onClick={(e) => handleDeleteClick(e, product.id)} 
                                                    style={{ background: '#fecaca', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                                                    title="Delete Product"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            <div className={styles.pagination}>
                <button 
                    className={styles.pagButton} 
                    disabled={page <= 1} 
                    onClick={() => setPage(p => p - 1)}
                >
                    Prev
                </button>

                <span className={styles.pagInfo}>
                    Page {meta.currentPage} of {meta.totalPages}
                </span>

                <button 
                    className={styles.pagButton} 
                    disabled={page >= meta.totalPages || products.length === 0} 
                    onClick={() => setPage(p => p + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Products;