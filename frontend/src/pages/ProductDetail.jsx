import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../AuthContext';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');

    const [isEditingStock, setIsEditingStock] = useState(false);
    const [stockInput, setStockInput] = useState('');

    const { data: product, isLoading: isProductLoading, error: productErr } = useQuery({
        queryKey: ['product', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}`);
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

    const { data: feedbacks = [], isLoading: isReviewsLoading } = useQuery({
        queryKey: ['reviews', id],
        queryFn: async () => {
            const res = await api.get(`/products/${id}/reviews`);
            return res.data;
        }
    });

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/cart', { productId: product.id, quantity: 1 });
            return res.data;
        },
        onSuccess: () => {
            alert("Item added to cart successfully!");
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Could not add item to cart.");
        }
    });

    const updateStockMutation = useMutation({
        mutationFn: async (newStock) => {
            const res = await api.patch(`/products/${id}`, { stock: Number(newStock) });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['product', id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
            setIsEditingStock(false);
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Failed to update stock quantity.");
        }
    });

    const reviewMutation = useMutation({
        mutationFn: async (reviewData) => {
            const res = await api.post(`/products/${id}/reviews`, reviewData);
            return res.data.feedback;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', id] });
            setNewComment('');
            setNewRating(5);
        },
        onError: (error) => {
            alert(error.response?.data?.error || "Failed to submit feedback.");
        }
    });

    const handleAddToCart = () => {
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

        addToCartMutation.mutate();
    };

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        reviewMutation.mutate({
            rating: Number(newRating),
            comment: newComment.trim()
        });
    };

    const startEditingStock = () => {
        setStockInput(String(product.stock));
        setIsEditingStock(true);
    };

    const handleSaveStock = (e) => {
        e.preventDefault();
        updateStockMutation.mutate(stockInput);
    };

    if (isProductLoading || isReviewsLoading) {
        return <div className={styles.loading}>Loading product information...</div>;
    }

    if (productErr || !product) {
        return <div className={styles.error}>Product not found. <button onClick={() => navigate(-1)}>Go Back</button></div>;
    }

    return (
        <div className={styles.container}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>&larr; Back to Catalog</button>
            
            <div className={styles.mainLayout}>
                <div className={styles.imageSection}>
                    {product.imageUrl ? (
                        <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} />
                    ) : (
                        <div className={styles.noImage}>No Image Available</div>
                    )}
                </div>

                <div className={styles.infoSection}>
                    <span className={styles.badge}>{product.category}</span>
                    <h1 className={styles.title}>{product.name}</h1>
                    <p className={styles.price}>${product.price.toFixed(2)}</p>
                    
                    <div className={styles.stockStatus}>
                        Status:{' '}
                        {isEditingStock ? (
                            <form onSubmit={handleSaveStock} style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', marginLeft: '10px' }}>
                                <input 
                                    type="number" 
                                    value={stockInput} 
                                    onChange={(e) => setStockInput(e.target.value)}
                                    style={{ width: '70px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc' }}
                                />
                                <button type="submit" disabled={updateStockMutation.isPending} style={{ padding: '4px 10px', cursor: 'pointer', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>
                                    {updateStockMutation.isPending ? '...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setIsEditingStock(false)} style={{ padding: '4px 10px', cursor: 'pointer', background: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
                            </form>
                        ) : (
                            <>
                                <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                                    {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
                                </span>
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={startEditingStock}
                                        style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff' }}
                                    >
                                        Edit Stock
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    <p className={styles.description}>{product.description}</p>

                    <button 
                        className={styles.cartBtn} 
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0 || addToCartMutation.isPending}
                    >
                        {addToCartMutation.isPending ? 'Adding...' : product.stock > 0 ? 'Add to Shopping Cart' : 'Sold Out'}
                    </button>
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.reviewsSection}>
                <h2>Customer Ratings & Feedback</h2>
                {user ? (
                    <form onSubmit={handleSubmitFeedback} className={styles.feedbackForm}>
                        <h3>Share Your Experience</h3>
                        <div className={styles.formRow}>
                            <label>Rating: </label>
                            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
                                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r}/5</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <textarea 
                                placeholder="What did you think about this product? Share details..." 
                                value={newComment} 
                                onChange={(e) => setNewComment(e.target.value)} 
                                rows="4"
                            />
                        </div>
                        <button type="submit" className={styles.submitReviewBtn} disabled={reviewMutation.isPending}>
                            {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <p className={styles.loginNotice}>Please log in to leave an evaluation or rating.</p>
                )}

                <div className={styles.reviewsList}>
                    {feedbacks.length === 0 ? (
                        <p className={styles.noReviews}>No user reviews listed yet.</p>
                    ) : (
                        feedbacks.map(review => (
                            <div key={review._id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <strong>{review.username}</strong>
                                    <span className={styles.stars}>{'⭐'.repeat(review.rating)}</span>
                                </div>
                                <p className={styles.reviewBody}>{review.comment}</p>
                                <span className={styles.reviewDate}>
                                    Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;