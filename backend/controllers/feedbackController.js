const Feedback = require('../models/Feedback');

// POST /api/products/:id/reviews
exports.addFeedback = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        
        const userId = req.user.id; 
        const username = req.user.name || "Anonymous"; 

        const newFeedback = await Feedback.create({
            productId,
            userId,
            username,
            rating: Number(rating),
            comment: comment
        });

        res.status(201).json({ message: 'Feedback submitted successfully!', feedback: newFeedback });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save feedback' });
    }
};

// GET /api/products/:id/reviews
exports.getProductFeedback = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        const reviews = await Feedback.find({ productId }).sort({ createdAt: -1 });
        
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};