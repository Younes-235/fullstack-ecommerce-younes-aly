const prisma = require("../config/db");

// POST /api/cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const customerEmail = req.user.email; 

        if (!productId || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prodId = parseInt(productId, 10);
        const quan = parseInt(quantity, 10);
        
        const product = await prisma.product.findUnique({ where: { id: prodId } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (product.stock <= 0) {
            return res.status(400).json({ error: "This product is currently out of stock." });
        }

        const cart = await prisma.cart.upsert({
            where: { customerEmail: customerEmail },
            update: {},
            create: { customerEmail: customerEmail }
        });

        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: { cartId: cart.id, productId: prodId }
            }
        });

        const currentInCart = existingItem ? existingItem.quantity : 0;
        const requestedTotal = currentInCart + quan;

        if (product.stock < requestedTotal) {
            return res.status(400).json({ 
                error: `Cannot add ${quan} more. You already have ${currentInCart} in your cart, and only ${product.stock} are available.` 
            });
        }

        const cartItem = await prisma.cartItem.upsert({
            where: {
                cartId_productId: { cartId: cart.id, productId: prodId }
            },
            update: {
                quantity: { increment: quan }
            },
            create: {
                cartId: cart.id,
                productId: prodId,
                quantity: quan
            }
        });

        res.status(200).json({ message: "Item added to cart successfully", cartItem });
    }
    catch (error) {
        console.error("Add to cart error details:", error); 
        res.status(500).json({ error: "Failed to update shopping cart." });
    }
};

// GET /api/cart
exports.getCart = async (req, res) => {
    try {
        const customerEmail = req.user.email; 

        const cart = await prisma.cart.findUnique({
            where: { customerEmail: customerEmail },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart) return res.status(200).json({ items: [] });

        const validatedItems = cart.items.map(item => {
            const stock = item.product?.stock ?? 0;
            const isOutOfStock = stock <= 0;
            const exceedsStock = item.quantity > stock;

            return {
                ...item,
                isOutOfStock,
                exceedsStock,
                availableStock: stock
            };
        });

        res.status(200).json({
            ...cart,
            items: validatedItems
        });
    } catch (error) {
        console.error("Get cart error details:", error);
        res.status(500).json({ error: "Failed to retrieve cart data." });
    }
};

// PUT /api/cart/:productId
exports.updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const customerEmail = req.user.email;

        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" });
        }

        const prodId = parseInt(productId, 10);
        const newQuantity = parseInt(quantity, 10);

        const cart = await prisma.cart.findUnique({
            where: { customerEmail: customerEmail }
        });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        const product = await prisma.product.findUnique({ where: { id: prodId } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (product.stock <= 0) {
            return res.status(400).json({ error: "This product is currently out of stock." });
        }

        if (product.stock < newQuantity) {
            return res.status(400).json({ error: `Only ${product.stock} units are left in stock.` });
        }

        const updatedItem = await prisma.cartItem.update({
            where: {
                cartId_productId: { cartId: cart.id, productId: prodId }
            },
            data: { quantity: newQuantity }
        });

        res.status(200).json({ message: "Cart quantity updated successfully", updatedItem });
    } catch (error) {
        console.error("Update cart quantity error details:", error);
        res.status(500).json({ error: "Failed to update item quantity." });
    }
};

// DELETE /api/cart/:productId
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerEmail = req.user.email;
        const prodId = parseInt(productId, 10);

        const cart = await prisma.cart.findUnique({
            where: { customerEmail: customerEmail }
        });
        if (!cart) return res.status(404).json({ error: "Cart not found" });

        await prisma.cartItem.delete({
            where: {
                cartId_productId: { cartId: cart.id, productId: prodId }
            }
        });

        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        console.error("Remove from cart error details:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Item not found in your cart." });
        }
        res.status(500).json({ error: "Failed to remove item from cart." });
    }
};