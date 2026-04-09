const authService = require('../service/auth.service.js');
const generateTokenAndSetCookie = require('../utilis/generateTokenAndSetCookie.js');

exports.signUpAdmin = async (req, res) => {
    try {
        const { name, email, password, employeeId } = req.body;

        const admin = await authService.signUpAdmin({ name, email, password, employeeId });

        res.status(201).json({
            message: 'Admin registered successfully',
            admin
        });
    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({ message: error.message || 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await authService.login({ email, password });

        // Generate token and set cookie
        generateTokenAndSetCookie(res, user.id, user.role);

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        await authService.forgotPassword({ email });

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        await authService.resetPassword({ token, password });

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(error.status || 400).json({ success: false, message: error.message });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        const user = await authService.checkAuth(req.user._id);

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in checkAuth:", error.message);
        res.status(error.status || 500).json({ success: false, message: error.message || "Server error" });
    }
};
