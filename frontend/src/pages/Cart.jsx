import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../api/axios.js";
import styles from "./Cart.module.css";

const Cart = () => {
    const queryClient = useQueryClient();

    const { data: cart, isLoading, isError } = useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            const res = await api.get("/cart");
            return res.data;
        }
    });

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ productId, quantity }) => {
            const res = await api.put(`/cart/${productId}`, { quantity });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            console.error("Backend update failure:", error.response?.data);
            alert(error.response?.data?.error || "Could not update quantity.");
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: async (productId) => {
            const res = await api.delete(`/cart/${productId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (error) => {
            console.error("Backend deletion failure:", error.response?.data);
            alert(error.response?.data?.error || "Could not remove item.");
        }
    });

    const checkoutMutation = useMutation({
        mutationFn: async (orderItems) => {
            const res = await api.post("/orders", { items: orderItems });
            return res.data;
        },
        onSuccess: () => {
            alert("Checkout completely successful! Order recorded.");
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
        onError: (error) => {
            console.error("Checkout submission failure:", error.response?.data);
            alert(error.response?.data?.error || "Checkout process failed.");
        }
    });

    const handleQuantityChange = (item, direction) => {
        const currentQuantity = item.quantity;
        const newQuantity = direction === 'plus' ? currentQuantity + 1 : currentQuantity - 1;

        if (direction === 'plus' && item.product && newQuantity > item.product.stock) {
            alert(`Cannot add more. Only ${item.product.stock} units available in stock.`);
            return;
        }

        if (newQuantity < 1) {
            removeItemMutation.mutate(item.productId);
        } else {
            updateQuantityMutation.mutate({ productId: item.productId, quantity: newQuantity });
        }
    };

    const handleCheckout = () => {
        if (!cart?.items) return;

        const invalidItem = cart.items.find(item => item.isOutOfStock || item.exceedsStock);
        if (invalidItem) {
            alert(`Please adjust item quantities. "${invalidItem.product?.name || 'An item'}" exceeds current stock.`);
            return;
        }

        const orderItems = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }));
        checkoutMutation.mutate(orderItems);
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <h3 className={styles.empty}>🛒 Loading your shopping cart...</h3>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={styles.container}>
                <h3 className={styles.empty}>Error loading cart. Please try logging back in.</h3>
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.empty}>Your shopping cart is empty.</h3>
            </div>
        );
    }

    const hasStockIssue = cart.items.some(item => item.isOutOfStock || item.exceedsStock);
    const total = cart.items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your shopping cart</h2>
            <div className={styles.list}>
                {
                    cart.items.map(item => {
                        const stock = item.availableStock ?? 0;
                        const isOutOfStock = item.isOutOfStock;
                        const exceedsStock = item.exceedsStock;

                        return (
                            <div key={item.id} className={`${styles.item} ${isOutOfStock || exceedsStock ? styles.itemWarning : ''}`}>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>
                                        {item.product?.name || "Product Unavailable"}
                                    </span>

                                    {isOutOfStock && (
                                        <p style={{ color: 'red', margin: '4px 0', fontSize: '0.85rem' }}>
                                            ❌ Out of stock! Please remove this item to proceed.
                                        </p>
                                    )}
                                    {!isOutOfStock && exceedsStock && (
                                        <p style={{ color: 'orange', margin: '4px 0', fontSize: '0.85rem' }}>
                                            ⚠️ Only {stock} left in stock. Please lower your quantity.
                                        </p>
                                    )}

                                    <div className={styles.quantityControls}>
                                        <button 
                                            className={styles.qtyBtn}
                                            onClick={() => handleQuantityChange(item, 'minus')}
                                            disabled={updateQuantityMutation.isPending || removeItemMutation.isPending}
                                        >
                                            -
                                        </button>
                                        <span className={styles.itemMeta}>{item.quantity}</span>
                                        <button 
                                            className={styles.qtyBtn}
                                            onClick={() => handleQuantityChange(item, 'plus')}
                                            disabled={
                                                updateQuantityMutation.isPending || 
                                                removeItemMutation.isPending || 
                                                item.quantity >= stock
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={styles.itemActions}>
                                    <span className={styles.price}>
                                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                    </span>
                                    <button 
                                        className={styles.removeButton}
                                        onClick={() => removeItemMutation.mutate(item.productId)}
                                        disabled={removeItemMutation.isPending}
                                    >
                                        {removeItemMutation.isPending ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                }
                <div className={styles.checkoutRow}>
                    <div className={styles.total}>Total: ${total.toFixed(2)}</div>
                    <button 
                        onClick={handleCheckout} 
                        className={styles.checkoutButton}
                        disabled={checkoutMutation.isPending || hasStockIssue}
                    >
                        {checkoutMutation.isPending ? 'Processing...' : 'Complete Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;