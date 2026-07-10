import React, { useEffect, useState } from 'react';
import api from "../api/axios.js";
import styles from "./Cart.module.css";

const Cart = () => {
    const [cart, setCart] = useState(null);
    useEffect(() => {
        api.get("/cart")
            .then(res => setCart(res.data))
            .catch(error => console.error("Error pulling cart details", error));
    }, []);
    const handleCheckout = async () => {
        try{
            const orderItems = cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
            const response = await api.post("/orders", {items: orderItems});
            alert("Checkout completely successful! Order recorded.");
            setCart({items: []});
        } catch(error) {
            console.error("Backend error payload:", error.response?.data);
            alert(error.response?.data?.error || "Checkout process failed.");
        }
    }
    if(!cart || cart.items.length == 0)
    {
        return <div className={styles.container}>
            <h3 className={styles.empty}>Your shopping cart is empty.</h3>
        </div>;
    }
    const total = cart.items.reduce((sum, item) => sum+(item.product.price*item.quantity), 0);
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Your shopping cart</h2>
            <div className={styles.list}>
                {
                    cart.items.map(item => (
                        <div key={item.id} className={styles.item}>
                            <div>
                                <span className={styles.itemName}>{item.product.name}</span>
                                <span className={styles.itemMeta}>Quantity: {item.quantity}</span>
                            </div>
                            <span className={styles.price}>${(item.product.price*item.quantity).toFixed(2)}</span>
                        </div>
                    ))
                }
                <div className={styles.checkoutRow}>
                    <div className={styles.total}>Total: ${total.toFixed(2)}</div>
                    <button onClick={handleCheckout} className={styles.checkoutButton}>
                        Complete Order
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Cart;