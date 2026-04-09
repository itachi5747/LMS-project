const User = require('../models/user.model');
const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    try {
        // Try to get token from cookies first (for frontend)
        let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        
        // If no cookie token, try Authorization header (for Postman)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "No token provided. Please login first." 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token" 
            });
        }

        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: "Account is inactive" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ 
            success: false, 
            message: "Invalid token" 
        });
    }
};

module.exports = { verifyToken };