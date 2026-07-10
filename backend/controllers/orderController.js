const prisma = require("../config/db");

exports.createOrder = async (req, res) => {
    try {
        const { items } = req.body;
        
        const customerEmail = req.user?.email; 

        if (!customerEmail || !items || items.length === 0) {
            return res.status(400).json({ error: "Your shopping cart is empty or email is missing." });
        }

        const finalizedOrder = await prisma.$transaction(async (tx) => {
            let totalAmount = 0;
            const orderItemsPayload = [];

            for (const item of items) {
                const product = await tx.product.findUnique({
                    where: { id: parseInt(item.productId) }
                });

                if (!product) {
                    throw new Error(`Product ID ${item.productId} no longer exists in our catalog`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Sorry, "${product.name}" only has ${product.stock} units left in stock`);
                }

                await tx.product.update({
                    where: { id: product.id },
                    data: { stock: product.stock - item.quantity }
                });

                totalAmount += product.price * item.quantity;
                
                orderItemsPayload.push({
                    productId: product.id,
                    quantity: item.quantity,
                    priceAtPurchase: product.price
                });
            }

            return await tx.order.create({
                data: {
                    customerEmail,
                    totalAmount,
                    items: {
                        create: orderItemsPayload
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });
        });

        await prisma.cart.update({
            where: { customerEmail },
            data: { items: { deleteMany: {} } }
        });

        res.status(201).json({
            message: "Checkout successful! Your order has been placed.",
            order: finalizedOrder
        });

    } catch (error) {
        res.status(400).json({ error: error.message || "An unexpected error occurred during processing." });
    }
};