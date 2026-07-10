const prisma = require("../config/db");

// POST /api/cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        
        const customerEmail = req.user.email; 

        if (!productId || !quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const prodId = parseInt(productId), quan = parseInt(quantity);
        
        const product = await prisma.product.findUnique({ where: { id: prodId } });
        if (!product) return res.status(404).json({ error: "Product not found" });
        if (product.stock < quan) return res.status(400).json({ error: "Not enough stock available." });

        const cart = await prisma.cart.upsert({
            where: {
                customerEmail: customerEmail
            },
            update: {},
            create: {
                customerEmail: customerEmail
            }
        });

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
}

// GET /api/cart
exports.getCart = async (req, res) => {
    try {
        const customerEmail = req.user.email; 

        const cart = await prisma.cart.findUnique({
            where: {
                customerEmail: customerEmail
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!cart) return res.status(200).json({ items: [] });
        res.status(200).json(cart);
    } catch (error) {
        console.error("Get cart error details:", error);
        res.status(500).json({ error: "Failed to retrieve cart data." });
    }
}