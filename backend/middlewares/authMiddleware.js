const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                error: 'No token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false,
            error: 'Invalid token' 
        });
    }
};

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                details: `Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole
}; 