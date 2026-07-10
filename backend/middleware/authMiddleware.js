const jwt = require("jsonwebtoken");

exports.protect = async(req, res, next) => {
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];
        }
        if(!token){
            return res.status(401).json({error: "Access denied. No authentication token provided."});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        req.user = decoded;
        next();
    } catch(error) {
    console.log("💥 Auth Middleware Failed Because:", error.message); 
    return res.status(401).json({error: "Session expired or invalid authentication token."});
}
}
exports.restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden. You do not have permission keys for this resource." });
        }
        next();
    };
};