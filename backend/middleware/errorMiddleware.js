const errorHandler = (err, req, res, next) => {
    console.error("💥 Error Intercepted:", err);

    if (err.code && err.code.startsWith('P2')) {
        if (err.code === 'P2025') {
            return res.status(404).json({ error: "Record to update or delete does not exist." });
        }
        return res.status(400).json({ error: `Database error code: ${err.code}` });
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(el => el.message);
        return res.status(400).json({ error: `Validation failed: ${messages.join(', ')}` });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ error: `Invalid database ID format for field: ${err.path}` });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || "An unexpected server error occurred."
    });
};

module.exports = errorHandler;