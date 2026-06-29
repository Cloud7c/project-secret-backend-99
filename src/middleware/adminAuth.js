import protect from './auth.js';

const adminAuth = (req, res, next) => {
    // First, run the normal auth middleware to verify the token
    protect(req, res, () => {
        // Now req.user is populated by the protect middleware
        if (req.user && req.user.is_admin === true) {
            next(); // User is an admin, let them proceed
        } else {
            res.status(403).json({
                error: 'Forbidden. You do not have administrator privileges.'
            });
        }
    });
};

export default adminAuth;
