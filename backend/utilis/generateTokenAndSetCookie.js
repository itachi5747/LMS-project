const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateTokenAndSetCookie = (res, userId, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const payload = { userId: userId.toString(), role };
    console.log('Generating token for:', payload);
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Simple development-friendly cookie settings
    const cookieOptions = {
        httpOnly: true,
        secure: false,      // Set to false for development (no HTTPS required)
        sameSite: 'lax',    // Works well for development
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    };

    console.log('Setting cookie with options:', cookieOptions);

    res.cookie("token", token, cookieOptions);
    console.log('Cookie set successfully');
    
    return token;
};

module.exports = generateTokenAndSetCookie;