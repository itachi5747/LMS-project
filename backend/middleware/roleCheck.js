/**
 * Role-based access control middleware
 * These middleware functions check if the authenticated user has the required role
 */

/**
 * Generic role checker - checks if user has any of the allowed roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure user is attached to request (must be used after verifyToken)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Require head of department role
 */
const requireHeadDept = requireRole('headDept');

/**
 * Require instructor role (includes headDept since they can also teach)
 */
const requireInstructor = requireRole('instructor', 'headDept');

/**
 * Require student role
 */
const requireStudent = requireRole('student');

/**
 * Require admin or headDept role (for management functions)
 */
const requireAdminOrHead = requireRole('admin', 'headDept');

module.exports = {
    requireRole,
    requireAdmin,
    requireHeadDept,
    requireInstructor,
    requireStudent,
    requireAdminOrHead
};
